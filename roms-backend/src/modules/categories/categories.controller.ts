import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

/**
 * GET /categories — danh sách danh mục món ăn.
 *
 * Phân quyền:
 *  - Mọi user đã đăng nhập đều xem được (CUSTOMER, WAITER, CHEF, MANAGER, ADMIN).
 *  - Không có endpoint ghi → không cần RolesGuard tại đây.
 *
 * Guard: JwtAuthGuard ở class-level → áp dụng cho tất cả route trong controller.
 */
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách danh mục',
    description:
      'Trả về tất cả danh mục đang hoạt động, sắp xếp theo displayOrder.',
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}
