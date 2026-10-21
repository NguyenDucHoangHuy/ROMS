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
import { RoleName } from '@prisma/client';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên (Admin/Manager)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhân viên/người dùng' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me/profile')
  @Roles() // Allow any authenticated user
  @ApiOperation({ summary: 'Lấy thông tin profile của chính mình' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @Get(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một người dùng' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Deactivate tài khoản' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
