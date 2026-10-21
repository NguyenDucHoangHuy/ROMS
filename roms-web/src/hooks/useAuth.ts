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
    // Backend trả flat: { accessToken, refreshToken, user }
    const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken }
    setAuth(response.user, tokens)
    return response.user
  }

  const register = async (payload: { fullName: string; phone: string; password: string }) => {
    const response = await authService.register(payload)
    const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken }
    setAuth(response.user, tokens)
    return response.user
  }

  const doLogout = async () => {
    const currentTokens = useAuthStore.getState().tokens
    if (currentTokens?.refreshToken) {
      try {
        await authService.logout(currentTokens.refreshToken)
      } catch {
        // Ignore logout errors, always clear local state
      }
    }
    logout()
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
    login,
    register,
    logout: doLogout, // doLogout gọi API rồi mới xoá state local
    hasRole,
    role: user?.role as UserRole | undefined,
  }
}
