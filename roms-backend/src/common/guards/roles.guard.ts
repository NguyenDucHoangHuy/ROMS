import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';
import { Request } from 'express';

/**
 * RolesGuard — Guard kiểm tra RBAC (Role-Based Access Control).
 *
 * Hoạt động PHỐI HỢP với JwtAuthGuard:
 *  - JwtAuthGuard chạy trước: xác thực token, gắn req.user
 *  - RolesGuard chạy sau: đọc req.user.role, so sánh với @Roles() metadata
 *
 * Logic quyết định:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ Có @Roles() metadata?                                   │
 *  │   → KHÔNG: Cho phép (chỉ cần đã login — JwtAuthGuard)  │
 *  │   → CÓ: Kiểm tra req.user.role có trong danh sách không │
 *  │        → CÓ: Cho phép                                   │
 *  │        → KHÔNG: 403 Forbidden                           │
 *  └─────────────────────────────────────────────────────────┘
 *
 * LUÔN dùng sau JwtAuthGuard — thứ tự trong @UseGuards() rất quan trọng:
 * @UseGuards(JwtAuthGuard, RolesGuard)  ← đúng thứ tự
 *
 * @example
 * // Chỉ MANAGER và ADMIN xem analytics
 * @Roles(RoleName.MANAGER, RoleName.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('analytics')
 * getAnalytics() { ... }
 *
 * @example
 * // Chỉ CHEF cập nhật trạng thái món (COOKING → READY)
 * @Roles(RoleName.CHEF)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Patch('items/:id/status')
 * updateItemStatus() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Đọc @Roles() metadata — ưu tiên method-level, fallback về class-level
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Không có @Roles() → route chỉ cần login (không giới hạn role) → cho phép
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy user từ request (đã được JwtAuthGuard gắn vào)
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    // Kiểm tra role của user có trong danh sách requiredRoles không
    const hasRole = requiredRoles.includes(user?.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role(s): [${requiredRoles.join(', ')}]. Your role: ${user?.role ?? 'unknown'}.`,
      );
    }

    return true;
  }
}
