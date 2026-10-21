import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  DepositStatus,
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
      },
      include: {
        table: true,
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { reservationTime: 'desc' },
      include: { table: true },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true },
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
      include: { table: true },
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
      include: { table: true },
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
    const reservation = await this.prisma.reservation.findFirst({
      where: { id: code },
      include: { table: true },
    });
    if (!reservation) throw new NotFoundException('Reservation code not found');
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
      include: { table: true },
      orderBy: { reservationTime: 'asc' },
    });
  }

  async findMyReservations(customerId: string) {
    return this.prisma.reservation.findMany({
      where: { customerId },
      include: { table: true },
      orderBy: { reservationTime: 'desc' },
    });
  }

  async checkIn(payload: any, userId?: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: payload.id },
      include: { table: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    if (!reservation.tableId) {
      throw new BadRequestException(
        'Đơn đặt bàn chưa được gán bàn. Vui lòng gán bàn trước khi check-in.',
      );
    }

    const targetTableId = reservation.tableId;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra xem bàn có phiên ăn nào đang mở không
      let session = await tx.diningSession.findFirst({
        where: {
          tableId: targetTableId,
          status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
        },
      });

      // 2. Nếu chưa có session, tự động khởi tạo DiningSession mới và gắn với reservation
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
      } else if (!session.reservationId) {
        // Đã có phiên nhưng chưa liên kết reservation
        session = await tx.diningSession.update({
          where: { id: session.id },
          data: {
            reservationId: reservation.id,
            customerCount: reservation.partySize || session.customerCount,
          },
        });
      }

      // 3. Cập nhật trạng thái đơn đặt sang COMPLETED
      const updatedReservation = await tx.reservation.update({
        where: { id: payload.id },
        data: { status: ReservationStatus.COMPLETED },
        include: { table: true },
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
      // Gateway emit fallback nếu có lỗi kết nối
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

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật bàn mới cho đơn đặt bàn
      const res = await tx.reservation.update({
        where: { id },
        data: { tableId: newTableId },
        include: { table: true },
      });

      // 2. Nếu đơn đã ở trạng thái CONFIRMED
      if (reservation.status === ReservationStatus.CONFIRMED) {
        // Chuyển bàn mới sang RESERVED
        await tx.table.update({
          where: { id: newTableId },
          data: { status: TableStatus.RESERVED },
        });

        // Nếu trước đó đã có bàn cũ khác bàn mới, kiểm tra giải phóng bàn cũ về AVAILABLE
        if (oldTableId && oldTableId !== newTableId) {
          const otherConfirmed = await tx.reservation.findFirst({
            where: {
              tableId: oldTableId,
              status: ReservationStatus.CONFIRMED,
              id: { not: id },
            },
          });
          if (!otherConfirmed) {
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
        }
      }

      return res;
    });

    return updated;
  }
}
