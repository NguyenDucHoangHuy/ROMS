import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  DepositStatus,
  OrderItemStatus,
  OrderStatus,
  ReservationStatus,
  SessionStatus,
  TableStatus,
} from '@prisma/client';
import { KitchenGateway } from '../../gateways/kitchen.gateway';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async create(dto: CreateReservationDto, customerId?: string) {
    // Nếu có items đặt trước, tìm giá món nếu chưa có
    let itemsToCreate: any[] = [];
    if (dto.items && dto.items.length > 0) {
      const menuIds = dto.items.map((i) => i.menuItemId);
      const menuItems = await this.prisma.menuItem.findMany({
        where: { id: { in: menuIds } },
        select: { id: true, price: true },
      });
      const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]));

      itemsToCreate = dto.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice:
          item.unitPrice !== undefined
            ? Number(item.unitPrice)
            : priceMap.get(item.menuItemId) || 0,
        notes: item.notes,
      }));
    }

    return this.prisma.reservation.create({
      data: {
        customerId: customerId || undefined,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        reservationTime: new Date(dto.reservationTime),
        partySize: dto.partySize,
        specialRequest: dto.specialRequest,
        tableId: dto.tableId,
        depositAmount: dto.depositAmount ? Number(dto.depositAmount) : 0,
        depositStatus: dto.depositStatus || DepositStatus.PENDING,
        ...(itemsToCreate.length > 0
          ? {
              reservationItems: {
                create: itemsToCreate,
              },
            }
          : {}),
      },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { reservationTime: 'desc' },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async confirm(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CONFIRMED },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });

    // Nếu đơn đặt đã có bàn, cập nhật bàn sang trạng thái RESERVED
    if (reservation.tableId) {
      await this.prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: TableStatus.RESERVED },
      });
    }

    return updated;
  }

  async cancel(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });

    // Nếu đơn đã có bàn và bàn đang là RESERVED, giải phóng bàn về AVAILABLE
    if (reservation.tableId) {
      const table = await this.prisma.table.findUnique({
        where: { id: reservation.tableId },
      });
      if (table && table.status === TableStatus.RESERVED) {
        await this.prisma.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }
    }

    return updated;
  }

  async getByConfirmationCode(code: string) {
    const trimmed = (code || '').trim();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        trimmed,
      );

    const reservation = await this.prisma.reservation.findFirst({
      where: isUuid
        ? {
            OR: [{ id: trimmed }, { guestPhone: trimmed }],
          }
        : {
            guestPhone: trimmed,
          },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });
    if (!reservation) {
      throw new NotFoundException('Không tìm thấy thông tin đặt bàn');
    }
    return reservation;
  }

  async getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.reservation.findMany({
      where: {
        reservationTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
      orderBy: { reservationTime: 'asc' },
    });
  }

  async findMyReservations(customerId: string) {
    return this.prisma.reservation.findMany({
      where: { customerId },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
      orderBy: { reservationTime: 'desc' },
    });
  }

  async checkIn(payload: any, userId?: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: payload.id },
      include: {
        table: true,
        reservationItems: {
          include: { menuItem: true },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const targetTableId = payload.tableId || reservation.tableId;

    if (!targetTableId) {
      throw new BadRequestException(
        'Đơn đặt bàn chưa được gán bàn. Vui lòng gán bàn trước khi check-in.',
      );
    }

    const oldTableId = reservation.tableId;

    const result = await this.prisma.$transaction(async (tx) => {
      if (oldTableId && oldTableId !== targetTableId) {
        await tx.table.update({
          where: { id: oldTableId },
          data: { status: TableStatus.AVAILABLE },
        });
      }
      // 1. Tìm xem bàn đã có phiên ăn đang mở thuộc về reservation này chưa
      let session = await tx.diningSession.findFirst({
        where: {
          tableId: targetTableId,
          reservationId: reservation.id,
          status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
        },
      });

      // Nếu bàn có phiên ăn cũ của khách khác (hoặc sót từ ca trước), đóng để đón khách mới
      const staleSessions = await tx.diningSession.findMany({
        where: {
          tableId: targetTableId,
          id: session ? { not: session.id } : undefined,
          status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
        },
      });
      for (const stale of staleSessions) {
        await tx.diningSession.update({
          where: { id: stale.id },
          data: { status: SessionStatus.CLOSED, endTime: new Date() },
        });
      }

      // 2. Nếu chưa có phiên ăn cho reservation này, tạo mới
      if (!session) {
        session = await tx.diningSession.create({
          data: {
            sessionCode: `SS-${Date.now()}`,
            tableId: targetTableId,
            reservationId: reservation.id,
            openedById: userId || undefined,
            customerCount: reservation.partySize || 1,
            status: SessionStatus.OPEN,
          },
        });
      }

      // 2.5. Tự động tạo Order chứa các món khách đã đặt trước (nếu chưa có trong phiên này)
      if (
        reservation.reservationItems &&
        reservation.reservationItems.length > 0
      ) {
        const existingPreOrder = await tx.order.findFirst({
          where: {
            sessionId: session.id,
            orderCode: { startsWith: `PRE-${reservation.id.slice(0, 8).toUpperCase()}` },
          },
        });

        if (!existingPreOrder) {
          const totalAmount = reservation.reservationItems.reduce(
            (sum, item) => sum + Number(item.unitPrice) * item.quantity,
            0,
          );

          await tx.order.create({
            data: {
              orderCode: `PRE-${reservation.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
              sessionId: session.id,
              waiterId: userId || undefined,
              status: OrderStatus.CREATED,
              totalAmount: totalAmount,
              orderItems: {
                create: reservation.reservationItems.map((item) => ({
                  menuItemId: item.menuItemId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  notes: item.notes || 'Món đặt trước qua Reservation',
                  itemStatus: OrderItemStatus.PENDING,
                })),
              },
            },
          });
        }
      }

      // 3. Cập nhật trạng thái đơn đặt sang COMPLETED
      const updatedReservation = await tx.reservation.update({
        where: { id: payload.id },
        data: {
          status: ReservationStatus.COMPLETED,
          tableId: targetTableId,
        },
        include: {
          table: true,
          reservationItems: {
            include: { menuItem: true },
          },
        },
      });

      // 4. Khóa bàn sang OCCUPIED (Đỏ - Đang phục vụ)
      await tx.table.update({
        where: { id: targetTableId },
        data: { status: TableStatus.OCCUPIED },
      });

      return { reservation: updatedReservation, session };
    });

    // Phát tín hiệu socket tới hệ thống bếp và floor map
    try {
      this.kitchenGateway.emitOrderItemUpdated({
        itemId: 'session',
        orderId: result.session.id,
        tableId: targetTableId,
        status: 'OPENED',
      });
    } catch (e) {
      console.error('Lỗi emit socket check-in:', e);
    }

    return result.reservation;
  }

  async assignTable(id: string, newTableId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const oldTableId = reservation.tableId;

    const targetTable = await this.prisma.table.findUnique({
      where: { id: newTableId },
    });
    if (!targetTable) throw new NotFoundException('Table not found');

    const result = await this.prisma.$transaction(async (tx) => {
      if (oldTableId && oldTableId !== newTableId) {
        const oldTable = await tx.table.findUnique({
          where: { id: oldTableId },
        });
        if (oldTable && oldTable.status === TableStatus.RESERVED) {
          await tx.table.update({
            where: { id: oldTableId },
            data: { status: TableStatus.AVAILABLE },
          });
        }
      }

      const updated = await tx.reservation.update({
        where: { id },
        data: {
          tableId: newTableId,
          status:
            reservation.status === ReservationStatus.PENDING
              ? ReservationStatus.CONFIRMED
              : reservation.status,
        },
        include: {
          table: true,
          reservationItems: {
            include: { menuItem: true },
          },
        },
      });

      await tx.table.update({
        where: { id: newTableId },
        data: { status: TableStatus.RESERVED },
      });

      return updated;
    });

    return result;
  }
}
