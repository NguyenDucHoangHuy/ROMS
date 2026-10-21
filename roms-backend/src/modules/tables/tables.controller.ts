import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả các bàn' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo bàn mới (Admin/Manager)' })
  create(
    @Body() body: { tableNumber: string; floor?: number; capacity?: number },
  ) {
    return this.tablesService.create(body);
  }

  @Get('qr/:token')
  @Public()
  @ApiOperation({
    summary: 'Lấy thông tin bàn từ QR code',
    description: 'Dành cho khách hàng quét mã QR, không cần đăng nhập.',
  })
  findByQrToken(@Param('token') token: string) {
    return this.tablesService.findByQrToken(token);
  }

  @Get('map')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy dữ liệu sơ đồ bàn' })
  getMap() {
    return this.tablesService.getMap();
  }

  @Post('merge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Gộp nhiều bàn' })
  mergeTables(
    @Body() body: { sourceTableIds: string[]; targetTableId: string },
  ) {
    return this.tablesService.mergeTables(
      body.sourceTableIds,
      body.targetTableId,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin một bàn' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.WAITER, RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Cập nhật trạng thái bàn (Dành cho nhân viên)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTableStatusDto) {
    return this.tablesService.updateStatus(id, dto.status);
  }

  @Post(':id/split')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Tách bàn' })
  splitTable(@Param('id') id: string) {
    return this.tablesService.splitTable(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Xóa bàn (Admin/Manager)' })
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
