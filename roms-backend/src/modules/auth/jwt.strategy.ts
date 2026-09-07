import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

/**
 * JwtStrategy — Passport Strategy xử lý xác thực JWT cho ROMS.
 *
 * Đây là "bộ não" đứng sau JwtAuthGuard. Khi Guard kích hoạt,
 * Passport tự động chạy Strategy này theo 2 bước:
 *
 * BƯỚC 1 (passport-jwt tự làm):
 *   - Đọc header "Authorization: Bearer <token>"
 *   - Verify chữ ký HMAC-SHA256 bằng secretOrKey (JWT_ACCESS_SECRET)
 *   - Kiểm tra exp claim (hết hạn chưa)
 *   - Nếu sai bất kỳ bước nào → throw lỗi, validate() KHÔNG được gọi
 *
 * BƯỚC 2 (validate() — code của mình):
 *   - Nhận payload đã được giải mã và verified
 *   - Kiểm tra nhẹ với DB: user còn tồn tại và isActive không?
 *   - Return JwtPayload → Passport gắn vào req.user
 *
 * Lý do chọn Hybrid (có query DB):
 *   Trong F&B, Admin cần khóa tài khoản nhân viên ngay lập tức
 *   (nghỉ việc, mất thiết bị...) mà không chờ token hết hạn 15 phút.
 *   1 query nhẹ (SELECT isActive) là đánh đổi hợp lý cho tính an toàn.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      // Trích xuất token từ header: "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Không tự ý bỏ qua exp claim — để passport-jwt tự xử lý expired error
      ignoreExpiration: false,

      // Secret để verify chữ ký — phải khớp với secret khi sign trong AuthService
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  /**
   * validate() — Được gọi sau khi passport-jwt đã verify token thành công.
   *
   * @param payload - JWT payload đã giải mã: { sub, phone, role, fullName, iat, exp }
   * @returns JwtPayload object → được gắn vào req.user cho toàn bộ request
   * @throws UnauthorizedException nếu user bị deactivate hoặc không tồn tại
   */
  async validate(payload: JwtPayload & { iat: number; exp: number }): Promise<JwtPayload> {
    // Query DB nhẹ — chỉ lấy 2 field cần thiết để kiểm tra
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isActive: true,
        role: {
          select: { name: true },
        },
      },
    });

    // User bị xoá khỏi DB (hiếm nhưng có thể xảy ra)
    if (!user) {
      throw new UnauthorizedException('Account no longer exists.');
    }

    // Admin đã deactivate tài khoản (nhân viên nghỉ việc, mất thiết bị...)
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact your manager.');
    }

    // Return object này sẽ được gắn vào req.user — @CurrentUser() đọc từ đây
    // Dùng lại data từ payload (đã verified) thay vì query thêm để tối ưu hiệu năng
    return {
      sub: payload.sub,
      phone: payload.phone,
      role: user.role.name,   // Lấy role từ DB thay vì payload — đề phòng role bị đổi
      fullName: payload.fullName,
    };
  }
}
