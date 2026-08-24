import { Outlet } from 'react-router-dom'
import { CashierLocaleProvider } from '@/contexts/CashierLocaleContext'

/**
 * Layout full-screen cho quầy thu ngân POS.
 * Tối ưu cho màn hình rộng (1920x1080), không có sidebar dọc.
 */
export default function CashierLayout() {
  return (
    <CashierLocaleProvider>
      <div className="h-screen w-screen bg-slate-900 text-white overflow-hidden">
        <Outlet />
      </div>
    </CashierLocaleProvider>
  )
}
