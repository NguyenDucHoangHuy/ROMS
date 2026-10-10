import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleName } from '@prisma/client';
import type { Request } from 'express';
import { ReportsService } from '../reports/reports.service';
import { CashierService } from './cashier.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateRefundDto } from './dto/refund.dto';
import { CreateSplitBillDto } from './dto/split-bill.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { MergeTablesDto } from './dto/merge-tables.dto';
import { CashierDevReadonlyAuthGuard } from './cashier-dev-readonly.guard';
import { CashierDemoRolesGuard } from './cashier-demo-roles.guard';
import {
  CASHIER_DEMO_EXECUTION_CONTEXT,
  CashierDemoMutation,
  CashierDemoReadonly,
} from '../auth/cashier-demo-readonly.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('cashier')
@UseGuards(CashierDevReadonlyAuthGuard, CashierDemoRolesGuard)
@Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
export class CashierController {
  constructor(
    private readonly cashierService: CashierService,
    private readonly reportsService: ReportsService,
    private readonly config: ConfigService,
  ) {}

  @Get('tables')
  @CashierDemoReadonly()
  getTables() {
    return this.cashierService.getTables();
  }

  @Get('menu')
  @CashierDemoReadonly()
  getMenu() {
    return this.cashierService.getMenu();
  }

  @Get('tables/:tableId/order')
  @CashierDemoReadonly()
  getTableOrder(@Param('tableId', new ParseUUIDPipe()) tableId: string) {
    return this.cashierService.getTableOrder(tableId);
  }

  @Get('transactions')
  @CashierDemoReadonly()
  getTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    return this.cashierService.getTransactions({
      page: page === undefined ? undefined : Number(page),
      limit: limit === undefined ? undefined : Number(limit),
      from,
      to,
      search,
    });
  }

  @Post('tables/merge')
  @CashierDemoMutation()
  async mergeTables(@Body() dto: MergeTablesDto, @Req() req: Request) {
    return this.cashierService.mergeTables(
      dto,
      await this.resolveCashierId(req),
    );
  }

  @Post('tables/:tableId/mark-clean')
  @CashierDemoMutation()
  async markTableClean(@Param('tableId') tableId: string, @Req() req: Request) {
    return this.cashierService.markTableClean(
      tableId,
      await this.resolveCashierId(req),
    );
  }

  @Post('orders')
  @CashierDemoMutation()
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = await this.resolveCashierId(req);
    return this.cashierService.createOrder(dto, userId);
  }

  @Post('orders/:orderId/items')
  addOrderItem(
    @Param('orderId') orderId: string,
    @Body() dto: AddOrderItemDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.cashierService.addOrderItem(orderId, dto, userId);
  }

  @Patch('order-items/:orderItemId')
  updateOrderItem(
    @Param('orderItemId') orderItemId: string,
    @Body() dto: UpdateOrderItemDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.cashierService.updateOrderItem(orderItemId, dto, userId);
  }

  @Delete('order-items/:orderItemId')
  removeOrderItem(
    @Param('orderItemId') orderItemId: string,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.cashierService.removeOrderItem(orderItemId, userId);
  }

  @Post('bills/validate-promotion')
  @CashierDemoMutation()
  validatePromotion(@Body() dto: ValidatePromotionDto) {
    return this.cashierService.validatePromotion(dto);
  }

  @Post('sessions/:sessionId/bill')
  @CashierDemoMutation()
  async createBill(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateBillDto,
    @Req() req: Request,
  ) {
    const userId = await this.resolveCashierId(req);
    return this.cashierService.createBill(sessionId, dto, userId);
  }

  @Post('payments')
  @CashierDemoMutation()
  async createPayment(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const userId = await this.resolveCashierId(req);
    return this.cashierService.createPayment(dto, userId);
  }

  @Post('payments/:paymentId/refund')
  @CashierDemoMutation()
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  async createRefund(
    @Param('paymentId') paymentId: string,
    @Body() dto: CreateRefundDto,
    @Req() req: Request,
  ) {
    const userId = await this.resolveRefundApproverId(req);
    return this.cashierService.createRefund(
      paymentId,
      { ...dto, managerId: userId },
      userId,
    );
  }

  @Post('bills/:billId/split')
  @CashierDemoMutation()
  async splitBill(
    @Param('billId', new ParseUUIDPipe()) billId: string,
    @Body() dto: CreateSplitBillDto,
    @Req() req: Request,
  ) {
    const userId = await this.resolveCashierId(req);
    return this.cashierService.splitBill(billId, dto, userId);
  }

  @Get('revenue')
  @CashierDemoReadonly()
  getRevenue(
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getRevenueSummary({
      period: period ?? 'month',
      from,
      to,
    });
  }

  @Get('audit-logs')
  @CashierDemoReadonly()
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('entityName') entityName?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    return this.reportsService.getAuditLogs({
      page: Number(page ?? 1),
      limit: Number(limit ?? 20),
      action,
      entityName,
      from,
      to,
      search,
    });
  }

  @Get('end-of-day')
  @CashierDemoReadonly()
  getEndOfDayReport(@Query('date') date?: string) {
    return this.reportsService.getEndOfDayReport(
      date ?? new Date().toISOString().slice(0, 10),
    );
  }

  @Get('shifts/current')
  @CashierDemoReadonly()
  async getCurrentShift(@Req() req: Request) {
    return this.cashierService.getCurrentShiftForUser(
      await this.resolveCashierId(req),
    );
  }

  @Post('shifts/start')
  startShift(@Req() req: Request) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new BadRequestException('User id is required to start a shift');
    }

    return this.cashierService.startShift(userId);
  }

  @Post('shifts/close')
  closeShift(@Req() req: Request) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new BadRequestException('User id is required to close a shift');
    }
    return this.cashierService.closeShift(userId);
  }

  private extractUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { sub?: string; id?: string } })
      .user;
    const userId = user?.sub ?? user?.id;
    if (userId) return userId;
    throw new UnauthorizedException('A valid authenticated user is required');
  }

  private async resolveCashierId(req: Request): Promise<string> {
    const authenticatedUserId = this.getAuthenticatedUserId(req);
    if (authenticatedUserId) return authenticatedUserId;
    if (!this.isDemoExecution(req)) {
      throw new UnauthorizedException('A valid authenticated user is required');
    }

    return this.cashierService.validateDemoCashierIdentity(
      this.config.get<string>('CASHIER_DEMO_CASHIER_ID'),
    );
  }

  private async resolveRefundApproverId(req: Request): Promise<string> {
    const authenticatedUserId = this.getAuthenticatedUserId(req);
    if (authenticatedUserId) return authenticatedUserId;
    if (!this.isDemoExecution(req)) {
      throw new UnauthorizedException('A valid authenticated user is required');
    }

    return this.cashierService.validateDemoRefundApprover(
      this.config.get<string>('CASHIER_DEMO_REFUND_APPROVER_ID'),
    );
  }

  private getAuthenticatedUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { sub?: string; id?: string } })
      .user;
    return user?.sub ?? user?.id;
  }

  private isDemoExecution(req: Request): boolean {
    return (
      this.config.get<string>('CASHIER_DEMO_AUTH_BYPASS') === 'true' &&
      this.config.get<string>('NODE_ENV') === 'development' &&
      (req as Request & Record<PropertyKey, unknown>)[
        CASHIER_DEMO_EXECUTION_CONTEXT
      ] === true
    );
  }
}
