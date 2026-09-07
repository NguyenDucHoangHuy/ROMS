import { Module } from '@nestjs/common';
import { GatewaysModule } from '../../gateways/gateways.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [GatewaysModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
