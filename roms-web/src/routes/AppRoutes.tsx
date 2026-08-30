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
// Auth
import LoginPage from '@/features/auth/LoginPage'

// Customer
import MenuPage from '@/features/client-qr/MenuPage'
import CartPage from '@/features/client-qr/CartPage'
import OrderStatusPage from '@/features/client-qr/OrderStatusPage'
import ReservationPage from '@/features/client-qr/ReservationPage'

// Kitchen
import KitchenDashboard from '@/features/kds-kitchen/KitchenDashboard'

// Cashier
import POSDashboard from '@/features/cashier-pos/POSDashboard'

// Manager-Admin
// import AnalyticsDashboard from '@/features/manager/analytics/AnalyticsDashboard'
// import MenuManagement from '@/features/manager/menu/MenuView'
// import InventoryPage from '@/features/manager/inventory/InventoryView'
// import HRPage from '@/features/manager/hr/HRPage'
// import PromotionsPage from '@/features/manager/promotions/PromotionsPage'
// import AuditLogsPage from '@/features/manager/audit-logs/AuditLogsPage'
import OverviewView from '@/features/manager/overview/OverviewView'
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
      {/* <Route
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
      </Route> */}
       <Route element={<AdminLayout />}>

        {/* Manager Dashboard */}
        <Route
          path={ROUTES.MANAGER.ROOT}
          element={
            <Navigate
              to={ROUTES.MANAGER.OVERVIEW}
              replace
            />
          }
        />

        {/* ───────────── VẬN HÀNH ───────────── */}

        <Route
          path={ROUTES.MANAGER.OVERVIEW}
          element={<OverviewView />}
        />

        <Route
          path={ROUTES.MANAGER.FLOOR_MAP}
          element={<FloorMapView />}
        />

        <Route
          path={ROUTES.MANAGER.MENU}
          element={<MenuView />}
        />

        <Route
          path={ROUTES.MANAGER.ORDERS}
          element={<OrdersView />}
        />

        {/* ───────────── NHÂN SỰ ───────────── */}

        <Route
          path={ROUTES.MANAGER.HR}
          element={<PeopleView />}
        />

        <Route
          path={ROUTES.MANAGER.EMPLOYEE_RECORDS}
          element={<EmployeesView />}
        />

        <Route
          path={ROUTES.MANAGER.ATTENDANCE}
          element={<AttendanceView />}
        />

        <Route
          path={ROUTES.MANAGER.LEAVE_REQUESTS}
          element={<LeaveView />}
        />

        <Route
          path={ROUTES.MANAGER.SCHEDULING}
          element={<ScheduleView />}
        />

        {/* ───────────── KHO ───────────── */}

        <Route
          path={ROUTES.MANAGER.INVENTORY}
          element={<InventoryView />}
        />

        <Route
          path={ROUTES.MANAGER.SUPPLIERS}
          element={<SuppliersView />}
        />

        {/* ───────────── KINH DOANH ───────────── */}

        <Route
          path={ROUTES.MANAGER.PROMOTIONS}
          element={<PromotionsPage />}
        />

        {/* ───────────── AI / ANALYTICS ───────────── */}

        <Route
          path={ROUTES.MANAGER.ANALYTICS}
          element={<AnalyticsDashboard />}
        />

        {/* ───────────── QUẢN TRỊ ───────────── */}

        <Route
          path={ROUTES.MANAGER.AUDIT_LOGS}
          element={<AuditLogsPage />}
        />

      </Route>

      {/* ── Fallback ── */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
