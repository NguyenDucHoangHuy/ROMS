import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // POST /api/v1/auth/register
  // ============================================================

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản khách hàng',
    description:
      'Tạo tài khoản CUSTOMER mới để đặt bàn qua web QR. ' +
      'Các tài khoản nội bộ (WAITER, CHEF...) do Admin/Manager tạo riêng.',
  })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Số điện thoại đã được đăng ký' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ============================================================
  // POST /api/v1/auth/login
  // ============================================================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Mặc định POST trả 201, login nên trả 200
  @ApiOperation({
    summary: 'Đăng nhập — dùng chung cho tất cả Role',
    description:
      'Xác thực bằng số điện thoại + mật khẩu. ' +
      'Trả về Access Token (15m) và Refresh Token (7d). ' +
      'Role của user được gắn tự động vào token từ Database.',
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về token' })
  @ApiResponse({ status: 401, description: 'Sai số điện thoại hoặc mật khẩu' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    // Truyền Device Info và IP để lưu vào refresh_tokens table (phục vụ audit)
    const deviceInfo = req.headers['user-agent'];
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
      req.socket.remoteAddress;

    return this.authService.login(dto, deviceInfo, ipAddress);
  }

  // ============================================================
  // POST /api/v1/auth/refresh
  // ============================================================

  @Public() // Public vì Access Token đã hết hạn — không thể dùng JwtAuthGuard
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới Token (Refresh Token Rotation)',
    description:
      'Dùng Refresh Token để nhận cặp Access + Refresh Token mới. ' +
      'Token cũ bị thu hồi ngay sau khi dùng (Rotation Strategy). ' +
      'Nếu token bị dùng lại (reuse) → Tất cả phiên đăng nhập bị vô hiệu.',
  })
  @ApiResponse({ status: 200, description: 'Token mới đã được cấp phát' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
      req.socket.remoteAddress;

    return this.authService.refreshTokens(dto.refreshToken, deviceInfo, ipAddress);
  }

  // ============================================================
  // POST /api/v1/auth/logout
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đăng xuất — Thu hồi Refresh Token của phiên hiện tại',
    description:
      'Thu hồi Refresh Token được gửi lên. ' +
      'Chỉ vô hiệu hoá phiên hiện tại, không ảnh hưởng các thiết bị khác.',
  })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  logout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.logout(user.sub, dto.refreshToken);
  }
}
