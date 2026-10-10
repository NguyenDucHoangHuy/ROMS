import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/constants/roles'
import { isCashierDemoAuthBypassEnabled } from '@/services/cashierDemoMode'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

/**
 * Local development can preview protected screens without implementing login.
 * Production keeps the normal authentication and role checks.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, hasRole } = useAuth()

  const isCashierPath =
    location.pathname === '/cashier' || location.pathname.startsWith('/cashier/')
  if (isCashierDemoAuthBypassEnabled() && isCashierPath) {
    return <>{children}</>
  }
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }
  if (allowedRoles?.length && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
