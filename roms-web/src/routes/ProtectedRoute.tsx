import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

/**
 * Guard component kiểm tra:
 * 1. Người dùng đã đăng nhập (có JWT token hợp lệ)
 * 2. Role người dùng có trong danh sách allowedRoles
 *
 * Nếu chưa đăng nhập → redirect về /login
 * Nếu đã đăng nhập nhưng không đủ quyền → redirect về /login (403)
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}
