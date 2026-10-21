import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';
import { CreateStockReceiptDto } from './dto/create-stock-receipt.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({
    summary: 'Danh sách tất cả nguyên liệu',
    description:
      'Bao gồm tồn kho hiện tại và ngưỡng cảnh báo thấp (Admin/Manager/Chef).',
  })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Thêm mới nguyên liệu vào kho (Admin/Manager)' })
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get('low-stock')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({
    summary: 'Danh sách nguyên liệu sắp hết',
    description:
      'Chỉ trả về các nguyên liệu có currentStock ≤ minAlertThreshold.',
  })
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get('receipts')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Lịch sử phiếu nhập kho (Admin/Manager)' })
  findReceipts() {
    return this.inventoryService.findReceipts();
  }

  @Post('receipts')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({
    summary: 'Tạo phiếu nhập kho',
    description: 'Cập nhật tồn kho và ghi StockMovement trong một transaction.',
  })
  createReceipt(
    @Body() dto: CreateStockReceiptDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.inventoryService.createReceipt(dto, currentUser.sub);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.CHEF)
  @ApiOperation({ summary: 'Chi tiết 1 nguyên liệu' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Cập nhật thông tin nguyên liệu (Admin/Manager)' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Xóa nguyên liệu khỏi kho (Admin/Manager)' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Post(':id/adjust')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({
    summary: 'Điều chỉnh số lượng tồn kho (nhập thêm/xuất hủy/kiểm kê)',
  })
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.inventoryService.adjustStock(id, dto, currentUser.sub);
  }
}
