import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, category?: string) {
    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { contactPerson: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    return this.prisma.supplier.findMany({
      where,
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name,
        category: dto.category,
        contactPerson: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        status: dto.status || 'ACTIVE',
        rating: dto.rating ?? 5.0,
        inFlightOrders: dto.inFlightOrders ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category && { category: dto.category }),
        ...(dto.contactPerson !== undefined && {
          contactPerson: dto.contactPerson,
        }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.status && { status: dto.status }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.inFlightOrders !== undefined && {
          inFlightOrders: dto.inFlightOrders,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.delete({ where: { id } });
    return { success: true, message: 'Supplier deleted successfully' };
  }

  async getStats() {
    const total = await this.prisma.supplier.count();
    const active = await this.prisma.supplier.count({
      where: { status: 'ACTIVE' },
    });
    const preferred = await this.prisma.supplier.count({
      where: { rating: { gte: 4.8 } },
    });
    const inFlightAgg = await this.prisma.supplier.aggregate({
      _sum: { inFlightOrders: true },
    });

    return {
      totalSuppliers: total,
      activeSuppliers: active,
      preferredVendors: preferred,
      pendingDeliveries: inFlightAgg._sum.inFlightOrders || 0,
    };
  }
}
