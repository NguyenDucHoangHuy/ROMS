import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ReservationStatus,
  RoleName,
  SessionStatus,
  TableStatus,
  OrderStatus,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';

@Injectable()
export class CashierService {
  constructor(private readonly prisma: PrismaService) {}

  async validateDemoCashierIdentity(userId?: string): Promise<string> {
    if (!userId) {
      throw new ForbiddenException(
        'Set CASHIER_DEMO_CASHIER_ID to an existing local cashier account to enable demo writes',
      );
    }

    const cashier = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });
    const hasAllowedCashierRole =
      cashier?.role.name === RoleName.CASHIER ||
      cashier?.role.name === RoleName.MANAGER ||
      cashier?.role.name === RoleName.ADMIN;
    if (!cashier?.isActive || !hasAllowedCashierRole) {
      throw new ForbiddenException(
        'CASHIER_DEMO_CASHIER_ID must identify an active cashier, manager, or admin account',
      );
    }

    return cashier.id;
  }

  async validateDemoRefundApprover(userId?: string): Promise<string> {
    if (!userId) {
      throw new ForbiddenException(
        'Set CASHIER_DEMO_REFUND_APPROVER_ID to an existing local manager account to enable demo refunds',
      );
    }

    return this.getApprovedManagerId(userId);
  }

  async getTables() {
    const tables = await this.prisma.table.findMany({
      include: {
        diningSessions: {
          where: {
            status: {
              in: [SessionStatus.OPEN, SessionStatus.PAYING],
            },
          },
          orderBy: { startTime: 'desc' },
          take: 1,
          include: {
            reservation: true,
            orders: {
              where: { status: { not: OrderStatus.CANCELLED } },
              orderBy: { createdAt: 'desc' },
              include: {
                orderItems: {
                  include: { menuItem: true },
                },
              },
            },
            bills: {
              where: { status: BillStatus.UNPAID },
              orderBy: { createdAt: 'desc' },
              include: { promotion: true },
            },
          },
        },
        reservations: {
          where: {
            status: ReservationStatus.CONFIRMED,
            reservationTime: { gte: new Date() },
          },
          orderBy: { reservationTime: 'desc' },
          take: 1,
        },
      },
      orderBy: { tableNumber: 'asc' },
    });

    return tables.map((table) => {
      const activeSession = table.diningSessions[0];
      const activeOrders = activeSession?.orders ?? [];
      const activeOrder = activeOrders[0];
      const unpaidBill = activeSession?.bills[0];
      const reservation = table.reservations[0];

      return {
        id: table.id,
        name: table.tableNumber,
        floor: table.floor,
        capacity: table.capacity,
        status: this.mapTableStatus(table.status),
        guests: activeSession?.customerCount ?? 0,
        total: activeOrders.reduce(
          (sum, order) => sum + this.toNumber(order.totalAmount),
          0,
        ),
        unpaidBill: unpaidBill
          ? {
              id: unpaidBill.id,
              billCode: unpaidBill.billCode,
              subtotalAmount: this.toNumber(unpaidBill.subtotalAmount),
              discountAmount: this.toNumber(unpaidBill.discountAmount),
              finalAmount: this.toNumber(unpaidBill.finalAmount),
              status: unpaidBill.status,
              promotionCode: unpaidBill.promotion?.code ?? null,
            }
          : undefined,
        timer: activeSession
          ? `${this.getMinutesAgo(activeSession.startTime)}m`
          : undefined,
        reservationTime: reservation?.reservationTime
          ? reservation.reservationTime.toISOString()
          : undefined,
        customerName: reservation?.guestName ?? undefined,
        orderId: activeOrder?.orderCode ?? undefined,
        orderItems: activeOrders.flatMap((order) =>
          order.orderItems.map((item) => ({
            id: item.id,
            name: item.menuItem.name,
            note: item.notes ?? undefined,
            quantity: item.quantity,
            price: this.toNumber(item.unitPrice),
            refundable: true,
          })),
        ),
      };
    });
  }

  async getTransactions(input: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    search?: string;
  }) {
    if (
      input.page !== undefined &&
      (!Number.isInteger(input.page) || input.page < 1)
    ) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (
      input.limit !== undefined &&
      (!Number.isInteger(input.limit) || input.limit < 1)
    ) {
      throw new BadRequestException('Limit must be a positive integer');
    }
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(input.limit ?? 20)));
    const from = input.from ? new Date(input.from) : undefined;
    const to = input.to ? new Date(input.to) : undefined;
    if (
      (from && Number.isNaN(from.getTime())) ||
      (to && Number.isNaN(to.getTime()))
    ) {
      throw new BadRequestException(
        'Transaction date filters must be valid dates',
      );
    }
    if (from && to && from > to)
      throw new BadRequestException('The from date must precede the to date');
    const createdAt =
      from || to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;
    const search = input.search?.trim();
    const where: Prisma.PaymentWhereInput = {
      ...(createdAt ? { createdAt } : {}),
      ...(search
        ? {
            OR: [
              { transactionCode: { contains: search, mode: 'insensitive' } },
              { bill: { billCode: { contains: search, mode: 'insensitive' } } },
              {
                bill: {
                  session: {
                    table: {
                      tableNumber: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };
    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          refunds: {
            select: { id: true, amount: true, reason: true, createdAt: true },
          },
          bill: {
            include: {
              session: {
                include: {
                  table: true,
                  orders: {
                    where: { status: { not: OrderStatus.CANCELLED } },
                    include: { orderItems: { include: { menuItem: true } } },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: payments.map((payment) => {
        const amount =
          this.toNumber(payment.amountPaid) -
          this.toNumber(payment.changeAmount);
        const refundAmount = payment.refunds.reduce(
          (sum, refund) => sum + this.toNumber(refund.amount),
          0,
        );
        const status =
          refundAmount <= 0
            ? payment.status
            : refundAmount >= amount
              ? 'REFUNDED'
              : 'PARTIALLY_REFUNDED';

        return {
          id: payment.id,
          transactionCode: payment.transactionCode,
          billId: payment.billId,
          invoiceId: payment.bill.billCode,
          date: this.formatBusinessDate(payment.createdAt),
          time: this.formatBusinessTime(payment.createdAt),
          tableName: payment.bill.session.table.tableNumber,
          paymentMethod: payment.paymentMethod,
          status,
          amount,
          refundAmount,
          items: payment.bill.session.orders.flatMap((order) =>
            order.orderItems.map((item) => ({
              id: item.id,
              name: item.menuItem.name,
              quantity: item.quantity,
              unitPrice: this.toNumber(item.unitPrice),
            })),
          ),
          refunds: payment.refunds.map((refund) => ({
            id: refund.id,
            amount: this.toNumber(refund.amount),
            reason: refund.reason,
            createdAt: refund.createdAt,
          })),
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markTableClean(tableId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.table.updateMany({
        where: { id: tableId, status: TableStatus.CLEANING },
        data: { status: TableStatus.AVAILABLE },
      });
      if (changed.count !== 1) {
        const table = await tx.table.findUnique({
          where: { id: tableId },
          select: { id: true },
        });
        if (!table) throw new NotFoundException('Table not found');
        throw new ConflictException(
          'Only a table awaiting cleaning can be marked clean',
        );
      }
      await this.appendAuditLog(tx, {
        userId,
        action: 'TABLE_MARKED_CLEAN',
        entityName: 'Table',
        entityId: tableId,
        oldValues: { status: TableStatus.CLEANING },
        newValues: { status: TableStatus.AVAILABLE },
      });
      return { tableId, status: 'empty' as const };
    });
  }

  async mergeTables(
    dto: { targetTableId: string; sourceTableIds: string[] },
    userId: string,
  ) {
    const tableIds = [dto.targetTableId, ...dto.sourceTableIds];
    if (new Set(tableIds).size !== tableIds.length) {
      throw new BadRequestException(
        'A table cannot appear more than once in a merge',
      );
    }
    return this.prisma.$transaction(
      async (tx) => {
        const tables = await tx.table.findMany({
          where: { id: { in: tableIds } },
          include: {
            diningSessions: {
              where: {
                status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
              },
              include: { bills: { include: { payments: true } } },
            },
          },
        });
        if (tables.length !== tableIds.length)
          throw new NotFoundException('One or more tables were not found');
        const target = tables.find((table) => table.id === dto.targetTableId)!;
        const sources = dto.sourceTableIds.map((id) =>
          tables.find((table) => table.id === id)!,
        );
        if (
          target.status !== TableStatus.AVAILABLE &&
          target.status !== TableStatus.OCCUPIED
        ) {
          throw new ConflictException(
            'The target table must be available or occupied',
          );
        }
        if (
          sources.some(
            (table) =>
              table.status !== TableStatus.OCCUPIED ||
              table.diningSessions.length !== 1,
          )
        ) {
          throw new ConflictException(
            'Every source table must have exactly one active session',
          );
        }
        if (
          target.status === TableStatus.OCCUPIED &&
          target.diningSessions.length !== 1
        ) {
          throw new ConflictException(
            'The target table has an invalid active session state',
          );
        }
        const activeSessions = [
          ...target.diningSessions,
          ...sources.flatMap((table) => table.diningSessions),
        ];
        if (
          activeSessions.some((session) =>
            session.bills.some(
              (bill) =>
                bill.payments.length || bill.status !== BillStatus.UNPAID,
            ),
          )
        ) {
          throw new ConflictException(
            'Tables with paid or previously split bills cannot be merged',
          );
        }
        const baseSession =
          target.diningSessions[0] ?? sources[0].diningSessions[0];
        const sourceSessions = sources.map((table) => table.diningSessions[0]);
        if (baseSession.tableId !== target.id) {
          await tx.diningSession.update({
            where: { id: baseSession.id },
            data: { tableId: target.id },
          });
        }
        for (const session of activeSessions) {
          for (const bill of session.bills) {
            await tx.bill.update({
              where: { id: bill.id },
              data: { status: BillStatus.VOIDED },
            });
          }
        }
        for (const session of sourceSessions) {
          if (session.id === baseSession.id) continue;
          await tx.order.updateMany({
            where: { sessionId: session.id },
            data: { sessionId: baseSession.id },
          });
          await tx.diningSession.update({
            where: { id: session.id },
            data: { status: SessionStatus.CLOSED, endTime: new Date() },
          });
        }
        await tx.table.update({
          where: { id: target.id },
          data: { status: TableStatus.OCCUPIED },
        });
        await tx.table.updateMany({
          where: { id: { in: sources.map((table) => table.id) } },
          data: { status: TableStatus.AVAILABLE, mergedIntoTableId: target.id },
        });
        await this.appendAuditLog(tx, {
          userId,
          action: 'MERGE_TABLES',
          entityName: 'Table',
          entityId: target.id,
          oldValues: { sourceTableIds: sources.map((table) => table.id) },
          newValues: {
            targetTableId: target.id,
            sourceTableIds: sources.map((table) => table.id),
            sessionId: baseSession.id,
          },
        });
        return {
          targetTableId: target.id,
          sourceTableIds: sources.map((table) => table.id),
          sessionId: baseSession.id,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async getMenu() {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });

    return menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      category: item.category.name,
      price: this.toNumber(item.price),
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      isAvailable: item.isAvailable,
      costPrice: this.toNumber(item.costPrice ?? 0),
    }));
  }

  async getTableOrder(tableId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: {
        diningSessions: {
          where: {
            status: {
              in: [
                SessionStatus.OPEN,
                SessionStatus.PAYING,
                SessionStatus.CLOSED,
              ],
            },
          },
          orderBy: { startTime: 'desc' },
          take: 1,
          include: {
            reservation: true,
            orders: {
              where: { status: { not: OrderStatus.CANCELLED } },
              orderBy: { createdAt: 'desc' },
              include: {
                orderItems: {
                  include: { menuItem: true },
                },
              },
            },
          },
        },
        reservations: {
          orderBy: { reservationTime: 'desc' },
          take: 1,
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const activeSession = table.diningSessions[0] ?? null;
    const activeOrder = activeSession?.orders[0] ?? null;
    const bills = activeSession
      ? await this.prisma.bill.findMany({
          where: { sessionId: activeSession.id },
          include: {
            payments: { include: { refunds: { select: { amount: true } } } },
            promotion: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];
    const payments = bills.flatMap((bill) => bill.payments);

    return {
      table: {
        id: table.id,
        name: table.tableNumber,
        floor: table.floor,
        status: this.mapTableStatus(table.status),
      },
      diningSession: activeSession
        ? {
            id: activeSession.id,
            sessionCode: activeSession.sessionCode,
            status: activeSession.status,
            customerCount: activeSession.customerCount,
            startTime: activeSession.startTime,
            endTime: activeSession.endTime,
          }
        : null,
      order: activeOrder
        ? {
            id: activeOrder.id,
            orderCode: activeOrder.orderCode,
            status: activeOrder.status,
            totalAmount: this.toNumber(activeOrder.totalAmount),
            createdAt: activeOrder.createdAt,
          }
        : null,
      orderItems: (activeSession?.orders ?? []).flatMap((order) =>
        order.orderItems.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: this.toNumber(item.unitPrice),
          notes: item.notes ?? undefined,
          itemStatus: item.itemStatus,
        })),
      ),
      menuItems: await this.prisma.menuItem.findMany({
        where: { isAvailable: true },
        include: { category: true },
      }),
      bills: bills.map((bill) => ({
        id: bill.id,
        billCode: bill.billCode,
        subtotalAmount: this.toNumber(bill.subtotalAmount),
        discountAmount: this.toNumber(bill.discountAmount),
        finalAmount: this.toNumber(bill.finalAmount),
        status: bill.status,
        promotionCode: bill.promotion?.code ?? null,
        payments: bill.payments.map((payment) => ({
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          amountPaid: this.toNumber(payment.amountPaid),
          changeAmount: this.toNumber(payment.changeAmount),
          refundAmount: payment.refunds.reduce(
            (sum, refund) => sum + this.toNumber(refund.amount),
            0,
          ),
          status: payment.status,
        })),
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        billId: payment.billId,
        paymentMethod: payment.paymentMethod,
        amountPaid: this.toNumber(payment.amountPaid),
        changeAmount: this.toNumber(payment.changeAmount),
        refundAmount: payment.refunds.reduce(
          (sum, refund) => sum + this.toNumber(refund.amount),
          0,
        ),
        status: payment.status,
      })),
    };
  }

  async createOrder(dto: CreateOrderDto, userId?: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (table.status !== TableStatus.AVAILABLE) {
      throw new ConflictException('Table is not available for a new order');
    }

    return this.prisma.$transaction(async (tx) => {
      const sessionCode = `SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const diningSession = await tx.diningSession.create({
        data: {
          sessionCode,
          tableId: dto.tableId,
          openedById: dto.waiterId ?? userId ?? null,
          customerCount: dto.customerCount,
          status: SessionStatus.OPEN,
        },
      });

      const order = await tx.order.create({
        data: {
          orderCode,
          sessionId: diningSession.id,
          waiterId: dto.waiterId ?? userId ?? null,
          status: OrderStatus.CREATED,
          totalAmount: new Prisma.Decimal(0),
        },
      });

      await tx.table.update({
        where: { id: dto.tableId },
        data: { status: TableStatus.OCCUPIED },
      });

      await this.appendAuditLog(tx, {
        userId: userId ?? dto.waiterId ?? null,
        action: 'CREATE_ORDER',
        entityName: 'Order',
        entityId: order.id,
        newValues: {
          tableId: dto.tableId,
          sessionId: diningSession.id,
          orderId: order.id,
          customerCount: dto.customerCount,
        },
      });

      return {
        table: {
          id: table.id,
          name: table.tableNumber,
          status: this.mapTableStatus(TableStatus.OCCUPIED),
        },
        diningSession,
        order,
      };
    });
  }

  async addOrderItem(orderId: string, dto: AddOrderItemDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { session: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (!menuItem.isAvailable) {
      throw new BadRequestException('Menu item is not available');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const orderItem = await this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.create({
        data: {
          orderId,
          menuItemId: dto.menuItemId,
          quantity: dto.quantity,
          unitPrice: menuItem.price,
          notes: dto.notes ?? null,
          itemStatus: 'PENDING',
        },
        include: { menuItem: true },
      });

      await this.recalculateOrderTotal(orderId, tx);

      await this.appendAuditLog(tx, {
        userId: userId ?? null,
        action: 'ADD_ORDER_ITEM',
        entityName: 'OrderItem',
        entityId: item.id,
        oldValues: null,
        newValues: {
          orderId,
          menuItemId: dto.menuItemId,
          quantity: dto.quantity,
          unitPrice: this.toNumber(menuItem.price),
        },
      });

      return item;
    });

    return {
      orderItem,
      order: await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      }),
    };
  }

  async updateOrderItem(
    orderItemId: string,
    dto: UpdateOrderItemDto,
    userId?: string,
  ) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (dto.quantity !== undefined && dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const updatedItem = await this.prisma.$transaction(async (tx) => {
      const nextItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
        include: { menuItem: true },
      });

      await this.recalculateOrderTotal(orderItem.orderId, tx);

      await this.appendAuditLog(tx, {
        userId: userId ?? null,
        action: 'UPDATE_ORDER_ITEM',
        entityName: 'OrderItem',
        entityId: orderItemId,
        oldValues: {
          quantity: orderItem.quantity,
          notes: orderItem.notes,
        },
        newValues: {
          quantity: nextItem.quantity,
          notes: nextItem.notes,
        },
      });

      return nextItem;
    });

    return { orderItem: updatedItem };
  }

  async removeOrderItem(orderItemId: string, userId?: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { id: orderItemId } });
      await this.recalculateOrderTotal(orderItem.orderId, tx);

      await this.appendAuditLog(tx, {
        userId: userId ?? null,
        action: 'REMOVE_ORDER_ITEM',
        entityName: 'OrderItem',
        entityId: orderItemId,
        oldValues: {
          orderId: orderItem.orderId,
          quantity: orderItem.quantity,
          unitPrice: this.toNumber(orderItem.unitPrice),
        },
        newValues: null,
      });
    });

    return { success: true, removedOrderItemId: orderItemId };
  }

  async validatePromotion(dto: ValidatePromotionDto) {
    const code = dto.code?.trim();
    if (!code) {
      throw new BadRequestException('Promotion code is required');
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promotion) {
      throw new BadRequestException('Promotion code not found');
    }

    if (!promotion.isActive) {
      throw new BadRequestException('Promotion is inactive');
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new BadRequestException(
        'Promotion is not available in the current date range',
      );
    }

    const subtotal = dto.subtotal ?? 0;
    if (
      promotion.minOrderAmount &&
      subtotal < this.toNumber(promotion.minOrderAmount)
    ) {
      throw new BadRequestException(
        `Minimum order amount for this promotion is ${this.toNumber(promotion.minOrderAmount)}`,
      );
    }

    let discountAmount = 0;

    if (
      promotion.discountPercent !== null &&
      promotion.discountPercent !== undefined
    ) {
      discountAmount = (subtotal * promotion.discountPercent) / 100;
      if (promotion.maxDiscount) {
        discountAmount = Math.min(
          discountAmount,
          this.toNumber(promotion.maxDiscount),
        );
      }
    } else if (
      promotion.discountAmount !== null &&
      promotion.discountAmount !== undefined
    ) {
      discountAmount = this.toNumber(promotion.discountAmount);
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    return {
      promotion: {
        id: promotion.id,
        code: promotion.code,
        description: promotion.description,
        discountPercent: promotion.discountPercent,
        discountAmount: this.toNumber(promotion.discountAmount ?? 0),
        maxDiscount: promotion.maxDiscount
          ? this.toNumber(promotion.maxDiscount)
          : null,
        minOrderAmount: promotion.minOrderAmount
          ? this.toNumber(promotion.minOrderAmount)
          : null,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
      },
      subtotal,
      discountAmount,
      finalAmount,
    };
  }

  async createBill(sessionId: string, dto: CreateBillDto, userId?: string) {
    const session = await this.prisma.diningSession.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            orderItems: {
              include: { menuItem: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Dining session not found');
    }

    if (
      session.status === SessionStatus.CLOSED ||
      session.status === SessionStatus.CANCELLED
    ) {
      throw new ConflictException(
        'Session is already closed and cannot create a new bill',
      );
    }

    const orders = session.orders.filter(
      (order) => order.status !== OrderStatus.CANCELLED,
    );
    const orderItems = orders.flatMap((order) => order.orderItems);

    if (orderItems.length === 0) {
      throw new BadRequestException(
        'No active order items found for this session',
      );
    }

    const subtotal = orderItems.reduce((sum, item) => {
      const price = this.toNumber(item.unitPrice);
      return sum + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    let finalAmount = subtotal;

    const promotionCode = dto.promotionCode?.trim();
    if (promotionCode) {
      const validatedPromotion = await this.validatePromotion({
        code: promotionCode,
        subtotal,
      });
      discountAmount = validatedPromotion.discountAmount;
      finalAmount = validatedPromotion.finalAmount;
    }

    const cashierId = await this.getCashierUserId(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id FROM dining_sessions WHERE id = ${sessionId}::uuid FOR UPDATE
      `;
      const existingBill = await tx.bill.findFirst({
        where: { sessionId, status: BillStatus.UNPAID },
        include: { promotion: true },
      });
      if (existingBill) {
        if (
          (existingBill.promotion?.code ?? null) !==
          (promotionCode?.toUpperCase() ?? null)
        ) {
          throw new ConflictException(
            'An unpaid bill already exists for this session with a different promotion',
          );
        }
        return {
          id: existingBill.id,
          billCode: existingBill.billCode,
          sessionId,
          cashierId: existingBill.cashierId,
          subtotalAmount: this.toNumber(existingBill.subtotalAmount),
          discountAmount: this.toNumber(existingBill.discountAmount),
          finalAmount: this.toNumber(existingBill.finalAmount),
          status: existingBill.status,
          promotionCode: existingBill.promotion?.code ?? null,
          createdAt: existingBill.createdAt,
        };
      }
      const bill = await tx.bill.create({
        data: {
          billCode: `BILL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          sessionId,
          cashierId,
          promotionId: promotionCode
            ? ((
                await tx.promotion.findUnique({
                  where: { code: promotionCode.toUpperCase() },
                })
              )?.id ?? null)
            : null,
          subtotalAmount: new Prisma.Decimal(subtotal),
          discountAmount: new Prisma.Decimal(discountAmount),
          finalAmount: new Prisma.Decimal(finalAmount),
          status: BillStatus.UNPAID,
        },
      });

      await this.appendAuditLog(tx, {
        userId: cashierId,
        action: 'CREATE_BILL',
        entityName: 'Bill',
        entityId: bill.id,
        newValues: {
          sessionId,
          subtotal,
          discountAmount,
          finalAmount,
          promotionCode: promotionCode ?? null,
        },
      });

      return {
        id: bill.id,
        billCode: bill.billCode,
        sessionId: bill.sessionId,
        cashierId: bill.cashierId,
        subtotalAmount: this.toNumber(bill.subtotalAmount),
        discountAmount: this.toNumber(bill.discountAmount),
        finalAmount: this.toNumber(bill.finalAmount),
        status: bill.status,
        promotionCode: promotionCode ?? null,
        createdAt: bill.createdAt,
      };
    });
  }

  async createPayment(dto: CreatePaymentDto, userId?: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: dto.billId },
      include: {
        session: true,
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status !== BillStatus.UNPAID) {
      throw new ConflictException('Only an unpaid bill can receive a payment');
    }

    if (!Number.isFinite(dto.amountPaid) || dto.amountPaid < 0) {
      throw new BadRequestException(
        'Amount paid must be a valid non-negative amount',
      );
    }

    const finalAmount = this.toNumber(bill.finalAmount);
    if (dto.amountPaid < finalAmount) {
      throw new BadRequestException(
        'Amount paid is less than the final bill total',
      );
    }

    const normalizedMethod = this.normalizePaymentMethod(dto.paymentMethod);
    if (
      normalizedMethod !== PaymentMethod.CASH &&
      dto.amountPaid !== finalAmount
    ) {
      throw new BadRequestException(
        'Non-cash payment amount must exactly match the final bill total',
      );
    }
    const cashierId = await this.getCashierUserId(userId);
    const changeAmount = dto.amountPaid - finalAmount;

    return this.prisma.$transaction(async (tx) => {
      const claimedBill = await tx.bill.updateMany({
        where: { id: dto.billId, status: BillStatus.UNPAID },
        data: { status: BillStatus.PAID },
      });
      if (claimedBill.count !== 1) {
        throw new ConflictException('Bill has already received a payment');
      }
      const payment = await tx.payment.create({
        data: {
          billId: dto.billId,
          cashierId,
          paymentMethod: normalizedMethod,
          amountPaid: new Prisma.Decimal(dto.amountPaid),
          changeAmount: new Prisma.Decimal(changeAmount),
          transactionCode:
            dto.transactionCode ??
            `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          status: PaymentStatus.SUCCESS,
        },
      });

      const remainingUnpaidBills = await tx.bill.count({
        where: {
          sessionId: bill.sessionId,
          status: BillStatus.UNPAID,
        },
      });
      const sessionStatus =
        remainingUnpaidBills > 0 ? SessionStatus.PAYING : SessionStatus.CLOSED;
      const tableStatus =
        remainingUnpaidBills > 0 ? TableStatus.OCCUPIED : TableStatus.CLEANING;

      await tx.diningSession.update({
        where: { id: bill.sessionId },
        data: {
          status: sessionStatus,
          ...(remainingUnpaidBills === 0
            ? { endTime: new Date(), closedById: cashierId }
            : {}),
        },
      });

      await tx.table.update({
        where: { id: bill.session.tableId },
        data: { status: tableStatus },
      });

      await this.appendAuditLog(tx, {
        userId: cashierId,
        action: 'PROCESS_PAYMENT',
        entityName: 'Payment',
        entityId: payment.id,
        newValues: {
          billId: dto.billId,
          paymentMethod: normalizedMethod,
          amountPaid: dto.amountPaid,
          changeAmount,
          finalAmount,
          sessionId: bill.sessionId,
        },
      });

      return {
        payment: {
          id: payment.id,
          billId: payment.billId,
          cashierId: payment.cashierId,
          paymentMethod: payment.paymentMethod,
          amountPaid: this.toNumber(payment.amountPaid),
          changeAmount: this.toNumber(payment.changeAmount),
          transactionCode: payment.transactionCode,
          status: payment.status,
          createdAt: payment.createdAt,
        },
        bill: {
          id: bill.id,
          billCode: bill.billCode,
          status: BillStatus.PAID,
          finalAmount,
        },
        session: {
          id: bill.sessionId,
          status: sessionStatus,
        },
        table: {
          id: bill.session.tableId,
          status: this.mapTableStatus(tableStatus),
        },
        changeAmount,
      };
    });
  }

  async createRefund(
    paymentId: string,
    dto: { amount: number; reason: string; note?: string; managerId?: string },
    userId?: string,
  ) {
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('Refund amount must be a positive number');
    }

    const managerId = await this.getApprovedManagerId(userId ?? dto.managerId);

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id FROM payments WHERE id = ${paymentId}::uuid FOR UPDATE
      `;
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          bill: { include: { session: true } },
          refunds: { select: { amount: true } },
        },
      });
      if (!payment) throw new NotFoundException('Payment not found');

      const totalPaid = new Prisma.Decimal(payment.amountPaid).minus(
        new Prisma.Decimal(payment.changeAmount),
      );
      const alreadyRefunded = payment.refunds.reduce(
        (sum, refund) => sum.plus(refund.amount),
        new Prisma.Decimal(0),
      );
      const remainingAmount = totalPaid.minus(alreadyRefunded);
      const refundAmount = new Prisma.Decimal(dto.amount);
      if (
        remainingAmount.lte(0) ||
        (payment.status !== PaymentStatus.SUCCESS &&
          payment.status !== PaymentStatus.REFUNDED)
      ) {
        throw new ConflictException(
          'Only payments with a refundable balance can be refunded',
        );
      }
      if (refundAmount.gt(remainingAmount)) {
        throw new BadRequestException(
          'Refund amount cannot exceed the remaining refundable balance',
        );
      }
      const fullyRefunded = refundAmount.gte(remainingAmount);
      const paymentStatus = fullyRefunded
        ? PaymentStatus.REFUNDED
        : PaymentStatus.SUCCESS;
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: paymentStatus },
      });
      const refund = await tx.refund.create({
        data: {
          paymentId,
          managerId,
          amount: refundAmount,
          reason: dto.reason.trim() || 'Refund requested by customer',
        },
      });

      await this.appendAuditLog(tx, {
        userId: managerId,
        action: 'PROCESS_REFUND',
        entityName: 'Payment',
        entityId: paymentId,
        oldValues: {
          status: payment.status,
          amountPaid: totalPaid.toNumber(),
        },
        newValues: {
          refundId: refund.id,
          refundedAmount: refundAmount.toNumber(),
          reason: dto.reason.trim() || 'Refund requested by customer',
          note: dto.note ?? null,
        },
      });

      return {
        refund: {
          id: refund.id,
          paymentId: refund.paymentId,
          managerId: refund.managerId,
          amount: this.toNumber(refund.amount),
          reason: refund.reason,
          createdAt: refund.createdAt,
        },
        payment: {
          id: payment.id,
          billId: payment.billId,
          status: fullyRefunded ? PaymentStatus.REFUNDED : 'PARTIALLY_REFUNDED',
        },
      };
    });
  }

  async splitBill(
    billId: string,
    dto: {
      groups: Array<{
        name?: string;
        items: Array<{ orderItemId: string; quantity: number }>;
      }>;
    },
    userId?: string,
  ) {
    const originalBill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        session: true,
        payments: true,
      },
    });

    if (!originalBill) {
      throw new NotFoundException('Bill not found');
    }

    if (
      originalBill.status !== BillStatus.UNPAID ||
      originalBill.payments.length > 0
    ) {
      throw new ConflictException(
        'Only an unpaid bill with no payment can be split',
      );
    }

    const cashierId = await this.getCashierUserId(userId);

    return this.prisma.$transaction(
      async (tx) => {
        const claim = await tx.bill.updateMany({
          where: { id: billId, status: BillStatus.UNPAID },
          data: { status: BillStatus.PARTIALLY_PAID },
        });
        if (claim.count !== 1) {
          throw new ConflictException('Bill has already been split or paid');
        }
        const groups = dto.groups ?? [];
        if (groups.length < 2) {
          throw new BadRequestException(
            'At least two split groups are required',
          );
        }

        const orders = await tx.order.findMany({
          where: {
            sessionId: originalBill.sessionId,
            status: { not: OrderStatus.CANCELLED },
          },
          include: { orderItems: true },
        });
        const orderItems = orders.flatMap((order) => order.orderItems);
        if (orderItems.length === 0) {
          throw new NotFoundException('Order not found for this bill session');
        }

        const allocatedMap = new Map<string, number>();
        const seenAllocation = new Set<string>();

        for (const [groupIndex, group] of groups.entries()) {
          if (!group.items || group.items.length === 0) {
            throw new BadRequestException(
              `Split group ${groupIndex + 1} has no items`,
            );
          }

          for (const item of group.items) {
            if (!item.orderItemId || item.quantity <= 0) {
              throw new BadRequestException(
                'Each split item must include a valid order item and positive quantity',
              );
            }

            const orderItem = orderItems.find(
              (entry) => entry.id === item.orderItemId,
            );
            if (!orderItem) {
              throw new NotFoundException(
                `Order item ${item.orderItemId} not found on the active order`,
              );
            }

            const duplicateKey = `${orderItem.id}:${groupIndex}`;
            if (seenAllocation.has(duplicateKey)) {
              throw new BadRequestException(
                `Duplicate allocation detected for order item ${orderItem.id}`,
              );
            }
            seenAllocation.add(duplicateKey);

            const currentAllocated = allocatedMap.get(orderItem.id) ?? 0;
            const nextTotal = currentAllocated + item.quantity;
            if (nextTotal > orderItem.quantity) {
              throw new BadRequestException(
                `Allocation for order item ${orderItem.id} exceeds the available quantity (${orderItem.quantity})`,
              );
            }

            allocatedMap.set(orderItem.id, nextTotal);
          }
        }

        const allocatedEveryItem = orderItems.every(
          (item) => allocatedMap.get(item.id) === item.quantity,
        );
        if (!allocatedEveryItem || allocatedMap.size !== orderItems.length) {
          throw new BadRequestException(
            'Every order item quantity must be fully allocated across split groups',
          );
        }

        const subtotalByGroup = groups.map((group) =>
          Math.round(
            group.items.reduce((sum, item) => {
              const orderItem = orderItems.find(
                (entry) => entry.id === item.orderItemId,
              )!;
              return sum + this.toNumber(orderItem.unitPrice) * item.quantity;
            }, 0) * 100,
          ),
        );
        const originalSubtotalCents = Math.round(
          this.toNumber(originalBill.subtotalAmount) * 100,
        );
        if (
          subtotalByGroup.reduce((sum, cents) => sum + cents, 0) !==
          originalSubtotalCents
        ) {
          throw new BadRequestException(
            'Split item totals must equal the original bill subtotal',
          );
        }
        const discountCents = Math.round(
          this.toNumber(originalBill.discountAmount) * 100,
        );
        let allocatedDiscountCents = 0;
        const createdBills: Array<{
          id: string;
          billCode: string;
          finalAmount: number;
        }> = [];

        for (const [index] of groups.entries()) {
          const subtotalCents = subtotalByGroup[index];
          const groupDiscountCents =
            index === groups.length - 1
              ? discountCents - allocatedDiscountCents
              : Math.round(
                  (discountCents * subtotalCents) / originalSubtotalCents,
                );
          allocatedDiscountCents += groupDiscountCents;
          if (groupDiscountCents > subtotalCents) {
            throw new BadRequestException(
              'Split discount cannot exceed a group subtotal',
            );
          }
          const subtotal = subtotalCents / 100;
          const groupDiscount = groupDiscountCents / 100;
          const finalAmount = (subtotalCents - groupDiscountCents) / 100;

          const bill = await tx.bill.create({
            data: {
              billCode: `BILL-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
              sessionId: originalBill.sessionId,
              cashierId,
              subtotalAmount: new Prisma.Decimal(subtotal),
              discountAmount: new Prisma.Decimal(groupDiscount),
              finalAmount: new Prisma.Decimal(finalAmount),
              status: BillStatus.UNPAID,
            },
          });

          createdBills.push({
            id: bill.id,
            billCode: bill.billCode,
            finalAmount: this.toNumber(bill.finalAmount),
          });
        }

        const originalBillTotal =
          Math.round(this.toNumber(originalBill.finalAmount) * 100) / 100;
        const splitTotal = createdBills.reduce(
          (sum, bill) => sum + bill.finalAmount,
          0,
        );
        if (
          Math.round(splitTotal * 100) !== Math.round(originalBillTotal * 100)
        ) {
          throw new BadRequestException(
            'Split bill totals must equal the original bill total',
          );
        }

        await this.appendAuditLog(tx, {
          userId: cashierId,
          action: 'BILL_SPLIT',
          entityName: 'Bill',
          entityId: billId,
          oldValues: {
            originalBillId: billId,
            originalStatus: originalBill.status,
            splitGroups: dto.groups.length,
          },
          newValues: {
            newBillIds: createdBills.map((bill) => bill.id),
            totalSplitAmount: splitTotal,
            originalBillAmount: originalBillTotal,
            byGroup: groups.map((group) => ({
              name: group.name ?? 'Split Group',
              items: group.items,
            })),
          },
        });

        return {
          originalBillId: billId,
          createdBills: createdBills.map((bill) => ({
            id: bill.id,
            billCode: bill.billCode,
            finalAmount: bill.finalAmount,
            status: BillStatus.UNPAID,
          })),
          totalSplitAmount: splitTotal,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async getCurrentShiftForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('Cashier account is not active');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const assignment = await this.prisma.shiftAssignment.findFirst({
      where: {
        userId,
        assignedDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        shift: true,
        attendances: {
          orderBy: { checkInTime: 'desc' },
          take: 1,
        },
      },
    });

    if (!assignment) {
      return {
        hasShift: false,
        status: 'NO_ASSIGNMENT',
        shiftName: null,
        startTime: null,
        endTime: null,
        checkInTime: null,
        checkOutTime: null,
        totalSales: 0,
      };
    }

    const attendances = Array.isArray(assignment.attendances)
      ? assignment.attendances
      : [];
    const attendance = attendances[0] ?? null;
    const status =
      attendance?.checkInTime && !attendance.checkOutTime
        ? 'OPEN'
        : attendance
          ? 'CLOSED'
          : 'NOT_STARTED';

    const totalSalesAggregate = await this.prisma.bill.aggregate({
      where: {
        cashierId: userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _sum: { finalAmount: true },
    });

    return {
      hasShift: true,
      assignmentId: assignment.id,
      shiftId: assignment.shift.id,
      shiftName: assignment.shift.name,
      startTime: assignment.shift.startTime,
      endTime: assignment.shift.endTime,
      status,
      checkInTime: attendance?.checkInTime ?? null,
      checkOutTime: attendance?.checkOutTime ?? null,
      totalSales: this.toNumber(totalSalesAggregate._sum.finalAmount ?? 0),
    };
  }

  async startShift(userId: string) {
    const targetUserId = userId;
    if (!targetUserId) {
      throw new BadRequestException('User id is required to start a shift');
    }

    const current = await this.getCurrentShiftForUser(targetUserId);
    if (!current.hasShift) {
      throw new NotFoundException('No shift assignment was found for today');
    }

    if (current.status === 'OPEN') {
      return {
        started: true,
        alreadyStarted: true,
        shiftName: current.shiftName,
        status: current.status,
        checkInTime: current.checkInTime,
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.shiftAssignment.findFirst({
        where: {
          userId: targetUserId,
          assignedDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: { shift: true },
      });

      if (!assignment) {
        throw new NotFoundException('No shift assignment was found for today');
      }

      const attendance = await tx.attendance.create({
        data: {
          userId: targetUserId,
          shiftAssignmentId: assignment.id,
          checkInTime: new Date(),
          status: 'ON_TIME',
        },
      });

      await this.appendAuditLog(tx, {
        userId: targetUserId,
        action: 'START_SHIFT',
        entityName: 'Attendance',
        entityId: attendance.id,
        newValues: {
          userId: targetUserId,
          shiftAssignmentId: assignment.id,
          shiftName: assignment.shift.name,
          checkInTime: attendance.checkInTime,
        },
      });

      return {
        started: true,
        alreadyStarted: false,
        shiftName: assignment.shift.name,
        status: 'OPEN',
        checkInTime: attendance.checkInTime,
      };
    });
  }

  async closeShift(userId: string) {
    const current = await this.getCurrentShiftForUser(userId);
    if (!current.hasShift) {
      throw new NotFoundException('No shift assignment was found for today');
    }

    if (current.status === 'NOT_STARTED') {
      throw new BadRequestException('Shift has not been started yet');
    }

    if (current.status === 'CLOSED') {
      return {
        closed: true,
        alreadyClosed: true,
        shiftName: current.shiftName,
        checkOutTime: current.checkOutTime,
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.shiftAssignment.findFirst({
        where: {
          userId,
          assignedDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: { shift: true },
      });

      if (!assignment) {
        throw new NotFoundException('No shift assignment was found for today');
      }

      const attendance = await tx.attendance.findFirst({
        where: { shiftAssignmentId: assignment.id, userId },
        orderBy: { checkInTime: 'desc' },
      });

      if (!attendance || !attendance.checkInTime) {
        throw new BadRequestException('Shift has not been started yet');
      }

      const updatedAttendance = await tx.attendance.update({
        where: { id: attendance.id },
        data: { checkOutTime: new Date() },
      });

      await this.appendAuditLog(tx, {
        userId,
        action: 'CLOSE_SHIFT',
        entityName: 'Attendance',
        entityId: updatedAttendance.id,
        oldValues: {
          checkOutTime: attendance.checkOutTime,
        },
        newValues: {
          checkOutTime: updatedAttendance.checkOutTime,
          shiftName: assignment.shift.name,
        },
      });

      return {
        closed: true,
        alreadyClosed: false,
        shiftName: assignment.shift.name,
        checkOutTime: updatedAttendance.checkOutTime,
      };
    });
  }

  private async getApprovedManagerId(userId?: string) {
    const targetUserId = userId;
    if (!targetUserId) {
      throw new BadRequestException(
        'A manager user id is required for refund approval',
      );
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!manager || !manager.isActive) {
      throw new ForbiddenException(
        'Refund approval requires an active manager account',
      );
    }

    const hasPermission = manager.role?.permissions.some(
      ({ permission }) => permission.code === 'REFUND_APPROVE',
    );

    const hasManagerRole =
      manager.role?.name === RoleName.MANAGER ||
      manager.role?.name === RoleName.ADMIN;
    if (!hasManagerRole || !hasPermission) {
      throw new ForbiddenException(
        'This manager account is not authorized to approve refunds',
      );
    }

    return manager.id;
  }

  private async getCashierUserId(userId?: string) {
    if (!userId)
      throw new ForbiddenException(
        'Authenticated cashier identity is required',
      );
    return userId;
  }

  private normalizePaymentMethod(method: string): PaymentMethod {
    const normalizedMethod = method.toLowerCase();
    switch (normalizedMethod) {
      case 'cash':
        return PaymentMethod.CASH;
      case 'bank_transfer':
      case 'card':
        return PaymentMethod.BANK_TRANSFER;
      case 'wallet':
      case 'ewallet':
      case 'momo':
        return PaymentMethod.MOMO;
      case 'qr':
      case 'vnpay':
        return PaymentMethod.VNPAY;
      default:
        throw new BadRequestException(`Unsupported payment method: ${method}`);
    }
  }

  private async recalculateOrderTotal(
    orderId: string,
    tx: Prisma.TransactionClient,
  ) {
    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
    });

    const total = orderItems.reduce((sum, item) => {
      return sum + this.toNumber(item.quantity) * this.toNumber(item.unitPrice);
    }, 0);

    await tx.order.update({
      where: { id: orderId },
      data: { totalAmount: new Prisma.Decimal(total) },
    });
  }

  private async appendAuditLog(
    tx: Prisma.TransactionClient,
    input: {
      userId?: string | null;
      action: string;
      entityName: string;
      entityId?: string | null;
      oldValues?: Record<string, unknown> | null;
      newValues?: Record<string, unknown> | null;
      ipAddress?: string | null;
    },
  ) {
    await tx.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityName: input.entityName,
        entityId: input.entityId ?? null,
        oldValues: (input.oldValues ?? null) as any,
        newValues: (input.newValues ?? null) as any,
        ipAddress: input.ipAddress ?? null,
      },
    });
  }

  private mapTableStatus(
    status: TableStatus,
  ): 'empty' | 'occupied' | 'reserved' | 'dirty' {
    const statusMap: Record<
      TableStatus,
      'empty' | 'occupied' | 'reserved' | 'dirty'
    > = {
      [TableStatus.AVAILABLE]: 'empty',
      [TableStatus.OCCUPIED]: 'occupied',
      [TableStatus.RESERVED]: 'reserved',
      [TableStatus.CLEANING]: 'dirty',
    };
    return statusMap[status];
  }

  private formatBusinessDate(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );
    return `${values.year}-${values.month}-${values.day}`;
  }

  private formatBusinessTime(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date);
  }

  private getMinutesAgo(date: Date): number {
    return Math.max(
      0,
      Math.round((Date.now() - new Date(date).getTime()) / 60000),
    );
  }

  private toNumber(
    value: Prisma.Decimal | number | string | null | undefined,
  ): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return Number(value.toString());
  }
}
