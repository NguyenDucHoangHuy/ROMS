import { SetMetadata } from '@nestjs/common';

/**
 * Key dùng để đánh dấu route là Public trong Reflector metadata.
 * JwtAuthGuard sẽ đọc key này để bỏ qua kiểm tra token.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — Decorator đánh dấu route KHÔNG cần xác thực JWT.
 *
 * Dùng cho các endpoint công khai:
 *  - POST /auth/login
 *  - POST /auth/register  (chỉ tạo CUSTOMER)
 *  - GET  /menu-items     (khách QR xem thực đơn)
 *  - GET  /tables/:id     (khách QR quét mã bàn)
 *
 * @example
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
