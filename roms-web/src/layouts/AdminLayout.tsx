import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/formatDate'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Users,
  CalendarDays,
  Tag,
  FileText,
  LogOut,
  ChevronRight,
  Bell,
  Sparkles,
  Store,
  Globe,
  Loader2,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useNotificationStore } from '@/stores/notificationStore'
import { useManagerLocale } from '@/contexts/ManagerLocaleContext'

const navItems = [
  // Operations
  {
    icon: LayoutDashboard,
    labelEn: 'Overview',
    labelVi: 'Tổng quan',
    to: ROUTES.MANAGER.OVERVIEW,
  },
  {
    icon: CalendarDays,
    labelEn: 'Floor Map',
    labelVi: 'Sơ đồ bàn',
    to: ROUTES.MANAGER.FLOOR_MAP,
  },
  {
    icon: UtensilsCrossed,
    labelEn: 'Menu Management',
    labelVi: 'Quản lý thực đơn',
    to: ROUTES.MANAGER.MENU,
  },
  {
    icon: FileText,
    labelEn: 'Orders & Billing',
    labelVi: 'Đơn hàng & Thanh toán',
    to: ROUTES.MANAGER.ORDERS,
  },

  // HR & Staff
  {
    icon: Users,
    labelEn: 'Team Logistics',
    labelVi: 'Điều phối đội ngũ',
    to: ROUTES.MANAGER.HR,
  },
  {
    icon: Users,
    labelEn: 'Employee Records',
    labelVi: 'Hồ sơ nhân viên',
    to: ROUTES.MANAGER.EMPLOYEE_RECORDS,
  },
  {
    icon: CalendarDays,
    labelEn: 'Attendance & GPS',
    labelVi: 'Chấm công & GPS',
    to: ROUTES.MANAGER.ATTENDANCE,
  },
  {
    icon: FileText,
    labelEn: 'Leave Requests',
    labelVi: 'Duyệt nghỉ phép',
    to: ROUTES.MANAGER.LEAVE_REQUESTS,
  },
  {
    icon: CalendarDays,
    labelEn: 'Shift Schedule',
    labelVi: 'Lịch phân ca',
    to: ROUTES.MANAGER.SCHEDULING,
  },

  // Inventory
  {
    icon: Package,
    labelEn: 'Inventory & Stock',
    labelVi: 'Kho nguyên liệu',
    to: ROUTES.MANAGER.INVENTORY,
  },
  {
    icon: Store,
    labelEn: 'Suppliers',
    labelVi: 'Nhà cung cấp',
    to: ROUTES.MANAGER.SUPPLIERS,
  },

  // Business
  {
    icon: Tag,
    labelEn: 'Promotions',
    labelVi: 'Khuyến mãi',
    to: ROUTES.MANAGER.PROMOTIONS,
  },

  // Analytics
  {
    icon: Sparkles,
    labelEn: 'AI Analytics',
    labelVi: 'Phân tích AI',
    to: ROUTES.MANAGER.ANALYTICS,
  },

  // Administration
  {
    icon: FileText,
    labelEn: 'Audit Logs',
    labelVi: 'Nhật ký hoạt động',
    to: ROUTES.MANAGER.AUDIT_LOGS,
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()
  const { isEn, toggleLocale } = useManagerLocale()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
      navigate('/')
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-sm">
              R
            </div>
            <div>
              <p className="font-bold text-white text-sm">ROMS</p>
              <p className="text-xs text-gray-500">Restaurant Operations</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-orange-400' : ''} />
                  <span className="flex-1">{isEn ? item.labelEn : item.labelVi}</span>
                  {isActive && <ChevronRight size={14} className="text-orange-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(user?.fullName || user?.name)?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors cursor-pointer"
              title={isEn ? 'Log out' : 'Đăng xuất'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex-shrink-0 bg-gray-900/50 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
          <p className="text-sm text-gray-500">{formatDateTime(new Date().toISOString())}</p>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/80 text-xs font-semibold text-gray-200 hover:bg-gray-700 transition-all cursor-pointer shadow-sm"
              title={isEn ? 'Switch to Tiếng Việt' : 'Chuyển sang English'}
            >
              <Globe size={14} className="text-orange-400" />
              <span>{isEn ? 'EN (English)' : 'VI (Tiếng Việt)'}</span>
            </button>

            <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-950">
          <Outlet />
        </main>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <LogOut size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {isEn ? 'Confirm Sign Out' : 'Xác nhận Đăng xuất'}
                </h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  {isEn
                    ? 'Are you sure you want to log out of ROMS? You will be returned to the home page.'
                    : 'Bạn có chắc chắn muốn đăng xuất khỏi ROMS không? Bạn sẽ được chuyển về trang chủ với trạng thái chưa đăng nhập.'}
                </p>

                {/* Account info pill */}
                {user && (
                  <div className="mt-4 p-3 rounded-xl bg-gray-800/70 border border-gray-700/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(user.fullName || user.name)?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-200 truncate">{user.fullName || user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-750 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {isEn ? 'Cancel' : 'Hủy bỏ'}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEn ? 'Signing out...' : 'Đang đăng xuất...'}</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>{isEn ? 'Sign Out' : 'Đăng xuất'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
