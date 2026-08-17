import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/constants/roles'

/**
 * Hook kiểm tra thông tin auth và vai trò người dùng.
 * Tái sử dụng ở mọi nơi cần check quyền.
 */
export function useAuth() {
  const { user, tokens, isAuthenticated, logout } = useAuthStore()

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole)
    }
    return user.role === role
  }

  return {
    user,
    tokens,
    isAuthenticated,
    logout,
    hasRole,
    role: user?.role as UserRole | undefined,
  }
}
