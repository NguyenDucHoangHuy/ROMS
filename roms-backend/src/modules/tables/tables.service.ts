import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TableStatus } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.table.findMany({
      include: {
        diningSessions: {
          where: { status: 'OPEN' },
          take: 1,
        },
        reservations: {
          where: { status: { in: ['PENDING', 'CONFIRMED'] } },
          orderBy: { reservationTime: 'asc' },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { tableNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        diningSessions: {
          where: { status: 'OPEN' },
          take: 1,
        },
        reservations: {
          where: { status: { in: ['PENDING', 'CONFIRMED'] } },
          orderBy: { reservationTime: 'asc' },
          take: 1,
        },
      },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async create(dto: {
    tableNumber: string;
    floor?: number;
    capacity?: number;
  }) {
    const existing = await this.prisma.table.findUnique({
      where: { tableNumber: dto.tableNumber },
    });
    if (existing) {
      throw new ConflictException(`Bàn "${dto.tableNumber}" đã tồn tại`);
    }

    const qrCodeToken = `QR_${dto.tableNumber.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString(36)}`;

    return this.prisma.table.create({
      data: {
        tableNumber: dto.tableNumber,
        floor: dto.floor ? Number(dto.floor) : 1,
        capacity: dto.capacity ? Number(dto.capacity) : 4,
        status: TableStatus.AVAILABLE,
        qrCodeToken,
      },
    });
  }

  async updateStatus(id: string, status: TableStatus) {
    const table = await this.prisma.table.update({
      where: { id },
      data: { status },
    });
    return table;
  }

  async remove(id: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.delete({ where: { id } });
  }

  async findByQrToken(qrCodeToken: string) {
    const table = await this.prisma.table.findUnique({
      where: { qrCodeToken },
    });
    if (!table) throw new NotFoundException('Invalid QR code token');
    return table;
  }

  async getMap() {
    const tables = await this.prisma.table.findMany({
      orderBy: [{ floor: 'asc' }, { tableNumber: 'asc' }],
    });

    const mappedTables = tables.map((t) => ({
      id: t.id,
      name: t.tableNumber,
      capacity: t.capacity,
      floor: t.floor,
      zone: 'INDOOR',
      status: t.status,
      currentOrderId: null,
      xPosition: 0,
      yPosition: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const floors = [...new Set(mappedTables.map((t) => t.floor))];
    const zones = ['INDOOR'];

    return { tables: mappedTables, floors, zones };
  }

  async mergeTables(sourceTableIds: string[], targetTableId: string) {
    // Basic mock logic or not implemented
    return { success: true, message: 'Tables merged' };
  }

  async splitTable(tableId: string) {
    // Basic mock logic
    return { success: true, message: 'Table split' };
  }
}
