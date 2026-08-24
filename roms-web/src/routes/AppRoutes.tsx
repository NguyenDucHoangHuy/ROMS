
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserRole } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute from './ProtectedRoute'

// ============================================================
// Layouts
// ============================================================

import AdminLayout from '@/layouts/AdminLayout'
import KitchenLayout from '@/layouts/KitchenLayout'
import CashierLayout from '@/layouts/CashierLayout'
import ClientLayout from '@/layouts/ClientLayout'

// ============================================================
// Public / Feature Pages
// ============================================================

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

// ============================================================
// Cashier Pages
// ============================================================

import CashierCheckoutPage from '@/layouts/cashiers/CashierCheckoutPage'
import EndOfDayReport from '@/layouts/cashiers/EndOfDayReport'
import HistoryAndRefundPage from '@/layouts/cashiers/HistoryAndRefundPage'
import MergeBillModal from '@/layouts/cashiers/MergeBillModal'
import PendingTableDetailCheckout from '@/layouts/cashiers/PendingTableDetailCheckout'
import SplitBillModal from '@/layouts/cashiers/SplitBillModal'
import TableStatusPage from '@/layouts/cashiers/TableStatusPage'
import RevenueAndAuditLogPage from '@/layouts/cashiers/RevenueAndAuditLogPage'
import CashierSettingsPage from '@/layouts/cashiers/CashierProfileSettings'
// ============================================================
// Roles
// ============================================================

const MANAGER_ADMIN = [
  UserRole.MANAGER,
  UserRole.ADMIN,
]

// ============================================================
// App Routes
// ============================================================

export default function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC
      ====================================================== */}

      <Route
        path={ROUTES.LOGIN}
        element={<LoginPage />}
      />


      {/* ======================================================
          CUSTOMER QR
          Public - không cần login
      ====================================================== */}

      <Route element={<ClientLayout />}>

        <Route
          path="/table/:tableId/menu"
          element={<MenuPage />}
        />

        <Route
          path="/table/:tableId/cart"
          element={<CartPage />}
        />

        <Route
          path="/table/:tableId/order-status"
          element={<OrderStatusPage />}
        />

        <Route
          path="/reservation"
          element={<ReservationPage />}
        />

      </Route>


      {/* ======================================================
          KITCHEN
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              UserRole.CHEF,
              ...MANAGER_ADMIN,
            ]}
          >
            <KitchenLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/kitchen"
          element={<KitchenDashboard />}
        />

      </Route>


      {/* ======================================================
          CASHIER POS
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              UserRole.CASHIER,
              ...MANAGER_ADMIN,
            ]}
          >
            <CashierLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route
          path="/cashier"
          element={<POSDashboard />}
        />

        {/* Trạng thái bàn & sơ đồ tầng */}
        <Route
          path="/cashier/tables"
          element={<TableStatusPage />}
        />

        {/* Checkout */}
        <Route
          path="/cashier/checkout"
          element={<CashierCheckoutPage />}
        />

        {/* Chi tiết bàn đang chờ thanh toán */}
        <Route
          path="/cashier/pending-checkout"
          element={<PendingTableDetailCheckout />}
        />

        {/* Lịch sử giao dịch + hoàn tiền */}
        <Route
          path="/cashier/history-refund"
          element={<HistoryAndRefundPage />}
        />

        {/* Gộp hóa đơn */}
        <Route
          path="/cashier/merge-bill"
          element={<MergeBillModal />}
        />

        {/* Tách hóa đơn */}
        <Route
          path="/cashier/split-bill"
          element={<SplitBillModal />}
        />

        {/* Báo cáo cuối ngày */}
        <Route
          path="/cashier/end-of-day"
          element={<EndOfDayReport />}
        />

        {/* Thống kê doanh thu & nhật ký audit */}
        <Route
          path="/cashier/revenue-audit-log"
          element={<RevenueAndAuditLogPage />}
        />

        {/* Cài đặt */}
        <Route
          path="/cashier/settings"
          element={<CashierSettingsPage />}
        />

      </Route>


      {/* ======================================================
          MANAGER / ADMIN
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={MANAGER_ADMIN}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path={ROUTES.MANAGER.ROOT}
          element={
            <Navigate
              to={ROUTES.MANAGER.ANALYTICS}
              replace
            />
          }
        />

        <Route
          path={ROUTES.MANAGER.ANALYTICS}
          element={<AnalyticsDashboard />}
        />

        <Route
          path={ROUTES.MANAGER.MENU}
          element={<MenuManagement />}
        />

        <Route
          path={ROUTES.MANAGER.INVENTORY}
          element={<InventoryPage />}
        />

        <Route
          path={ROUTES.MANAGER.HR}
          element={<HRPage />}
        />

        <Route
          path={ROUTES.MANAGER.PROMOTIONS}
          element={<PromotionsPage />}
        />

        <Route
          path={ROUTES.MANAGER.AUDIT_LOGS}
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.ADMIN]}
            >
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* ======================================================
          FALLBACK
      ====================================================== */}

      {/* Root */}
      <Route
        path="/"
        element={
          <Navigate
            to="/cashier"
            replace
          />
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/cashier"
            replace
          />
        }
      />

    </Routes>
  )
}
