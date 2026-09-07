import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

/**
 * JwtAuthGuard — Guard xác thực JWT cho toàn hệ thống ROMS.
 *
 * Kế thừa AuthGuard('jwt') của Passport để tự động:
 *  1. Đọc header "Authorization: Bearer <token>"
 *  2. Verify chữ ký JWT bằng JWT_ACCESS_SECRET
 *  3. Kiểm tra token hết hạn (exp claim)
 *  4. Gọi JwtStrategy.validate() → gắn kết quả vào req.user
 *
 * Tích hợp thêm logic kiểm tra @Public() decorator:
 *  - Nếu route có @Public() → BỎ QUA kiểm tra token, cho phép đi qua
 *  - Nếu route không có @Public() → BẮT BUỘC phải có token hợp lệ
 *
 * Đăng ký global trong AppModule hoặc dùng @UseGuards(JwtAuthGuard) ở Controller.
 *
 * @example
 * // Route cần xác thực (mặc định)
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile() { ... }
 *
 * @example
 * // Route public — bỏ qua JWT
 * @Public()
 * @Post('login')
 * login() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Kiểm tra @Public() decorator trên handler (method) hoặc class (controller)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Route public → bỏ qua xác thực, cho phép đi qua
    if (isPublic) {
      return true;
    }

    // Route cần xác thực → delegate cho Passport JWT strategy
    return super.canActivate(context);
  }

  /**
   * Override handleRequest để tuỳ chỉnh message lỗi khi xác thực thất bại.
   * Passport mặc định trả về lỗi rất generic.
   */
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
  ): TUser {
    // Token sai chữ ký hoặc hết hạn
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Access token has expired. Please refresh your token.');
    }

    // Token không hợp lệ (sai format, bị giả mạo)
    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid access token.');
    }

    // Không có token (Authorization header thiếu)
    if (err || !user) {
      throw new UnauthorizedException('Authentication required. Please login.');
    }

    return user;
  }
}
