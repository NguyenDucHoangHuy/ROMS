import { Outlet } from 'react-router-dom'

/**
 * Layout Mobile-first cho Khách hàng quét QR.
 * Max-width 430px (iPhone size), centered — mô phỏng cảm giác native app.
 */
export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white relative shadow-2xl">
        <Outlet />
      </div>
    </div>
  )
}
