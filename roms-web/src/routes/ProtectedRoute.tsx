
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

/**
 * ProtectedRoute - Kiểm tra xác thực & Phân quyền truy cập (RBAC)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, tokens, user } = useAuthStore()
  const location = useLocation()

  // 1. Nếu chưa đăng nhập hoặc không có accessToken -> Chuyển về /login kèm route muốn đến
  if (!isAuthenticated || !tokens?.accessToken) {
    return <Navigate to={ROUTES.LOGIN} state={{ redirectTo: location.pathname }} replace />
  }

  // 2. Nếu đã đăng nhập nhưng vai trò không khớp danh sách cho phép
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'CASHIER') {
        return <Navigate to="/cashier" replace />
      }
      if (user.role === 'CHEF') {
        return <Navigate to="/kitchen" replace />
      }
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
