import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GatewaysModule } from './gateways/gateways.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TablesModule } from './modules/tables/tables.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { DiningSessionsModule } from './modules/dining-sessions/dining-sessions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BillingModule } from './modules/billing/billing.module';
import { HrModule } from './modules/hr/hr.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CashierModule } from './modules/cashier/cashier.module';
import { ReportsModule } from './modules/reports/reports.module';
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    GatewaysModule,
    AuthModule,
    UsersModule,
    TablesModule,
    CategoriesModule,
    MenuItemsModule,
    ReservationsModule,
    DiningSessionsModule,
    OrdersModule,
    InventoryModule,
    BillingModule,
    HrModule,
    AuditLogsModule,
    CashierModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
