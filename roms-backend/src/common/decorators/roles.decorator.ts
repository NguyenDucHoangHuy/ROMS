import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@prisma/client';

/**
 * Key dùng để lưu danh sách roles trong Reflector metadata.
 * RolesGuard sẽ đọc key này để kiểm tra quyền truy cập.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) — Decorator khai báo Role nào được phép gọi API này.
 *
 * Phải dùng KÈM với JwtAuthGuard (để có req.user) và RolesGuard (để kiểm tra role).
 * Nếu không dùng @Roles() thì mọi user đã login đều được phép (chỉ check JWT).
 *
 * Dùng RoleName enum từ Prisma để đảm bảo type-safe và khớp với database.
 *
 * @example
 * // Chỉ MANAGER và ADMIN mới xem được báo cáo
 * @Roles(RoleName.MANAGER, RoleName.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('reports')
 * getReports() { ... }
 *
 * @example
 * // Chỉ CHEF mới cập nhật trạng thái món
 * @Roles(RoleName.CHEF)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Patch('items/:id/status')
 * updateStatus() { ... }
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
