import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiForbiddenResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateRecipesDto } from './dto/update-recipes.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { MenuItemsService } from './menu-items.service';

/**
 * MenuItemsController — phân quyền theo route:
 *
 *  GET  /menu-items           → Public hoặc mọi user đã login
 *  GET  /menu-items/:id       → Public hoặc mọi user đã login
 *  POST /menu-items           → chỉ MANAGER, ADMIN (Tạo món mới)
 *  PATCH /menu-items/:id      → chỉ MANAGER, ADMIN (Sửa thông tin món)
 *  DELETE /menu-items/:id     → chỉ MANAGER, ADMIN (Xóa món)
 *  PATCH /menu-items/:id/availability → CHEF, MANAGER, ADMIN (Bật/tắt còn/hết món)
 */
@ApiTags('Menu Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách món ăn',
    description:
      'Lọc theo categoryId nếu truyền query param. Bao gồm thông tin nguyên liệu và cảnh báo tồn kho thấp.',
  })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.menuItemsService.findAll(categoryId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết 1 món ăn' })
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Post()
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tạo món ăn mới' })
  @ApiForbiddenResponse({
    description: 'Chỉ MANAGER hoặc ADMIN mới được phép.',
  })
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(dto);
  }

  @Patch(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật món ăn' })
  @ApiForbiddenResponse({
    description: 'Chỉ MANAGER hoặc ADMIN mới được phép.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xóa món ăn' })
  @ApiForbiddenResponse({
    description: 'Chỉ MANAGER hoặc ADMIN mới được phép.',
  })
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }

  // ──────────────────────────────────────────────────────────
  // PATCH /menu-items/:id/availability — chỉ nội bộ
  // ──────────────────────────────────────────────────────────

  @Patch(':id/availability')
  @Roles(RoleName.CHEF, RoleName.MANAGER, RoleName.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Bật/tắt trạng thái có sẵn của món',
    description:
      'CHEF dùng để đánh dấu món hết nguyên liệu (isAvailable=false). ' +
      'MANAGER/ADMIN dùng để ẩn/hiện món trên thực đơn. ' +
      'Sau khi cập nhật sẽ emit socket event menu:item-updated.',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ CHEF, MANAGER hoặc ADMIN mới được phép.',
  })
  updateAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.menuItemsService.updateAvailability(id, dto.isAvailable);
  }

  @Put(':id/recipes')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.CHEF)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Cập nhật công thức và định lượng nguyên liệu cho món ăn (Recipe BOM)',
    description:
      'Thiết lập định lượng nguyên liệu kho tiêu hao cho mỗi phần ăn. ' +
      'Tự động tính toán lại giá vốn và cảnh báo tồn kho, đồng thời emit socket menu:item-updated.',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ MANAGER, ADMIN hoặc CHEF mới được phép.',
  })
  updateRecipes(@Param('id') id: string, @Body() dto: UpdateRecipesDto) {
    return this.menuItemsService.updateRecipes(id, dto);
  }
}
