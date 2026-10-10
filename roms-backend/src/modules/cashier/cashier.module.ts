import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CashierDevReadonlyAuthGuard } from './cashier-dev-readonly.guard';
import { CashierDemoRolesGuard } from './cashier-demo-roles.guard';
import { ReportsModule } from '../reports/reports.module';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';

@Module({
  imports: [ReportsModule, AuthModule],
  controllers: [CashierController],
  providers: [
    CashierService,
    CashierDevReadonlyAuthGuard,
    CashierDemoRolesGuard,
  ],
  exports: [CashierService],
})
export class CashierModule {}
