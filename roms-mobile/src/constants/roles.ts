export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CHEF = 'CHEF',
  WAITER = 'WAITER',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị hệ thống',
  [UserRole.MANAGER]: 'Quản lý nhà hàng',
  [UserRole.CHEF]: 'Bộ phận bếp',
  [UserRole.WAITER]: 'Nhân viên phục vụ',
  [UserRole.CASHIER]: 'Thu ngân',
  [UserRole.CUSTOMER]: 'Khách hàng',
}
