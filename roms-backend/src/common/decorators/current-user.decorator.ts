import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RoleName } from '@prisma/client';

/**
 * Kiểu dữ liệu của User sau khi JWT được giải mã và gắn vào request.
 * Khớp chính xác với payload mà JwtStrategy trả về trong validate().
 *
 * Đây là "phiên bản gọn" của User entity — chỉ chứa thông tin cần thiết
 * cho business logic, KHÔNG có passwordHash hay refreshTokens.
 */
export interface JwtPayload {
  /** UUID của User — dùng làm sub trong JWT (RFC 7519) */
  sub: string;
  /** Số điện thoại đăng nhập */
  phone: string;
  /** Role của User — RoleName enum từ Prisma */
  role: RoleName;
  /** Tên hiển thị */
  fullName: string;
}

/**
 * @CurrentUser() — Param Decorator lấy thông tin User từ Request.
 *
 * Sau khi JwtAuthGuard xác thực token thành công, NestJS gắn payload đã giải mã
 * vào req.user. Decorator này trích xuất req.user một cách type-safe.
 *
 * PHẢI dùng sau khi đã có JwtAuthGuard (hoặc route không phải @Public()).
 *
 * @example
 * // Lấy toàn bộ thông tin user
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return this.usersService.findById(user.sub)
 * }
 *
 * @example
 * // Chỉ lấy 1 field cụ thể (sub = userId)
 * @Post('orders')
 * createOrder(@CurrentUser('sub') userId: string, @Body() dto: CreateOrderDto) {
 *   return this.ordersService.create(dto, userId)
 * }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    // Nếu truyền field cụ thể (vd: @CurrentUser('sub')) → trả về field đó
    // Nếu không truyền (vd: @CurrentUser()) → trả về toàn bộ user object
    return field ? user?.[field] : user;
  },
);
