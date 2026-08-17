import { useWaiterAuthStore } from '@/stores/useWaiterAuthStore'

export function useAuth() {
  const { user, token, isAuthenticated, logout } = useWaiterAuthStore()
  return { user, token, isAuthenticated, logout }
}
