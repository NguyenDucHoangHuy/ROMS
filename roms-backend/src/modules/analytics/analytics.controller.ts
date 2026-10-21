import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({
    summary: 'Lấy dữ liệu thống kê tổng quan (Manager Dashboard)',
    description: 'Chỉ dành cho ADMIN và MANAGER',
  })
  getOverview() {
    return this.analyticsService.getOverviewStats();
  }
}
