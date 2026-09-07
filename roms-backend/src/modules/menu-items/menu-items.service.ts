import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from '../../gateways/kitchen.gateway';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async findAll(categoryId?: string) {
    const items = await this.prisma.menuItem.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: this.include(),
      orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
    });

    return items.map((item) => this.toMenuItem(item));
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: this.include(),
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return this.toMenuItem(item);
  }

  async updateAvailability(id: string, isAvailable: boolean) {
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      include: this.include(),
    });

    const payload = this.toMenuItem(item);
    this.kitchenGateway.emitMenuItemUpdated(payload);
    return payload;
  }

  private include() {
    return {
      category: true,
      recipes: { include: { inventoryItem: true } },
    } satisfies Prisma.MenuItemInclude;
  }

  private toMenuItem(
    item: Prisma.MenuItemGetPayload<{ include: ReturnType<MenuItemsService['include']> }>,
  ) {
    const costPrice = Number(item.costPrice ?? 0);
    const price = Number(item.price);
    const margin = price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;
    const isLowStock = item.recipes.some(
      (recipe) => recipe.inventoryItem.currentStock.lte(recipe.inventoryItem.minAlertThreshold),
    );

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price,
      costPrice,
      margin,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      category: {
        id: item.category.id,
        name: item.category.name,
        description: null,
        imageUrl: null,
        sortOrder: item.category.displayOrder,
        isActive: item.category.isActive,
      },
      isAvailable: item.isAvailable,
      isRecommendable: item.isRecommendable,
      preparationTime: this.estimatePrepTime(item.category.name),
      tags: item.isRecommendable ? ['Recommended'] : [],
      isLowStock,
      lowStockWarning: isLowStock ? 'One or more recipe ingredients are below threshold.' : null,
      recipes: item.recipes.map((recipe) => ({
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
}
