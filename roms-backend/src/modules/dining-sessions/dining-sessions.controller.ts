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
import { DiningSessionsService } from './dining-sessions.service';
import { CreateDiningSessionDto } from './dto/create-dining-session.dto';

@ApiTags('Dining Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dining-sessions')
export class DiningSessionsController {
  constructor(private readonly diningSessionsService: DiningSessionsService) {}

  @Post()
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Mở phiên ăn mới cho bàn' })
  create(@Body() dto: CreateDiningSessionDto, @CurrentUser() user: JwtPayload) {
    return this.diningSessionsService.create(dto, user.sub);
  }

  @Get('active')
  @Roles(RoleName.WAITER, RoleName.CHEF, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách phiên ăn đang mở/thanh toán' })
  findActive() {
    return this.diningSessionsService.findActive();
  }

  @Patch(':id/close')
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Kết thúc phiên ăn, chuyển bàn sang trạng thái Dọn dẹp (CLEANING)',
  })
  closeSession(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.diningSessionsService.closeSession(id, user.sub);
  }
}
