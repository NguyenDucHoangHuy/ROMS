
import React from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

/**
 * ProtectedRoute - DEVELOPMENT MODE
 *
 * Tạm thời bỏ qua authentication và role checking
 * để thuận tiện test toàn bộ frontend.
 *
 * Khi chuyển production:
 * - Kiểm tra JWT
 * - Kiểm tra isAuthenticated
 * - Kiểm tra role
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  if (import.meta.env.DEV) {
    console.log('🔓 ProtectedRoute: DEV BYPASS')
    console.log('Allowed roles:', allowedRoles)
  }

  return <>{children}</>
}
