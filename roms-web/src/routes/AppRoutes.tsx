import { Routes, Route, Navigate } from 'react-router-dom'
import { UserRole } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute from './ProtectedRoute'

// Layouts
import AdminLayout from '@/layouts/AdminLayout'
import KitchenLayout from '@/layouts/KitchenLayout'
import CashierLayout from '@/layouts/CashierLayout'
import ClientLayout from '@/layouts/ClientLayout'

// Feature pages — lazy import trong tương lai khi cần code-splitting
import LoginPage from '@/features/auth/LoginPage'
import MenuPage from '@/features/client-qr/MenuPage'
import CartPage from '@/features/client-qr/CartPage'
import OrderStatusPage from '@/features/client-qr/OrderStatusPage'
import ReservationPage from '@/features/client-qr/ReservationPage'
import KitchenDashboard from '@/features/kds-kitchen/KitchenDashboard'
import POSDashboard from '@/features/cashier-pos/POSDashboard'
import AnalyticsDashboard from '@/features/manager/analytics/AnalyticsDashboard'
import MenuManagement from '@/features/manager/menu/MenuManagement'
import InventoryPage from '@/features/manager/inventory/InventoryPage'
import HRPage from '@/features/manager/hr/HRPage'
import PromotionsPage from '@/features/manager/promotions/PromotionsPage'
import AuditLogsPage from '@/features/manager/audit-logs/AuditLogsPage'

const MANAGER_ADMIN = [UserRole.MANAGER, UserRole.ADMIN]

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* ── Customer QR (public, no auth needed) ── */}
      <Route element={<ClientLayout />}>
        <Route path="/table/:tableId/menu" element={<MenuPage />} />
        <Route path="/table/:tableId/cart" element={<CartPage />} />
        <Route path="/table/:tableId/order-status" element={<OrderStatusPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Route>

      {/* ── Kitchen (Chef only) ── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[UserRole.CHEF, ...MANAGER_ADMIN]}>
            <KitchenLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/kitchen" element={<KitchenDashboard />} />
      </Route>

      {/* ── Cashier POS ── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[UserRole.CASHIER, ...MANAGER_ADMIN]}>
            <CashierLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/cashier" element={<POSDashboard />} />
      </Route>

      {/* ── Manager / Admin Dashboard ── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={MANAGER_ADMIN}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.MANAGER.ROOT} element={<Navigate to={ROUTES.MANAGER.ANALYTICS} replace />} />
        <Route path={ROUTES.MANAGER.ANALYTICS} element={<AnalyticsDashboard />} />
        <Route path={ROUTES.MANAGER.MENU} element={<MenuManagement />} />
        <Route path={ROUTES.MANAGER.INVENTORY} element={<InventoryPage />} />
        <Route path={ROUTES.MANAGER.HR} element={<HRPage />} />
        <Route path={ROUTES.MANAGER.PROMOTIONS} element={<PromotionsPage />} />
        <Route
          path={ROUTES.MANAGER.AUDIT_LOGS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── Fallback ── */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
