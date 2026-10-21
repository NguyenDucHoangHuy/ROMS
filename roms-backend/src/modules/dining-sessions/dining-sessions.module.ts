import { Module } from '@nestjs/common';
import { GatewaysModule } from '../../gateways/gateways.module';
import { DiningSessionsController } from './dining-sessions.controller';
import { DiningSessionsService } from './dining-sessions.service';

@Module({
  imports: [GatewaysModule],
  controllers: [DiningSessionsController],
  providers: [DiningSessionsService],
  exports: [DiningSessionsService],
})
export class DiningSessionsModule {}
