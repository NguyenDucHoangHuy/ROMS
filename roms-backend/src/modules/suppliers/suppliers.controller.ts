import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.MANAGER)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Thống kê tổng quan về nhà cung cấp (Admin/Manager)',
  })
  getStats() {
    return this.suppliersService.getStats();
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách nhà cung cấp (hỗ trợ search và lọc category)',
  })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.suppliersService.findAll(search, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết nhà cung cấp theo ID' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm nhà cung cấp mới (Admin/Manager)' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp (Admin/Manager)' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhà cung cấp (Admin/Manager)' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
