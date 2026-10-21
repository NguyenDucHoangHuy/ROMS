import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('sessions/:sessionId/bill')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo hoặc lấy hóa đơn cho một phiên ăn' })
  generateBill(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.billingService.generateBill(sessionId, user.sub);
  }

  @Post('sessions/:sessionId/pay')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Thanh toán hóa đơn' })
  processPayment(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.billingService.processPayment(sessionId, user.sub, dto);
  }

  @Get('history')
  @Roles(RoleName.CASHIER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lịch sử thanh toán (các hóa đơn đã thanh toán)' })
  getHistory() {
    return this.billingService.getHistory();
  }
}
