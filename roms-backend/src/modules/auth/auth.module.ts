import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

/**
 * AuthModule — Module xác thực và phân quyền của ROMS.
 *
 * Đăng ký:
 *  - PassportModule: framework xác thực, defaultStrategy = 'jwt'
 *  - JwtModule: công cụ sign và verify token (dùng registerAsync để tránh race condition)
 *  - JwtStrategy: logic validate payload sau khi token được verify
 *
 * JwtModule.registerAsync() dùng ConfigService thay vì process.env trực tiếp.
 * Điều này đảm bảo ConfigModule đọc xong .env TRƯỚC khi JwtModule khởi tạo.
 *
 * Refresh Token KHÔNG dùng JwtModule — sẽ được sign riêng trong AuthService
 * với JWT_REFRESH_SECRET và lưu hash vào bảng refresh_tokens.
 */
@Module({
  imports: [
    PrismaModule,
    ConfigModule, // Đảm bảo ConfigService được inject vào useFactory bên dưới

    // Strategy mặc định là 'jwt' — Guard không cần khai báo tên strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // registerAsync → useFactory chỉ chạy sau khi ConfigService đã sẵn sàng
    // Loại bỏ hoàn toàn race condition với process.env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // getOrThrow() → crash ngay lúc khởi động nếu thiếu biến môi trường
        // Rõ ràng và fail-fast hơn manual if(!secret) check
        const secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');

        // Cast string → StringValue (branded type của thư viện ms)
        // ms là transitive dep: @nestjs/jwt → jsonwebtoken → ms
        // Giá trị '15m', '1h', '7d'... đều hợp lệ với StringValue
        const expiresIn = (
          config.get<string>('JWT_ACCESS_EXPIRY') ?? '15m'
        ) as StringValue;

        return {
          secret,
          signOptions: {
            expiresIn,      // StringValue ✓ — khớp type của JwtModule v11
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,  // Passport strategy — tự động nhận diện qua naming convention
    AuthService,  // Business logic: register, login, refresh, logout
  ],
  controllers: [
    AuthController, // HTTP endpoints: POST /auth/register, /login, /refresh, /logout
  ],
  exports: [
    JwtModule,      // Export để AuthService dùng JwtService.sign()
    PassportModule, // Export để JwtAuthGuard trong common/ hoạt động đúng
  ],
})
export class AuthModule { }

