import { Outlet } from 'react-router-dom'
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
  Settings,
  LogOut,
  ChevronRight,
  Bell,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { NavLink } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', to: ROUTES.MANAGER.ANALYTICS },
  { icon: UtensilsCrossed, label: 'Thực đơn', to: ROUTES.MANAGER.MENU },
  { icon: Package, label: 'Kho hàng', to: ROUTES.MANAGER.INVENTORY },
  { icon: Users, label: 'Nhân sự', to: ROUTES.MANAGER.HR },
  { icon: CalendarDays, label: 'Đặt bàn', to: ROUTES.MANAGER.TABLES },
  { icon: Tag, label: 'Khuyến mãi', to: ROUTES.MANAGER.PROMOTIONS },
  { icon: FileText, label: 'Audit Logs', to: ROUTES.MANAGER.AUDIT_LOGS },
  { icon: Settings, label: 'Cài đặt', to: ROUTES.MANAGER.SETTINGS },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()

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
              <p className="text-xs text-gray-500">Restaurant Ops</p>
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
                  <span className="flex-1">{item.label}</span>
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
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Đăng xuất"
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
    </div>
  )
}
