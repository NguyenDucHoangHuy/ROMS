import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/constants/roles'
import { authService } from '@/services/modules/authService'

/**
 * Hook kiểm tra thông tin auth và vai trò người dùng.
 * Tái sử dụng ở mọi nơi cần check quyền.
 */
export function useAuth() {
  const { user, tokens, isAuthenticated, setAuth, logout } = useAuthStore()

  const login = async (payload: { phone?: string; email?: string; password: string }) => {
    const response = await authService.login(payload)
    setAuth(response.user, response.tokens)
    return response.user
  }

  const register = async (payload: { name: string; phone: string; password: string }) => {
    const response = await authService.register(payload)
    setAuth(response.user, response.tokens)
    return response.user
  }

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
    login, // 2. Bổ sung login vào object return
    register,
    logout,
    hasRole,
    role: user?.role as UserRole | undefined,
  }
}
