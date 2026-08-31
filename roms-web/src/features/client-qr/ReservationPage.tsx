import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar as CalendarIcon, Clock, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

export default function ReservationPage() {
  const navigate = useNavigate()
  const { items, updateQuantity } = useCartStore()

  const [partySize, setPartySize] = useState(2)
  const [selectedDate, setSelectedDate] = useState('18')
  const [selectedTime, setSelectedTime] = useState('18:30')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')

  const preOrderTotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lưu session/state rồi chuyển tới DepositPage
    navigate('/deposit', {
      state: { partySize, selectedDate, selectedTime, fullName, phone, note, preOrderTotal },
    })
  }

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Step 1 of 3</span>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Reserve & Pre-Order</h1>
          <p className="mt-1 text-xs text-stone-500">Giữ bàn trước và lựa chọn món ăn để trải nghiệm ẩm thực trọn vẹn nhất.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: RESERVATION DETAILS & FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* PARTY SIZE */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-sm text-stone-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-orange-500" /> Party Size
              </h3>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                <button
                  type="button"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm font-bold text-stone-700"
                >
                  <Minus size={16} />
                </button>
                <div className="text-center">
                  <span className="font-serif text-2xl font-bold text-stone-900">{partySize}</span>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Guests</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize(partySize + 1)}
                  className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm font-bold text-stone-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* TIME SLOTS */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-sm text-stone-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> Time Slot
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition ${
                      selectedTime === time
                        ? 'bg-amber-800 text-white shadow-md'
                        : 'bg-stone-50 text-stone-700 hover:bg-orange-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOMER INFO FORM */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 space-y-4">
              <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">Thông Tin Người Đặt</h3>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Ghi Chú Đặt Bàn</label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu bàn gần cửa sổ, ghế trẻ em..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRE-ORDER DISHES OR RESTAURANT PREVIEW */}
          <div className="lg:col-span-5">
            {items.length > 0 ? (
              <div className="rounded-3xl bg-stone-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">Curate Your Experience</h3>
                  <p className="text-xs text-stone-500 mt-1">Các món ăn đã chọn sẵn từ giỏ hàng.</p>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.menuItem.imageUrl || ''} alt={item.menuItem.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{item.menuItem.name}</h4>
                          <span className="text-xs font-bold text-orange-500">${item.menuItem.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center rounded-lg border border-stone-100 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-white rounded text-stone-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded text-stone-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-4 flex justify-between items-center font-bold text-stone-900">
                  <span>Pre-order Total:</span>
                  <span className="text-orange-500 text-lg">${preOrderTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition"
                >
                  Tiếp Tục Thanh Toán Đặt Cọc <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 text-center space-y-6">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                  alt="Restaurant Space"
                  className="h-64 w-full rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">Experience Seasonal Gastronomy</h3>
                  <p className="text-xs text-stone-500 mt-2">Bạn chưa chọn món trước. Bạn hoàn toàn có thể gọi món trực tiếp khi đến nhà hàng.</p>
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition"
                >
                  Xác Nhận Đặt Bàn Ngay <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}