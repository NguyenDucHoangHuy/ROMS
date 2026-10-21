import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: null,
      imageUrl: null,
      sortOrder: category.displayOrder,
      isActive: category.isActive,
    }));
  }
}
