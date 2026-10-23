import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
import { KitchenGateway } from '../../gateways/kitchen.gateway';
import {
  SessionStatus,
  OrderStatus,
  TableStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async createOrder(dto: CreateOrderDto, creatorId?: string) {
    // 1. Lấy thông tin bàn
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    // 2. Tìm DiningSession đang mở. Nếu chưa có thì tự động tạo.
    let session = await this.prisma.diningSession.findFirst({
      where: {
        tableId: dto.tableId,
        status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
      },
    });

    return await this.prisma.$transaction(async (tx) => {
      if (!session) {
        session = await tx.diningSession.create({
          data: {
            sessionCode: `SS-${Date.now()}`,
            tableId: dto.tableId,
            openedById: creatorId, // Có thể là WAITER hoặc undefined (khách tự quét QR)
            status: SessionStatus.OPEN,
          },
        });
        await tx.table.update({
          where: { id: dto.tableId },
          data: { status: TableStatus.OCCUPIED },
        });
      }

      // 3. Lấy thông tin giá món ăn từ DB
      const menuItemIds = dto.items.map((i) => i.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } },
      });
      const menuMap = new Map(menuItems.map((m) => [m.id, m]));

      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData = dto.items.map((item) => {
        const menu = menuMap.get(item.menuItemId);
        if (!menu)
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        if (!menu.isAvailable)
          throw new BadRequestException(
            `Menu item ${menu.name} is currently unavailable`,
          );

        const unitPrice = menu.price;
        const amount = new Prisma.Decimal(item.quantity).mul(unitPrice);
        totalAmount = totalAmount.add(amount);

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          costPrice: menu.costPrice,
          notes: item.note,
        };
      });

      // 4. Tạo Order và OrderItem
      const order = await tx.order.create({
        data: {
          orderCode: `ORD-${Date.now()}`,
          sessionId: session.id,
          waiterId: dto.waiterId || creatorId,
          totalAmount,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: { include: { menuItem: true } } },
      });

      // Emit event cho nhà bếp
      this.kitchenGateway.emitKitchenQueueUpdated({
        orderId: order.id,
        tableId: dto.tableId,
      });

      return order;
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true } },
        session: { include: { table: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getActiveOrderByTable(tableId: string) {
    const session = await this.prisma.diningSession.findFirst({
      where: {
        tableId,
        status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
      },
      orderBy: { startTime: 'desc' },
    });
    if (!session)
      throw new NotFoundException('No active session found for this table');

    const orders = await this.prisma.order.findMany({
      where: { sessionId: session.id, status: { not: OrderStatus.CANCELLED } },
      include: {
        orderItems: { include: { menuItem: true } },
        session: { include: { table: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!orders || orders.length === 0)
      throw new NotFoundException('No active order found for this table');

    if (orders.length === 1) {
      return orders[0];
    }

    // Nếu bàn có nhiều đơn (VD: Đơn món đặt trước + Đơn gọi thêm tại bàn), gộp tất cả món
    const allItems = orders.flatMap((o) => o.orderItems);
    const totalAmount = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const latestOrder = orders[orders.length - 1];

    return {
      ...latestOrder,
      totalAmount,
      orderItems: allItems,
    };
  }

  async getKitchenQueue() {
    const items = await this.prisma.orderItem.findMany({
      where: {
        itemStatus: { in: ['PENDING', 'COOKING'] },
        order: { status: { not: OrderStatus.CANCELLED } },
      },
      include: {
        menuItem: { include: { category: true } },
        order: {
          include: {
            session: { include: { table: true } },
            waiter: true,
          },
        },
      },
      orderBy: { order: { createdAt: 'asc' } },
    });

    // In-memory sort cho isPriority (nếu DB chưa update schema)
    items.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return 0;
    });

    return items.map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      orderCode: item.order.orderCode,
      tableId: item.order.session.tableId,
      tableName: item.order.session.table?.tableNumber || '',
      waiterName: item.order.waiter?.fullName || '',
      menuItemId: item.menuItemId,
      menuItemName: item.menuItem.name,
      categoryName: item.menuItem.category?.name || '',
      quantity: item.quantity,
      note: item.notes,
      status: item.itemStatus,
      rejectionReason: item.rejectionReason,
      isPriority: item.isPriority,
      isAvailable: item.menuItem.isAvailable,
      createdAt: item.order.createdAt,
    }));
  }

  async getPendingPaymentOrders() {
    return this.prisma.order
      .findMany({
        where: {
          status: {
            in: [
              OrderStatus.COMPLETED,
              OrderStatus.SERVED,
              OrderStatus.IN_PROGRESS,
            ],
          },
        },
        include: { session: { include: { bills: true, table: true } } },
      })
      .then((orders) =>
        orders.filter((o) => !o.session.bills.some((b) => b.status === 'PAID')),
      );
  }

  async addItems(orderId: string, dto: AddOrderItemsDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { session: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.status !== OrderStatus.CREATED &&
      order.status !== OrderStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Cannot add items to completed or cancelled order',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const menuItemIds = dto.items.map((i) => i.menuItemId);
      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } },
      });
      const menuMap = new Map(menuItems.map((m) => [m.id, m]));

      let additionalAmount = new Prisma.Decimal(0);
      const orderItemsData = dto.items.map((item) => {
        const menu = menuMap.get(item.menuItemId);
        if (!menu)
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        if (!menu.isAvailable)
          throw new BadRequestException(
            `Menu item ${menu.name} is currently unavailable`,
          );

        const unitPrice = menu.price;
        additionalAmount = additionalAmount.add(
          new Prisma.Decimal(item.quantity).mul(unitPrice),
        );

        return {
          orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          costPrice: menu.costPrice,
          notes: item.note,
        };
      });

      await tx.orderItem.createMany({ data: orderItemsData });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: { increment: additionalAmount },
          status: OrderStatus.IN_PROGRESS, // Chuyển trạng thái order sang IN_PROGRESS nếu có món mới
        },
        include: { orderItems: { include: { menuItem: true } } },
      });

      this.kitchenGateway.emitKitchenQueueUpdated({
        orderId,
        tableId: order.session.tableId,
      });

      return updatedOrder;
    });
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemStatusDto,
  ) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { session: true } } },
    });
    if (!item) throw new NotFoundException('Order item not found');
    if (item.orderId !== orderId)
      throw new BadRequestException('Item does not belong to this order');

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        itemStatus: dto.status,
        rejectionReason: dto.rejectionReason || dto.rejectedReason,
      },
    });

    this.kitchenGateway.emitOrderItemUpdated({
      itemId,
      orderId,
      tableId: item.order.session.tableId,
      status: dto.status,
    });

    return updated;
  }

  async prioritizeItem(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Order item not found');
    if (item.orderId !== orderId)
      throw new BadRequestException('Item does not belong to this order');

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { isPriority: true },
    });

    return updated;
  }

  async cancelItem(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { session: true } } },
    });
    if (!item) throw new NotFoundException('Order item not found');
    if (item.orderId !== orderId)
      throw new BadRequestException('Item does not belong to this order');

    // Chuyển status thành REJECTED thay vì xoá cứng (ko có CANCELLED trong OrderItemStatus)
    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        itemStatus: 'REJECTED',
        rejectionReason: 'Khách huỷ',
      },
    });

    this.kitchenGateway.emitOrderItemUpdated({
      itemId,
      orderId,
      tableId: item.order.session.tableId,
      status: 'REJECTED',
    });

    return updated;
  }

  async cancelOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { session: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    this.kitchenGateway.emitKitchenQueueUpdated({
      orderId: id,
      tableId: order.session.tableId,
      cancelled: true,
    });
    return updated;
  }

  async voidOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { session: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    this.kitchenGateway.emitKitchenQueueUpdated({
      orderId: id,
      tableId: order.session.tableId,
      cancelled: true,
    });
    return updated;
  }
}
