import { Module } from '@nestjs/common';
import { GatewaysModule } from '../../gateways/gateways.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [GatewaysModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
