
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
// Auth
// ============================================================

import LoginPage from '@/features/auth/LoginPage'

// ============================================================
// Customer QR — public, không cần login
// ============================================================

import MenuPage from '@/features/client-qr/MenuPage'
import CartPage from '@/features/client-qr/CartPage'
import OrderStatusPage from '@/features/client-qr/OrderStatusPage'
import ReservationPage from '@/features/client-qr/ReservationPage'
import HomePage from '@/features/client-qr/HomePage'
import DishDetail from '@/features/client-qr/DishDetail'
import DepositPage from '@/features/client-qr/DepositPage'
import ReservationDetail from '@/features/client-qr/ReservationDetail'
import AboutUsPage from '@/features/client-qr/AboutUsPage'

// ============================================================
// Kitchen Display System (KDS) — Chef Portal
// ============================================================

import ChefDashboard from '@/features/kds-kitchen/ChefDashboard'
import ChefMenuManagement from '@/features/kds-kitchen/ChefMenuManagement'
import ChefKitchenQueue from '@/features/kds-kitchen/ChefKitchenQueue'
import ChefInventory from '@/features/kds-kitchen/ChefInventory'
import ChefAIAnalytics from '@/features/kds-kitchen/ChefAIAnalytics'

// ============================================================
// Cashier POS
// ============================================================

import POSDashboard from '@/features/cashier-pos/POSDashboard'
import CashierCheckoutPage from '@/features/cashier-pos/CashierCheckoutPage'
import EndOfDayReport from '@/features/cashier-pos/EndOfDayReport'
import HistoryAndRefundPage from '@/features/cashier-pos/HistoryAndRefundPage'
import MergeBillModal from '@/features/cashier-pos/MergeBillModal'
import PendingTableDetailCheckout from '@/features/cashier-pos/PendingTableDetailCheckout'
import SplitBillModal from '@/features/cashier-pos/SplitBillModal'
import TableStatusPage from '@/features/cashier-pos/TableStatusPage'
import RevenueAndAuditLogPage from '@/features/cashier-pos/RevenueAndAuditLogPage'
import CashierSettingsPage from '@/features/cashier-pos/CashierProfileSettings'

// ============================================================
// Manager / Admin
// ============================================================

import AnalyticsDashboard from '@/features/manager/analytics/AnalyticsDashboard'
import FloorMapView from '@/features/manager/floor-map/FloorMapView'
import MenuView from '@/features/manager/menu/MenuView'
import InventoryView from '@/features/manager/inventory/InventoryView'
import SuppliersView from '@/features/manager/suppliers/SuppliersView'
import AttendanceView from '@/features/manager/atendance/AttendanceView'
import LeaveView from '@/features/manager/leave-request-approval/LeaveView'
import ScheduleView from '@/features/manager/staffs-manage/ScheduleView'
import PeopleView from '@/features/manager/staffs-manage/PeopleView'
import EmployeesView from '@/features/manager/hr/EmployeesView'
import OrdersView from '@/features/manager/orders-billing/OrdersView'
import OverviewView from '@/features/manager/overview/OverviewView'
import PromotionsPage from '@/features/manager/promotions/PromotionsPage'
import AuditLogsPage from '@/features/manager/audit-logs/AuditLogsPage'

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
          PUBLIC / AUTH
      ====================================================== */}

      <Route path={ROUTES.LOGIN} element={<LoginPage />} />


      {/* ======================================================
          CUSTOMER QR — public, không cần login
      ====================================================== */}

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


      {/* ======================================================
          KITCHEN / KDS — Chef Portal (gỡ ProtectedRoute để dev UI)
      ====================================================== */}

      <Route path="/kitchen" element={<ChefDashboard />} />
      <Route path="/kitchen/queue" element={<ChefKitchenQueue />} />
      <Route path="/kitchen/menu" element={<ChefMenuManagement />} />
      <Route path="/kitchen/inventory" element={<ChefInventory />} />
      <Route path="/kitchen/analytics" element={<ChefAIAnalytics />} />


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
        <Route path="/cashier" element={<POSDashboard />} />
        <Route path="/cashier/tables" element={<TableStatusPage />} />
        <Route path="/cashier/checkout" element={<CashierCheckoutPage />} />
        <Route path="/cashier/pending-checkout" element={<PendingTableDetailCheckout />} />
        <Route path="/cashier/history-refund" element={<HistoryAndRefundPage />} />
        <Route path="/cashier/merge-bill" element={<MergeBillModal />} />
        <Route path="/cashier/split-bill" element={<SplitBillModal />} />
        <Route path="/cashier/end-of-day" element={<EndOfDayReport />} />
        <Route path="/cashier/revenue-audit-log" element={<RevenueAndAuditLogPage />} />
        <Route path="/cashier/settings" element={<CashierSettingsPage />} />
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

        {/* Root → Overview */}
        <Route
          path={ROUTES.MANAGER.ROOT}
          element={<Navigate to={ROUTES.MANAGER.OVERVIEW} replace />}
        />

        {/* ───────────── VẬN HÀNH ───────────── */}

        <Route path={ROUTES.MANAGER.OVERVIEW} element={<OverviewView />} />
        <Route path={ROUTES.MANAGER.FLOOR_MAP} element={<FloorMapView />} />
        <Route path={ROUTES.MANAGER.MENU} element={<MenuView />} />
        <Route path={ROUTES.MANAGER.ORDERS} element={<OrdersView />} />

        {/* ───────────── NHÂN SỰ ───────────── */}

        <Route path={ROUTES.MANAGER.HR} element={<PeopleView />} />
        <Route path={ROUTES.MANAGER.EMPLOYEE_RECORDS} element={<EmployeesView />} />
        <Route path={ROUTES.MANAGER.ATTENDANCE} element={<AttendanceView />} />
        <Route path={ROUTES.MANAGER.LEAVE_REQUESTS} element={<LeaveView />} />
        <Route path={ROUTES.MANAGER.SCHEDULING} element={<ScheduleView />} />

        {/* ───────────── KHO ───────────── */}

        <Route path={ROUTES.MANAGER.INVENTORY} element={<InventoryView />} />
        <Route path={ROUTES.MANAGER.SUPPLIERS} element={<SuppliersView />} />

        {/* ───────────── KINH DOANH ───────────── */}

        <Route path={ROUTES.MANAGER.PROMOTIONS} element={<PromotionsPage />} />

        {/* ───────────── AI / ANALYTICS ───────────── */}

        <Route path={ROUTES.MANAGER.ANALYTICS} element={<AnalyticsDashboard />} />

        {/* ───────────── QUẢN TRỊ ───────────── */}

        <Route path={ROUTES.MANAGER.AUDIT_LOGS} element={<AuditLogsPage />} />

      </Route>


      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
