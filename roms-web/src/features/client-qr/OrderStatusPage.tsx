import { ChefHat, Clock, CheckCircle2, UtensilsCrossed } from 'lucide-react'

export default function OrderStatusPage() {
  const steps = [
    { label: 'Đã Tiếp Nhận', done: true, time: '18:32' },
    { label: 'Đang Chế Biến', active: true, time: '18:35' },
    { label: 'Đã Lên Món', done: false },
  ]

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-stone-100 space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Trạng Thái Đơn Bàn Demo</h1>
            <p className="text-xs text-stone-400 mt-1">Món ăn đang được bếp chuẩn bị chu đáo</p>
          </div>

          {/* PROGRESS TRACKER */}
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-100 -z-0 -translate-y-1/2" />
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-2">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : step.active
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {step.done ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span className="text-xs font-bold mt-2 text-stone-800">{step.label}</span>
                {step.time && <small className="text-[10px] text-stone-400">{step.time}</small>}
              </div>
            ))}
          </div>

          {/* ORDER ITEMS */}
          <div className="space-y-3 border-t border-stone-100 pt-6">
            <h3 className="font-bold text-sm text-stone-900 mb-3">Món Đã Gọi</h3>
            <div className="flex justify-between items-center text-sm">
              <span>1x Barbecue Sauce Ribs</span>
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">Đang nướng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}