import { Outlet } from 'react-router-dom'

/**
 * Layout full-screen cho màn hình bếp KDS.
 * Dark mode hoàn toàn, không có sidebar — tối ưu cho màn hình lớn đặt cố định tại bếp.
 */
export default function KitchenLayout() {
  return (
    <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col">
      <Outlet />
    </div>
  )
}
