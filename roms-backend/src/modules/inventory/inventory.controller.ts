import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get('receipts')
  findReceipts() {
    return this.inventoryService.findReceipts();
  }

  @Post('receipts')
  createReceipt(@Body() dto: CreateStockReceiptDto) {
    return this.inventoryService.createReceipt(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }
}
