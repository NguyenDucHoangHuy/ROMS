import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiningSessionDto } from './dto/create-dining-session.dto';
import { SessionStatus, TableStatus } from '@prisma/client';
import { KitchenGateway } from '../../gateways/kitchen.gateway';

@Injectable()
export class DiningSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async create(dto: CreateDiningSessionDto, userId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    // Kiểm tra bàn có session nào đang mở không
    const activeSession = await this.prisma.diningSession.findFirst({
      where: {
        tableId: dto.tableId,
        status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
      },
    });
    if (activeSession) {
      throw new ConflictException('Table already has an active dining session');
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.diningSession.create({
        data: {
          sessionCode: `SS-${Date.now()}`,
          tableId: dto.tableId,
          openedById: userId,
          customerCount: dto.customerCount ?? 1,
          status: SessionStatus.OPEN,
        },
        include: { table: true },
      });

      await tx.table.update({
        where: { id: dto.tableId },
        data: { status: TableStatus.OCCUPIED },
      });

      return newSession;
    });

    this.kitchenGateway.emitOrderItemUpdated({
      itemId: 'session',
      orderId: session.id,
      tableId: session.tableId,
      status: 'OPENED',
    });
    return session;
  }

  async findActive() {
    return this.prisma.diningSession.findMany({
      where: { status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] } },
      include: { table: true, openedBy: { select: { fullName: true } } },
      orderBy: { startTime: 'desc' },
    });
  }

  async closeSession(id: string, userId: string) {
    const session = await this.prisma.diningSession.findUnique({
      where: { id },
    });
    if (!session) throw new NotFoundException('Session not found');

    const closed = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.diningSession.update({
        where: { id },
        data: {
          status: SessionStatus.CLOSED,
          endTime: new Date(),
          closedById: userId,
        },
      });

      await tx.table.update({
        where: { id: session.tableId },
        data: { status: TableStatus.CLEANING },
      });

      return updated;
    });

    this.kitchenGateway.emitOrderItemUpdated({
      itemId: 'session',
      orderId: closed.id,
      tableId: closed.tableId,
      status: 'CLOSED',
    });
    return closed;
  }
}
