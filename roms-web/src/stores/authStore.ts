import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types/user.types'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void
  updateTokens: (tokens: AuthTokens) => void
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
