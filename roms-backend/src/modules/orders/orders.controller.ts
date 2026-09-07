import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get('kitchen/queue')
  getKitchenQueue() {
    return this.ordersService.getKitchenQueue();
  }

  @Get('table/:tableId/active')
  getActiveByTable(@Param('tableId') tableId: string) {
    return this.ordersService.getActiveByTable(tableId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':orderId/items')
  addItems(@Param('orderId') orderId: string, @Body() dto: AddOrderItemsDto) {
    return this.ordersService.addItems(orderId, dto);
  }

  @Patch(':orderId/items/:itemId/status')
  updateItemStatus(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateItemStatus(orderId, itemId, dto);
  }

  @Patch(':orderId/items/:itemId/priority')
  prioritizeItem(@Param('orderId') orderId: string, @Param('itemId') itemId: string) {
    return this.ordersService.prioritizeItem(orderId, itemId);
  }
}
