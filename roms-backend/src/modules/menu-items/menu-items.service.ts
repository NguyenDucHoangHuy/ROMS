import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from '../../gateways/kitchen.gateway';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateRecipesDto } from './dto/update-recipes.dto';

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

  async create(dto: CreateMenuItemDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const item = await this.prisma.menuItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        costPrice: dto.costPrice,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        isAvailable: dto.isAvailable ?? true,
        isRecommendable: dto.isRecommendable ?? false,
      },
      include: this.include(),
    });

    const payload = this.toMenuItem(item);
    this.kitchenGateway.emitMenuItemUpdated(payload);
    return payload;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const item = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.isRecommendable !== undefined && {
          isRecommendable: dto.isRecommendable,
        }),
      },
      include: this.include(),
    });

    const payload = this.toMenuItem(item);
    this.kitchenGateway.emitMenuItemUpdated(payload);
    return payload;
  }

  async remove(id: string) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menuItem.delete({ where: { id } });
    return { success: true, message: 'Menu item deleted' };
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

  async updateRecipes(id: string, dto: UpdateRecipesDto) {
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    if (dto.recipes && dto.recipes.length > 0) {
      const inventoryItemIds = dto.recipes.map((r) => r.inventoryItemId);
      const foundItems = await this.prisma.inventoryItem.findMany({
        where: { id: { in: inventoryItemIds } },
      });
      if (foundItems.length !== inventoryItemIds.length) {
        throw new NotFoundException(
          'Một hoặc nhiều nguyên liệu không tồn tại trong kho',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.recipe.deleteMany({
        where: { menuItemId: id },
      });

      if (dto.recipes && dto.recipes.length > 0) {
        await tx.recipe.createMany({
          data: dto.recipes.map((r) => ({
            menuItemId: id,
            inventoryItemId: r.inventoryItemId,
            quantityRequired: r.quantityRequired,
          })),
        });
      }
    });

    const item = await this.prisma.menuItem.findUniqueOrThrow({
      where: { id },
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
    item: Prisma.MenuItemGetPayload<{
      include: ReturnType<MenuItemsService['include']>;
    }>,
  ) {
    const costPrice = Number(item.costPrice ?? 0);
    const price = Number(item.price);
    const margin =
      price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;
    const isLowStock = item.recipes.some((recipe) =>
      recipe.inventoryItem.currentStock.lte(
        recipe.inventoryItem.minAlertThreshold,
      ),
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
      lowStockWarning: isLowStock
        ? 'One or more recipe ingredients are below threshold.'
        : null,
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
