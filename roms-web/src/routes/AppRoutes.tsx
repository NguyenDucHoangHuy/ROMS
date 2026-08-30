import { Routes, Route, Navigate } from 'react-router-dom'
import { UserRole } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute from './ProtectedRoute'

// Layouts
import AdminLayout from '@/layouts/AdminLayout'
// import KitchenLayout from '@/layouts/KitchenLayout'
import CashierLayout from '@/layouts/CashierLayout'
import ClientLayout from '@/layouts/ClientLayout'

// Feature pages — lazy import trong tương lai khi cần code-splitting

// Auth
import LoginPage from '@/features/auth/LoginPage'

// Customer QR
import MenuPage from '@/features/client-qr/MenuPage'
import CartPage from '@/features/client-qr/CartPage'
import OrderStatusPage from '@/features/client-qr/OrderStatusPage'
import ReservationPage from '@/features/client-qr/ReservationPage'
import HomePage from '@/features/client-qr/HomePage'
import DishDetail from '@/features/client-qr/DishDetail'
import DepositPage from '@/features/client-qr/DepositPage'
import ReservationDetail from '@/features/client-qr/ReservationDetail'
import AboutUsPage from '@/features/client-qr/AboutUsPage'

// Kitchen Display System (KDS) — Chef Portal + màn hình bếp
import ChefDashboard from '@/features/kds-kitchen/ChefDashboard'
import ChefMenuManagement from '@/features/kds-kitchen/ChefMenuManagement'
import ChefKitchenQueue from '@/features/kds-kitchen/ChefKitchenQueue'
import ChefInventory from '@/features/kds-kitchen/ChefInventory'
import ChefAIAnalytics from '@/features/kds-kitchen/ChefAIAnalytics'

// Cashier & Manager
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
      {/* ── Public / Auth ── */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* ── Customer QR (public, no auth needed) ── */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/table/:tableId/menu" element={<MenuPage />} />
        <Route path="/table/:tableId/cart" element={<CartPage />} />
        <Route path="/table/:tableId/order-status" element={<OrderStatusPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/reservation/:reservationId" element={<ReservationDetail />} />
        <Route path="/dish/:dishId" element={<DishDetail />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/about" element={<AboutUsPage />} />
      </Route>

      {/* ── KDS Kitchen — Chef Portal (Đã gỡ bọc ProtectedRoute để dev UI) ── */}
      <Route path="/kitchen" element={<ChefDashboard />} />
      <Route path="/kitchen/queue" element={<ChefKitchenQueue />} />
      <Route path="/kitchen/menu" element={<ChefMenuManagement />} />
      <Route path="/kitchen/inventory" element={<ChefInventory />} />
      <Route path="/kitchen/analytics" element={<ChefAIAnalytics />} />

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
