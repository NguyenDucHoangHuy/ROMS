export default function KitchenDashboard() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
          <p className="text-gray-400 text-sm">Hàng đợi chế biến — Real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm">Đang kết nối</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <p>KitchenDashboard — Coming soon</p>
      </div>
    </div>
  )
}
