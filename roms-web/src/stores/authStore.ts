import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens, LoginPayload } from '@/types/user.types'
import type { UserRole } from '@/constants/roles'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void
  updateTokens: (tokens: AuthTokens) => void
  login: (payload?: LoginPayload) => Promise<void> | void // <-- THÊM DÒNG NÀY
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      updateTokens: (tokens) =>
        set({ tokens }),

      // <-- THÊM HÀM LOGIN NÀY (Có thể gọi API thực tế hoặc Mock Data)
      login: async (payload) => {
        // Mock data giả lập người dùng sau khi đăng nhập thành công
        const mockUser: User = {
          id: 'user_123',
          name: payload?.email?.split('@')[0] || 'Khách hàng',
          email: payload?.email || null,
          phone: payload?.phone || null,
          role: 'CUSTOMER' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: 'roms-auth',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist user và tokens, không persist derived state
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
