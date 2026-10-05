import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, Calendar as CalendarIcon, Clock, Plus, Minus, ArrowRight, UtensilsCrossed, AlertCircle, ShoppingBag, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/hooks/useAuth'
import Footer from '@/components/Footer'

// Hàm chuyển đổi phút sang định dạng "HH:mm"
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Hàm chuyển đổi định dạng "HH:mm" sang phút
const timeToMinutes = (timeStr: string): number => {
  const [hours, mins] = timeStr.split(':').map(Number)
  return (hours || 0) * 60 + (mins || 0)
}

export default function ReservationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  // Lấy dữ liệu và hàm từ Cart Store
  const { items, updateQuantity, removeItem } = useCartStore()

  const savedState = location.state?.reservationDraft || JSON.parse(localStorage.getItem('reservation_draft') || '{}')

  // Thời gian thực tế hiện tại
  const today = useMemo(() => new Date(), [])
  const currentRealYear = today.getFullYear()
  const currentRealMonth = today.getMonth() // 0 - 11
  const currentRealDate = today.getDate()

  // State cho Tháng & Năm đang xem trên Calendar (Hỗ trợ chuyển tháng tương lai)
  const [viewYear, setViewYear] = useState<number>(savedState.selectedYear || currentRealYear)
  const [viewMonth, setViewMonth] = useState<number>(
    savedState.selectedMonth ? savedState.selectedMonth - 1 : currentRealMonth
  )

  // State cho Ngày được chọn
  const [selectedDate, setSelectedDate] = useState<number>(
    savedState.selectedDate && savedState.selectedDate >= currentRealDate 
      ? savedState.selectedDate 
      : currentRealDate
  )

  // Số ngày trong tháng đang xem
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate()
  }, [viewYear, viewMonth])

  // Thứ trong tuần của ngày đầu tiên trong tháng (0: Sun, 1: Mon, ...)
  const startDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay()
  }, [viewYear, viewMonth])

  // Tên tháng và năm hiển thị
  const monthYearLabel = useMemo(() => {
    return new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [viewYear, viewMonth])

  // Điều hướng Tháng (Lùi / Tiến)
  const handlePrevMonth = () => {
    if (viewYear === currentRealYear && viewMonth <= currentRealMonth) return // Không cho lùi về quá khứ
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Kiểm tra xem tháng đang xem có phải là tháng hiện tại không
  const isCurrentMonth = viewYear === currentRealYear && viewMonth === currentRealMonth

  const [partySize, setPartySize] = useState<number>(savedState.partySize || 2)

  // Kiểm tra xem ngày được chọn là Cuối tuần (T7, CN) hay Ngày thường
  const isWeekend = useMemo(() => {
    const dateObj = new Date(viewYear, viewMonth, selectedDate)
    const dayOfWeek = dateObj.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // 0: Sunday, 6: Saturday
  }, [viewYear, viewMonth, selectedDate])

  // Giờ mở cửa / đóng cửa theo phút
  const timeBounds = useMemo(() => {
    if (isWeekend) {
      return { min: 7 * 60, max: 23 * 60, label: '07:00 AM - 11:00 PM (Weekend)' }
    }
    return { min: 8 * 60, max: 22 * 60, label: '08:00 AM - 10:00 PM (Weekday)' }
  }, [isWeekend])

  const [timeMinutes, setTimeMinutes] = useState<number>(() => {
    if (savedState.selectedTime) {
      return timeToMinutes(savedState.selectedTime)
    }
    return 12 * 60 // 12:00 PM mặc định
  })

  // Đảm bảo giờ chọn luôn hợp lệ khi đổi giữa ngày thường / cuối tuần
  useEffect(() => {
    if (timeMinutes < timeBounds.min) {
      setTimeMinutes(timeBounds.min)
    } else if (timeMinutes > timeBounds.max) {
      setTimeMinutes(timeBounds.max)
    }
  }, [timeBounds, timeMinutes])

  const selectedTime = useMemo(() => minutesToTime(timeMinutes), [timeMinutes])

  const [fullName, setFullName] = useState<string>(savedState.fullName || user?.name || '')
  const [phone, setPhone] = useState<string>(savedState.phone || '')
  const [note, setNote] = useState<string>(savedState.note || '')

  useEffect(() => {
    if (localStorage.getItem('reservation_draft')) {
      localStorage.removeItem('reservation_draft')
    }
  }, [])

  // Tính tổng tiền pre-order dựa trên các món đang có trong giỏ hàng
  const preOrderTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  }, [items])

  // Xử lý thay đổi số lượng món ăn trong giỏ hàng ngay tại trang đặt bàn
  const handleQuantityChange = (menuItemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty <= 0) {
      removeItem(menuItemId)
    } else {
      updateQuantity(menuItemId, newQty)
    }
  }

  const handleCustomTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) return
    const inputMins = timeToMinutes(val)
    
    if (inputMins < timeBounds.min) {
      setTimeMinutes(timeBounds.min)
    } else if (inputMins > timeBounds.max) {
      setTimeMinutes(timeBounds.max)
    } else {
      setTimeMinutes(inputMins)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const reservationData = {
      partySize,
      selectedDate,
      selectedMonth: viewMonth + 1,
      selectedYear: viewYear,
      selectedTime,
      fullName,
      phone,
      note,
      preOrderTotal,
      items, // Các món đã đặt trước (rỗng nếu người dùng không chọn món)
    }

    // if (!user) {
    //   localStorage.setItem('reservation_draft', JSON.stringify(reservationData))
    //   navigate('/login', {
    //     state: { redirectTo: '/reservation', reservationDraft: reservationData },
    //   })
    //   return
    // }

    navigate('/deposit', { state: reservationData })
  }

  return (
    <div className="bg-[#faf8f5] min-h-screen text-stone-900 flex flex-col font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Step 1 of 3</span>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl text-stone-900 mt-1">Reserve & Pre-Order</h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Secure your table and pre-order your culinary journey. A 30% deposit is required for pre-orders of $50 or more.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow">
              <CalendarIcon size={18} />
            </div>
            <div className="w-8 h-0.5 bg-stone-300" />
            <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-sm">
              <UtensilsCrossed size={18} />
            </div>
            <div className="w-8 h-0.5 bg-stone-300" />
            <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-sm">
              $
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: RESERVATION INFO */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* PARTY SIZE */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-orange-500" /> Party Size
              </h3>
              <div className="flex items-center justify-between rounded-xl bg-[#f7f5f0] p-3 border border-stone-100">
                <button
                  type="button"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="grid h-11 w-11 place-items-center rounded-lg bg-white shadow-sm font-bold text-stone-700 hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <span className="font-serif text-3xl font-bold text-stone-900">{partySize}</span>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Guests</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPartySize(partySize + 1)}
                  className="grid h-11 w-11 place-items-center rounded-lg bg-white shadow-sm font-bold text-stone-700 hover:bg-orange-50 active:scale-95 transition cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* DATE SELECTION (LINH HOẠT THÁNG TƯƠNG LAI) */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-orange-500" /> Date
                </h3>
                
                {/* THANH ĐIỀU HƯỚNG THÁNG */}
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-1 rounded-xl border border-stone-100">
                  <button
                    type="button"
                    disabled={isCurrentMonth}
                    onClick={handlePrevMonth}
                    className={`p-1 rounded-lg transition ${
                      isCurrentMonth 
                        ? 'text-stone-300 cursor-not-allowed' 
                        : 'text-stone-600 hover:bg-white hover:shadow-xs cursor-pointer'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-stone-800 min-w-[110px] text-center select-none">
                    {monthYearLabel}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg text-stone-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 mb-2">
                <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              </div>

              {/* LƯỚI NGÀY */}
              <div className="grid grid-cols-7 gap-1">
                {/* Khoảng trống căn chỉnh thứ đầu tháng */}
                {[...Array(startDayOfWeek)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {[...Array(daysInMonth)].map((_, index) => {
                  const day = index + 1
                  const isPast = isCurrentMonth && day < currentRealDate
                  const isSelected = selectedDate === day

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => !isPast && setSelectedDate(day)}
                      className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                        isPast
                          ? 'text-stone-300 cursor-not-allowed bg-stone-50/50 line-through'
                          : isSelected
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'text-stone-700 hover:bg-stone-100 cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* TIME SELECTION */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Clock size={18} className="text-orange-500" /> Time
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  {isWeekend ? 'Weekend Hours' : 'Weekday Hours'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-6">
                <AlertCircle size={14} className="text-amber-500" />
                <span>Operating hours for selected date: <strong className="text-stone-800">{timeBounds.label}</strong></span>
              </div>

              <div className="space-y-6 bg-[#fcfbf9] p-5 rounded-2xl border border-stone-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">Selected Time</label>
                    <span className="font-serif text-3xl font-bold text-orange-600">{selectedTime}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Custom Input</label>
                    <input
                      type="time"
                      value={selectedTime}
                      min={minutesToTime(timeBounds.min)}
                      max={minutesToTime(timeBounds.max)}
                      onChange={handleCustomTimeInput}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold text-sm outline-none focus:border-orange-500 shadow-xs cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min={timeBounds.min}
                    max={timeBounds.max}
                    step={15}
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-stone-400 mt-2">
                    <span>{minutesToTime(timeBounds.min)}</span>
                    <span>{minutesToTime((timeBounds.min + timeBounds.max) / 2)}</span>
                    <span>{minutesToTime(timeBounds.max)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOMER INFORMATION FORM */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100 space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
                Customer Information
              </h3>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyen Van A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Reservation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Request a table near the window, child seat..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>
            </div>

            {/* BANNER */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-40">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                alt="Restaurant Space"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-5">
                <p className="font-serif text-white text-lg font-bold">Experience the art of seasonal gastronomy.</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: PRE-ORDERED ITEMS FROM CART STORE */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="rounded-3xl bg-[#f5f2eb] p-6 shadow-sm border border-stone-200 space-y-6">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <UtensilsCrossed size={20} className="text-orange-500" /> Pre-Ordered Dishes
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Dishes added to your cart for this reservation.</p>
                </div>
                {items.length > 0 && (
                  /* NÚT + ADD MORE DISHES DẠNG BORDER */
                  <button
                    type="button"
                    onClick={() => navigate('/menu')}
                    className="text-xs font-bold text-orange-600 px-3 py-1.5 rounded-xl border border-orange-200 hover:border-orange-500 bg-white hover:bg-orange-50 transition cursor-pointer shadow-2xs"
                  >
                    + Add more dishes
                  </button>
                )}
              </div>

              {/* DANH SÁCH MÓN ĂN TỪ GIỎ HÀNG THỰC TẾ */}
              {items.length > 0 ? (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {items.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4 items-center">
                      <img
                        src={menuItem.imageUrl || '/Home/default-dish.jpg'}
                        alt={menuItem.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{menuItem.name}</h4>
                          <span className="font-bold text-stone-900 text-sm">${(menuItem.price * quantity).toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{menuItem.description}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          {menuItem.tags && menuItem.tags.length > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                              {menuItem.tags[0]}
                            </span>
                          ) : <span />}

                          {/* BỘ NÚT TĂNG GIẢM SỐ LƯỢNG / XÓA MÓN */}
                          <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(menuItem.id, quantity, -1)}
                              className="w-6 h-6 rounded-md bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-orange-100 transition active:scale-95 cursor-pointer"
                              title={quantity === 1 ? 'Remove item' : 'Decrease'}
                            >
                              {quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(menuItem.id, quantity, 1)}
                              className="w-6 h-6 rounded-md bg-orange-500 text-white shadow-xs flex items-center justify-center hover:bg-orange-600 transition active:scale-95 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* TRƯỜNG HỢP GIỎ HÀNG TRỐNG */
                <div className="text-center py-8 px-4 bg-white rounded-2xl border border-dashed border-stone-200">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag size={24} />
                  </div>
                  <h4 className="font-bold text-stone-800 text-sm">No Pre-ordered Dishes</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    You are reserving a table without pre-ordering dishes. You can select your meal directly at the restaurant.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/menu')}
                    className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs hover:bg-stone-800 transition cursor-pointer"
                  >
                    Browse Menu & Add Dishes
                  </button>
                </div>
              )}

              {/* TỔNG TIỀN MÓN ĐẶT TRƯỚC */}
              <div className="border-t border-stone-300/70 pt-4 flex justify-between items-center font-bold text-stone-900">
                <span className="text-sm">Pre-order Total</span>
                <span className="text-xl font-serif text-orange-600">${preOrderTotal.toFixed(2)}</span>
              </div>

              {/* NÚT SUBMIT */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg hover:bg-orange-600 active:scale-[0.99] transition cursor-pointer"
              >
                Continue to Deposit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}