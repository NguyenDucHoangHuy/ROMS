import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
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
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CUSTOMER, RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Khách hàng có tài khoản đã đăng nhập tạo yêu cầu đặt bàn',
  })
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: JwtPayload) {
    // Chỉ cho phép user đã đăng nhập đặt bàn, tự động liên kết với customerId = user.sub
    return this.reservationsService.create(dto, user.sub);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Xem danh sách đặt bàn (nhân viên/quản lý)' })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('today')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy đặt bàn ngày hôm nay' })
  getToday() {
    return this.reservationsService.getToday();
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách các đơn đặt bàn của khách hàng đang đăng nhập',
  })
  findMyReservations(@CurrentUser() user: JwtPayload) {
    return this.reservationsService.findMyReservations(user.sub);
  }

  @Post('check-in')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Check-in khách đặt bàn' })
  checkIn(@Body() body: any, @CurrentUser() user: JwtPayload) {
    return this.reservationsService.checkIn(body, user.sub);
  }

  @Get('code/:code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tìm đặt bàn theo mã code (hoặc id)' })
  getByConfirmationCode(@Param('code') code: string) {
    return this.reservationsService.getByConfirmationCode(code);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chi tiết đặt bàn' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/confirm')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Xác nhận đặt bàn' })
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Huỷ đặt bàn' })
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/table')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Gán bàn cho đặt bàn' })
  assignTable(@Param('id') id: string, @Body() body: { tableId: string }) {
    return this.reservationsService.assignTable(id, body.tableId);
  }
}
