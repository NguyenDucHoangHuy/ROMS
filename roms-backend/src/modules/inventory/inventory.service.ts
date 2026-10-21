import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from '../../gateways/kitchen.gateway';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async findAll() {
    const items = await this.prisma.inventoryItem.findMany({
      orderBy: [{ itemName: 'asc' }],
    });

    return items.map((item) => this.toInventoryItem(item));
  }

  async findLowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      orderBy: [{ itemName: 'asc' }],
    });

    return items
      .filter((item) => item.currentStock.lte(item.minAlertThreshold))
      .map((item) => this.toInventoryItem(item));
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return this.toInventoryItem(item);
  }

  async create(dto: CreateInventoryItemDto) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        itemName: dto.itemName,
        unit: dto.unit,
        currentStock: dto.currentStock ?? 0,
        minAlertThreshold: dto.minAlertThreshold ?? 0,
        category: dto.category || 'Khác',
        sku: dto.sku || `ING-${Date.now().toString().slice(-6)}`,
      } as any,
    });

    return this.toInventoryItem(item);
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(dto.itemName && { itemName: dto.itemName }),
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.minAlertThreshold !== undefined && {
          minAlertThreshold: dto.minAlertThreshold,
        }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
      } as any,
    });

    return this.toInventoryItem(updated);
  }

  async remove(id: string) {
    await this.findOne(id);

    const recipeCount = await this.prisma.recipe.count({
      where: { inventoryItemId: id },
    });
    if (recipeCount > 0) {
      throw new BadRequestException(
        'Không thể xóa nguyên liệu đang được sử dụng trong công thức món ăn.',
      );
    }

    await this.prisma.inventoryItem.delete({ where: { id } });
    return { success: true, message: 'Đã xóa nguyên liệu thành công' };
  }

  async adjustStock(id: string, dto: AdjustStockDto, userId?: string) {
    const item = await this.findOne(id);
    const newStock = Math.max(0, item.currentStock + dto.deltaQuantity);

    const updated = await this.prisma.$transaction(async (tx) => {
      const up = await tx.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: id,
          createdById: userId,
          movementType:
            dto.movementType ??
            (dto.deltaQuantity >= 0
              ? StockMovementType.IN_RECEIPT
              : StockMovementType.WASTE_SPOILED),
          quantity: Math.abs(dto.deltaQuantity),
          balanceAfter: newStock,
          note:
            dto.note ||
            `Điều chỉnh tồn kho: ${dto.deltaQuantity >= 0 ? '+' : ''}${dto.deltaQuantity} ${item.unit}`,
        },
      });

      return up;
    });

    const res = this.toInventoryItem(updated);
    this.kitchenGateway.emitInventoryUpdated({
      id: updated.id,
      itemName: updated.itemName,
      currentStock: Number(updated.currentStock),
      unit: updated.unit,
    });
    return res;
  }

  async findReceipts() {
    const receipts = await this.prisma.stockReceipt.findMany({
      include: { details: { include: { inventoryItem: true } }, manager: true },
      orderBy: { createdAt: 'desc' },
    });

    return receipts.map((receipt) => ({
      id: receipt.id,
      receiptCode: receipt.receiptCode,
      supplierName: receipt.supplierName,
      totalCost: Number(receipt.totalCost),
      createdAt: receipt.createdAt.toISOString(),
      managerName: receipt.manager.fullName,
      details: receipt.details.map((detail) => ({
        id: detail.id,
        inventoryItemId: detail.inventoryItemId,
        itemName: detail.inventoryItem.itemName,
        unit: detail.inventoryItem.unit,
        quantity: Number(detail.quantity),
        unitPrice: Number(detail.unitPrice),
      })),
    }));
  }

  /**
   * Tạo phiếu nhập kho.
   * @param managerId - UUID của user đang login (lấy từ JWT, truyền từ Controller)
   */
  async createReceipt(dto: CreateStockReceiptDto, managerId?: string) {
    const receipt = await this.prisma.$transaction(async (tx) => {
      let resolvedManagerId = managerId;
      if (!resolvedManagerId) {
        const fallback = await tx.user.findFirst();
        resolvedManagerId =
          fallback?.id || '00000000-0000-0000-0000-000000000000';
      }

      const inventoryItems = await tx.inventoryItem.findMany({
        where: {
          id: { in: dto.details.map((detail) => detail.inventoryItemId) },
        },
      });
      const inventoryMap = new Map(
        inventoryItems.map((item) => [item.id, item]),
      );

      let totalCost = new Prisma.Decimal(0);
      for (const detail of dto.details) {
        const inventoryItem = inventoryMap.get(detail.inventoryItemId);
        if (!inventoryItem) {
          throw new NotFoundException(
            `Inventory item ${detail.inventoryItemId} not found`,
          );
        }
        totalCost = totalCost.add(
          new Prisma.Decimal(detail.quantity).mul(detail.unitPrice),
        );
      }

      const createdReceipt = await tx.stockReceipt.create({
        data: {
          receiptCode: `RC-${Date.now()}`,
          managerId: resolvedManagerId,
          supplierName: dto.supplierName,
          totalCost,
          details: {
            create: dto.details.map((detail) => ({
              inventoryItemId: detail.inventoryItemId,
              quantity: detail.quantity,
              unitPrice: detail.unitPrice,
            })),
          },
        },
        include: {
          details: { include: { inventoryItem: true } },
          manager: true,
        },
      });

      for (const detail of dto.details) {
        const updatedInventory = await tx.inventoryItem.update({
          where: { id: detail.inventoryItemId },
          data: { currentStock: { increment: detail.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            inventoryItemId: detail.inventoryItemId,
            createdById: resolvedManagerId,
            movementType: StockMovementType.IN_RECEIPT,
            quantity: detail.quantity,
            balanceAfter: updatedInventory.currentStock,
            note: `Inbound receipt ${createdReceipt.receiptCode}`,
          },
        });
      }

      return createdReceipt;
    });

    const payload = {
      id: receipt.id,
      receiptCode: receipt.receiptCode,
      supplierName: receipt.supplierName,
      totalCost: Number(receipt.totalCost),
      createdAt: receipt.createdAt.toISOString(),
      managerName: receipt.manager.fullName,
      details: receipt.details.map((detail) => ({
        id: detail.id,
        inventoryItemId: detail.inventoryItemId,
        itemName: detail.inventoryItem.itemName,
        unit: detail.inventoryItem.unit,
        quantity: Number(detail.quantity),
        unitPrice: Number(detail.unitPrice),
      })),
    };

    this.kitchenGateway.emitInventoryUpdated(payload);
    return payload;
  }

  private toInventoryItem(item: Prisma.InventoryItemGetPayload<object>) {
    const currentStock = Number(item.currentStock);
    const minAlertThreshold = Number(item.minAlertThreshold);
    const anyItem = item as any;

    return {
      id: item.id,
      name: item.itemName,
      itemName: item.itemName,
      unit: item.unit,
      currentStock,
      minStockLevel: minAlertThreshold,
      minAlertThreshold,
      category: anyItem.category || 'Khác',
      sku: anyItem.sku || `ING-${item.id.slice(0, 6).toUpperCase()}`,
      unitCost: 0,
      isLow: item.currentStock.lte(item.minAlertThreshold),
      updatedAt: new Date().toISOString(),
    };
  }
}
