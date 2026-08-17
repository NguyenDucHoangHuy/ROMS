import { useAuth } from './useAuth'
import { UserRole, MANAGER_ROLES, STAFF_ROLES } from '@/constants/roles'

/**
 * Hook kiểm tra quyền hạn RBAC theo role.
 * Cung cấp các helper tường minh để check permissions trong JSX.
 */
export function usePermission() {
  const { user, hasRole } = useAuth()

  return {
    // Role checks
    isAdmin: hasRole(UserRole.ADMIN),
    isManager: hasRole(UserRole.MANAGER),
    isChef: hasRole(UserRole.CHEF),
    isWaiter: hasRole(UserRole.WAITER),
    isCashier: hasRole(UserRole.CASHIER),
    isCustomer: hasRole(UserRole.CUSTOMER),

    // Group checks
    isManagerOrAbove: hasRole(MANAGER_ROLES),
    isStaff: hasRole(STAFF_ROLES),

    // Feature-level permissions
    canManageMenu: hasRole(MANAGER_ROLES),
    canManageInventory: hasRole(MANAGER_ROLES),
    canManageHR: hasRole(MANAGER_ROLES),
    canViewAnalytics: hasRole(MANAGER_ROLES),
    canRefundOrder: hasRole(MANAGER_ROLES),
    canProcessPayment: hasRole([UserRole.CASHIER, ...MANAGER_ROLES]),
    canUpdateKitchenStatus: hasRole([UserRole.CHEF, ...MANAGER_ROLES]),
    canManageTables: hasRole([UserRole.WAITER, ...MANAGER_ROLES]),
    canViewAuditLogs: hasRole([UserRole.ADMIN]),
    canManageAccounts: hasRole([UserRole.ADMIN]),

    // Raw
    user,
    hasRole,
  }
}
