import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  OrderItemStatus,
  OrderStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from '../../gateways/kitchen.gateway';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';

const KITCHEN_VISIBLE_STATUSES: OrderItemStatus[] = [
  OrderItemStatus.PENDING,
  OrderItemStatus.COOKING,
  OrderItemStatus.READY,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const table = await tx.table.findUnique({ where: { id: dto.tableId } });
      if (!table) {
        throw new NotFoundException('Table not found');
      }

      const session =
        (await tx.diningSession.findFirst({
          where: { tableId: dto.tableId, status: 'OPEN' },
          orderBy: { startTime: 'desc' },
        })) ??
        (await tx.diningSession.create({
          data: {
            sessionCode: `SES-${Date.now()}-${table.tableNumber.replace(/\s+/g, '-')}`,
            tableId: dto.tableId,
            openedById: dto.waiterId,
            customerCount: 1,
            status: 'OPEN',
          },
        }));

      await tx.table.update({
        where: { id: dto.tableId },
        data: { status: 'OCCUPIED' },
      });

      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: dto.items.map((item) => item.menuItemId) } },
      });
      const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

      let totalAmount = new Prisma.Decimal(0);
      const orderItems = dto.items.map((item) => {
        const menuItem = menuItemMap.get(item.menuItemId);
        if (!menuItem) {
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        }
        if (!menuItem.isAvailable) {
          throw new BadRequestException(`${menuItem.name} is currently unavailable`);
        }

        totalAmount = totalAmount.add(menuItem.price.mul(item.quantity));

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          costPrice: menuItem.costPrice,
          notes: item.note,
          itemStatus: OrderItemStatus.PENDING,
        };
      });

      return tx.order.create({
        data: {
          orderCode: `#${Date.now().toString().slice(-6)}`,
          sessionId: session.id,
          waiterId: dto.waiterId,
          status: OrderStatus.CONFIRMED,
          totalAmount,
          orderItems: { create: orderItems },
        },
        include: this.orderInclude(),
      });
    });

    const payload = this.toOrder(order);
    this.kitchenGateway.emitKitchenQueueUpdated(payload);
    return payload;
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toOrder(order);
  }

  async getActiveByTable(tableId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        session: { tableId, status: 'OPEN' },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] },
      },
      include: this.orderInclude(),
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      throw new NotFoundException('Active order not found');
    }

    return this.toOrder(order);
  }

  async addItems(orderId: string, dto: AddOrderItemsDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });
      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: dto.items.map((item) => item.menuItemId) } },
      });
      const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

      let addedTotal = new Prisma.Decimal(0);
      const orderItems = dto.items.map((item) => {
        const menuItem = menuItemMap.get(item.menuItemId);
        if (!menuItem) {
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        }
        if (!menuItem.isAvailable) {
          throw new BadRequestException(`${menuItem.name} is currently unavailable`);
        }

        addedTotal = addedTotal.add(menuItem.price.mul(item.quantity));

        return {
          orderId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          costPrice: menuItem.costPrice,
          notes: item.note,
          itemStatus: OrderItemStatus.PENDING,
        };
      });

      await tx.orderItem.createMany({ data: orderItems });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          totalAmount: { increment: addedTotal },
        },
        include: this.orderInclude(),
      });
    });

    const payload = this.toOrder(order);
    this.kitchenGateway.emitKitchenQueueUpdated(payload);
    return payload;
  }

  async getKitchenQueue() {
    const items = await this.prisma.orderItem.findMany({
      where: {
        itemStatus: { in: KITCHEN_VISIBLE_STATUSES },
        order: {
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] },
          session: { status: 'OPEN' },
        },
      },
      include: this.kitchenQueueInclude(),
      orderBy: [
        { isPriority: 'desc' },
        { order: { createdAt: 'asc' } },
        { id: 'asc' },
      ],
    });

    return items.map((item) => this.toKitchenOrderItem(item));
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemStatusDto,
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
        include: {
          menuItem: { include: { recipes: true } },
          order: { include: { session: { include: { table: true } } } },
        },
      });

      if (!existing) {
        throw new NotFoundException('Order item not found');
      }

      if (existing.itemStatus === OrderItemStatus.SERVED) {
        throw new BadRequestException('Served items can no longer be changed by kitchen');
      }

      if (dto.status === OrderItemStatus.COOKING && existing.itemStatus !== OrderItemStatus.COOKING) {
        await this.consumeRecipeStock(tx, existing);
      }

      const item = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          itemStatus: dto.status,
          rejectionReason:
            dto.status === OrderItemStatus.REJECTED
              ? dto.rejectionReason ?? dto.rejectedReason ?? 'Rejected by kitchen'
              : null,
        },
        include: this.kitchenQueueInclude(),
      });

      await this.syncOrderStatus(tx, orderId);
      return item;
    });

    const payload = this.toKitchenOrderItem(updated);
    this.kitchenGateway.emitOrderItemUpdated({
      itemId,
      orderId,
      tableId: payload.tableId,
      status: payload.status,
    });
    this.kitchenGateway.emitKitchenQueueUpdated(payload);
    this.kitchenGateway.emitInventoryUpdated({ orderId, itemId });

    return payload;
  }

  async prioritizeItem(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.update({
      where: { id: itemId, orderId },
      data: { isPriority: true },
      include: this.kitchenQueueInclude(),
    });

    const payload = this.toKitchenOrderItem(item);
    this.kitchenGateway.emitKitchenQueueUpdated(payload);
    return payload;
  }

  private async consumeRecipeStock(
    tx: Prisma.TransactionClient,
    item: Prisma.OrderItemGetPayload<{
      include: {
        menuItem: { include: { recipes: true } };
        order: { include: { session: { include: { table: true } } } };
      };
    }>,
  ) {
    if (item.menuItem.recipes.length === 0) {
      return;
    }

    for (const recipe of item.menuItem.recipes) {
      const inventory = await tx.inventoryItem.findUnique({
        where: { id: recipe.inventoryItemId },
      });

      if (!inventory) {
        throw new BadRequestException('Recipe references a missing inventory item');
      }

      const required = recipe.quantityRequired.mul(item.quantity);
      if (inventory.currentStock.lt(required)) {
        throw new BadRequestException(
          `Insufficient stock for ${inventory.itemName}. Required ${required.toString()} ${inventory.unit}, available ${inventory.currentStock.toString()} ${inventory.unit}`,
        );
      }

      const updatedInventory = await tx.inventoryItem.update({
        where: { id: inventory.id },
        data: { currentStock: { decrement: required } },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: inventory.id,
          orderItemId: item.id,
          movementType: StockMovementType.OUT_COOKING,
          quantity: required.negated(),
          balanceAfter: updatedInventory.currentStock,
          note: `Kitchen consumed for order ${item.order.orderCode} - ${item.menuItem.name}`,
        },
      });
    }
  }

  private async syncOrderStatus(tx: Prisma.TransactionClient, orderId: string) {
    const items = await tx.orderItem.findMany({
      where: { orderId },
      select: { itemStatus: true },
    });

    if (items.length === 0) {
      return;
    }

    const statuses = items.map((item) => item.itemStatus);
    let nextStatus: OrderStatus = OrderStatus.CONFIRMED;

    if (statuses.every((status) => status === OrderItemStatus.SERVED)) {
      nextStatus = OrderStatus.SERVED;
    } else if (
      statuses.some((status) => {
        const activeStatuses: OrderItemStatus[] = [
          OrderItemStatus.COOKING,
          OrderItemStatus.READY,
          OrderItemStatus.SERVED,
        ];
        return activeStatuses.includes(status);
      })
    ) {
      nextStatus = OrderStatus.IN_PROGRESS;
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
  }

  private kitchenQueueInclude() {
    return {
      menuItem: {
        include: {
          category: true,
          recipes: { include: { inventoryItem: true } },
        },
      },
      order: {
        include: {
          waiter: true,
          session: { include: { table: true } },
        },
      },
    } satisfies Prisma.OrderItemInclude;
  }

  private orderInclude() {
    return {
      waiter: true,
      session: { include: { table: true } },
      orderItems: {
        include: {
          menuItem: { include: { category: true } },
        },
        orderBy: { id: 'asc' },
      },
    } satisfies Prisma.OrderInclude;
  }

  private toOrder(order: Prisma.OrderGetPayload<{ include: ReturnType<OrdersService['orderInclude']> }>) {
    return {
      id: order.id,
      orderCode: order.orderCode,
      tableId: order.session.tableId,
      table: order.session.table,
      sessionId: order.sessionId,
      customerId: null,
      waiterId: order.waiterId,
      waiter: order.waiter,
      status: order.status,
      items: order.orderItems.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        menuItemId: item.menuItemId,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          price: Number(item.menuItem.price),
          imageUrl: item.menuItem.imageUrl,
          categoryId: item.menuItem.categoryId,
          category: {
            id: item.menuItem.category.id,
            name: item.menuItem.category.name,
            description: null,
            imageUrl: null,
            sortOrder: item.menuItem.category.displayOrder,
            isActive: item.menuItem.category.isActive,
          },
          isAvailable: item.menuItem.isAvailable,
          preparationTime: this.estimatePrepTime(item.menuItem.category.name),
          tags: item.menuItem.isRecommendable ? ['Recommended'] : [],
          createdAt: '',
          updatedAt: '',
        },
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        note: item.notes,
        status: item.itemStatus,
        rejectedReason: item.rejectionReason,
        isPriority: item.isPriority,
      })),
      subtotal: Number(order.totalAmount),
      discountAmount: 0,
      totalAmount: Number(order.totalAmount),
      paymentMethod: null,
      paidAt: null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.createdAt.toISOString(),
    };
  }

  private estimatePrepTime(categoryName: string) {
    switch (categoryName.toLowerCase()) {
      case 'drink':
        return 5;
      case 'dessert':
        return 8;
      case 'appetizer':
        return 10;
      default:
        return 18;
    }
  }

  private toKitchenOrderItem(
    item: Prisma.OrderItemGetPayload<{ include: ReturnType<OrdersService['kitchenQueueInclude']> }>,
  ) {
    return {
      id: item.id,
      orderId: item.orderId,
      orderCode: item.order.orderCode,
      tableId: item.order.session.tableId,
      tableName: item.order.session.table.tableNumber,
      waiterName: item.order.waiter?.fullName ?? 'Guest',
      menuItemId: item.menuItemId,
      menuItemName: item.menuItem.name,
      categoryName: item.menuItem.category.name,
      quantity: item.quantity,
      note: item.notes,
      status: item.itemStatus,
      rejectionReason: item.rejectionReason,
      isPriority: item.isPriority,
      isAvailable: item.menuItem.isAvailable,
      createdAt: item.order.createdAt.toISOString(),
      recipes: item.menuItem.recipes.map((recipe) => ({
        id: recipe.id,
        inventoryItemId: recipe.inventoryItemId,
        itemName: recipe.inventoryItem.itemName,
        unit: recipe.inventoryItem.unit,
        quantityRequired: Number(recipe.quantityRequired),
        currentStock: Number(recipe.inventoryItem.currentStock),
        minAlertThreshold: Number(recipe.inventoryItem.minAlertThreshold),
      })),
    };
  }
}
