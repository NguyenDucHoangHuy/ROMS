import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { reservationService } from '@/services/modules/reservationService'
import { useCartStore } from '@/stores/cartStore'
import { useClientLocale } from '@/contexts/ClientLocaleContext'
import { useAuth } from '@/hooks/useAuth'
import type { CreateReservationPayload } from '@/types/reservation.types'

export default function DepositPage() {
  const { t } = useClientLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { clearCart } = useCartStore()

  const bookingData = location.state || {
    partySize: 2,
    selectedTime: '18:30',
    selectedDate: new Date().getDate(),
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    fullName: '',
    phone: '',
    note: '',
    preOrderTotal: 0,
  }

  // Bắt buộc phải có tài khoản đăng nhập để vào bước đặt cọc & xác nhận
  useEffect(() => {
    if (!user) {
      navigate('/login', {
        replace: true,
        state: {
          redirectTo: '/deposit',
          reservationDraft: bookingData,
          message: t('Vui lòng đăng nhập tài khoản để hoàn tất đặt bàn.', 'Please log in to complete your table reservation.'),
        },
      })
    }
  }, [user, navigate])

  const preOrderTotal = bookingData.preOrderTotal || 0

  // Logic: Đặt cọc 30% nếu tổng tiền pre-order >= $50, ngược lại không cần đặt cọc ($0)
  const depositAmount = preOrderTotal >= 50 ? Number((preOrderTotal * 0.3).toFixed(2)) : 0.0

  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'card'>('vietqr')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Ghép ngày giờ đặt bàn
  const year = bookingData.selectedYear || new Date().getFullYear()
  const month = bookingData.selectedMonth || (new Date().getMonth() + 1)
  const day = bookingData.selectedDate || new Date().getDate()
  const timeStr = bookingData.selectedTime || '18:30'
  const [hours, mins] = timeStr.split(':').map(Number)
  const reservationDateTime = new Date(year, month - 1, day, hours || 12, mins || 0)

  const handleConfirmReservation = async () => {
    const guestName = bookingData.fullName?.trim() || (user as any)?.fullName || user?.name || ''
    const guestPhone = bookingData.phone?.trim() || user?.phone || ''

    if (!guestName || !guestPhone) {
      setErrorMessage(t('Thiếu thông tin người đặt. Vui lòng quay lại Bước 1 để điền đầy đủ.', 'Missing customer information. Please return to Step 1 to fill in your details.'))
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const areaLabels: Record<number, string> = {
        1: t('Tầng 1 - Sảnh chính', 'Floor 1 - Main Hall'),
        2: t('Tầng 2 - Lầu thoáng', 'Floor 2 - Balcony'),
        3: t('Tầng 3 - VIP Rooftop', 'Floor 3 - VIP Rooftop'),
      }
      const floorName = bookingData.preferredFloor ? areaLabels[bookingData.preferredFloor] : null
      const prefList: string[] = bookingData.seatingPreferences || []

      const noteParts: string[] = []
      if (floorName) {
        noteParts.push(`[Khu vực: ${floorName}]`)
      }
      if (prefList.length > 0) {
        noteParts.push(`[Sở thích: ${prefList.join(', ')}]`)
      }
      if (bookingData.note?.trim()) {
        noteParts.push(`[Ghi chú: ${bookingData.note.trim()}]`)
      }

      const combinedNotes = noteParts.length > 0 ? noteParts.join(' ') : undefined

      const payload: CreateReservationPayload = {
        guestName,
        guestPhone,
        partySize: bookingData.partySize || 2,
        reservationTime: reservationDateTime.toISOString(),
        specialRequest: combinedNotes,
        depositAmount: depositAmount,
        depositStatus: depositAmount > 0 ? 'PAID' : 'PENDING',
      }

      const res = await reservationService.create(payload)

      // Xoá giỏ hàng món ăn sau khi đặt thành công
      clearCart()

      // Chuyển hướng tới trang chi tiết đặt bàn của đơn vừa tạo
      navigate(`/reservation/${res.id}`)
    } catch (err: any) {
      console.error('Lỗi tạo đặt bàn:', err)
      const msg = err.response?.data?.message
      setErrorMessage(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg || t('Không thể tạo đơn đặt bàn. Vui lòng thử lại sau.', 'Could not create reservation. Please try again later.')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Nút quay lại */}
        <button
          type="button"
          onClick={() => navigate('/reservation', { state: { reservationDraft: bookingData } })}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-orange-600 mb-6 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> {t('Quay lại chỉnh sửa thông tin', 'Back to Edit Details')}
        </button>

        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{t('Bước 2 / 3', 'Step 2 of 3')}</span>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl text-stone-900 mt-1">
            {t('Xác nhận Đặt bàn & Đặt cọc', 'Reservation Confirmation & Deposit')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            {depositAmount > 0
              ? t('Hoàn tất thanh toán tiền cọc để giữ bàn tại ROMS Restaurant.', 'Complete your deposit to confirm your table reservation at ROMS Restaurant.')
              : t('Không cần đặt cọc cho đơn dưới $50. Xác nhận để hoàn tất đặt chỗ.', 'No deposit required for orders under $50. Confirm to complete your reservation.')}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: TÓM TẮT THÔNG TIN ĐẶT BÀN */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
              {t('Tóm tắt đặt bàn', 'Reservation Summary')}
            </h3>

            <div className="space-y-3 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>{t('Khách hàng:', 'Customer:')}</span>
                <span className="font-bold text-stone-900">{bookingData.fullName || t('Chưa có tên', 'No name')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Số điện thoại:', 'Phone:')}</span>
                <span className="font-bold text-stone-900">{bookingData.phone || t('Chưa có SĐT', 'No phone')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Số người:', 'Party Size:')}</span>
                <span className="font-bold text-stone-900">{bookingData.partySize} {t('Khách', 'Guests')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Ngày & Giờ:', 'Date & Time:')}</span>
                <span className="font-bold text-stone-900">
                  {bookingData.selectedTime} • {day}/{month}/{year}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('Khu vực mong muốn:', 'Preferred Area:')}</span>
                <span className="font-bold text-orange-600">
                  {bookingData.preferredFloor === 2 ? t('Tầng 2 - Lầu thoáng', 'Floor 2 - Balcony') : bookingData.preferredFloor === 3 ? t('Tầng 3 - VIP Rooftop', 'Floor 3 - VIP Rooftop') : t('Tầng 1 - Sảnh chính', 'Floor 1 - Main Hall')}
                </span>
              </div>
              {bookingData.seatingPreferences?.length > 0 && (
                <div className="flex justify-between items-start">
                  <span>{t('Sở thích chỗ ngồi:', 'Preferences:')}</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {bookingData.seatingPreferences.map((pref: string) => (
                      <span key={pref} className="px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-semibold text-stone-700">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {bookingData.note && (
                <div className="flex justify-between">
                  <span>{t('Ghi chú:', 'Notes:')}</span>
                  <span className="text-stone-700 text-xs italic max-w-[200px] text-right truncate">{bookingData.note}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-100 pt-3">
                <span>{t('Tổng tiền gọi trước:', 'Pre-Order Total:')}</span>
                <span className="font-bold text-stone-900">${preOrderTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-center font-bold text-stone-900 text-lg">
              <span>{t('Tiền cọc yêu cầu:', 'Deposit Required:')}</span>
              <span className={depositAmount > 0 ? 'text-orange-500 font-serif text-2xl' : 'text-green-600'}>
                {depositAmount > 0 ? `$${depositAmount.toFixed(2)} (30%)` : t('Miễn phí ($0.00)', 'Free ($0.00)')}
              </span>
            </div>

            {preOrderTotal < 50 && (
              <p className="text-[11px] text-stone-400 italic">
                * {t('Đơn gọi món dưới $50 không yêu cầu đặt cọc trước.', 'Pre-orders under $50 do not require a deposit.')}
              </p>
            )}
          </div>

          {/* CỘT PHẢI: PHƯƠNG THỨC THANH TOÁN HOẶC NÚT XÁC NHẬN */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-6">
            {depositAmount > 0 ? (
              <>
                <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
                  {t('Phương thức thanh toán cọc', 'Deposit Payment Methods')}
                </h3>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`flex items-center gap-3 rounded-2xl p-4 border cursor-pointer transition ${
                      paymentMethod === 'vietqr' ? 'border-orange-500 bg-orange-50/50' : 'border-stone-200'
                    }`}
                  >
                    <QrCode className="text-orange-500" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{t('Chuyển khoản VietQR', 'Transfer via QR Code (VietQR)')}</h4>
                      <p className="text-[11px] text-stone-400">{t('Quét mã QR tự động xác thực trong 5 giây', 'Scan QR code for automatic confirmation in 5s')}</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('momo')}
                    className={`flex items-center gap-3 rounded-2xl p-4 border cursor-pointer transition ${
                      paymentMethod === 'momo' ? 'border-orange-500 bg-orange-50/50' : 'border-stone-200'
                    }`}
                  >
                    <CreditCard className="text-pink-600" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">Ví điện tử MoMo / ZaloPay</h4>
                      <p className="text-[11px] text-stone-400">{t('Thanh toán qua ví điện tử', 'Pay via digital wallet')}</p>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{t('Đang xử lý đặt bàn...', 'Processing reservation...')}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>{t(`Xác nhận & Cọc $${depositAmount.toFixed(2)}`, `Confirm Payment $${depositAmount.toFixed(2)}`)}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  {t('Sẵn sàng hoàn tất đặt bàn', 'Ready to Confirm')}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {t(
                    'Đơn đặt bàn của bạn không yêu cầu cọc. Bấm nút dưới đây để gửi yêu cầu đặt bàn đến nhà hàng.',
                    'Your reservation does not require a deposit. Click below to submit your reservation directly to the restaurant.'
                  )}
                </p>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-amber-400 shadow-lg hover:bg-stone-800 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{t('Đang gửi đặt bàn...', 'Submitting reservation...')}</span>
                    </>
                  ) : (
                    <span>{t('Xác nhận đặt bàn ngay', 'Confirm Reservation Now')}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
