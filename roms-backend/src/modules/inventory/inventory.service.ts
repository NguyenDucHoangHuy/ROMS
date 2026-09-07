import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleName, StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from '../../gateways/kitchen.gateway';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';

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

  async createReceipt(dto: CreateStockReceiptDto) {
    const receipt = await this.prisma.$transaction(async (tx) => {
      const manager = await tx.user.findFirst({
        where: { role: { name: { in: [RoleName.ADMIN, RoleName.MANAGER] } } },
      });

      if (!manager) {
        throw new NotFoundException('No manager/admin account found for stock receipt');
      }

      const inventoryItems = await tx.inventoryItem.findMany({
        where: { id: { in: dto.details.map((detail) => detail.inventoryItemId) } },
      });
      const inventoryMap = new Map(inventoryItems.map((item) => [item.id, item]));

      let totalCost = new Prisma.Decimal(0);
      for (const detail of dto.details) {
        const inventoryItem = inventoryMap.get(detail.inventoryItemId);
        if (!inventoryItem) {
          throw new NotFoundException(`Inventory item ${detail.inventoryItemId} not found`);
        }
        totalCost = totalCost.add(new Prisma.Decimal(detail.quantity).mul(detail.unitPrice));
      }

      const createdReceipt = await tx.stockReceipt.create({
        data: {
          receiptCode: `RC-${Date.now()}`,
          managerId: manager.id,
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
        include: { details: { include: { inventoryItem: true } }, manager: true },
      });

      for (const detail of dto.details) {
        const updatedInventory = await tx.inventoryItem.update({
          where: { id: detail.inventoryItemId },
          data: { currentStock: { increment: detail.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            inventoryItemId: detail.inventoryItemId,
            createdById: manager.id,
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

    return {
      id: item.id,
      name: item.itemName,
      itemName: item.itemName,
      unit: item.unit,
      currentStock,
      minStockLevel: minAlertThreshold,
      minAlertThreshold,
      unitCost: 0,
      isLow: item.currentStock.lte(item.minAlertThreshold),
      updatedAt: new Date().toISOString(),
    };
  }
}
