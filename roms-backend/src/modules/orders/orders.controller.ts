import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(RoleName.CUSTOMER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Tạo đơn hàng mới (tự động mở phiên nếu bàn trống)',
  })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    // Nếu là CUSTOMER thì truyền user.sub làm creator. Nếu là WAITER/MANAGER tạo hộ khách thì cũng ghi log ai tạo
    return this.ordersService.createOrder(dto, user.sub);
  }

  @Get('table/:tableId/active')
  @Roles(RoleName.CUSTOMER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy đơn hàng đang hoạt động của một bàn' })
  getActiveOrderByTable(@Param('tableId') tableId: string) {
    return this.ordersService.getActiveOrderByTable(tableId);
  }

  @Get('kitchen/queue')
  @Roles(RoleName.CHEF, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách các món đang chờ chế biến' })
  getKitchenQueue() {
    return this.ordersService.getKitchenQueue();
  }

  @Get('pending-payment')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách các đơn hàng chờ thanh toán' })
  getPendingPaymentOrders() {
    return this.ordersService.getPendingPaymentOrders();
  }

  @Get(':id')
  @Roles(
    RoleName.CUSTOMER,
    RoleName.WAITER,
    RoleName.CHEF,
    RoleName.MANAGER,
    RoleName.ADMIN,
  )
  @ApiOperation({ summary: 'Chi tiết đơn hàng' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/items')
  @Roles(RoleName.CUSTOMER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Thêm món vào đơn hàng hiện tại' })
  addItems(@Param('id') id: string, @Body() dto: AddOrderItemsDto) {
    return this.ordersService.addItems(id, dto);
  }

  @Patch(':id/items/:itemId/status')
  @Roles(RoleName.CHEF, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary:
      'Cập nhật trạng thái một món trong đơn (PENDING, COOKING, READY...)',
  })
  updateItemStatus(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateItemStatus(id, itemId, dto);
  }

  @Patch(':id/items/:itemId/priority')
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Đánh dấu ưu tiên cho một món ăn' })
  prioritizeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.ordersService.prioritizeItem(id, itemId);
  }

  @Delete(':id/items/:itemId')
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Huỷ (cancel) một món ăn trong đơn hàng' })
  cancelItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.ordersService.cancelItem(id, itemId);
  }

  @Patch(':id/cancel')
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Huỷ toàn bộ đơn hàng' })
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Post(':id/void')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Void đơn hàng (Dành cho Quản lý)' })
  voidOrder(@Param('id') id: string) {
    return this.ordersService.voidOrder(id);
  }
}
