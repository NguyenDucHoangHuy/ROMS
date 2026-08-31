import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function DepositPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const bookingData = location.state || { partySize: 2, selectedTime: '18:30', preOrderTotal: 50 }

  const depositAmount = bookingData.preOrderTotal > 0 ? bookingData.preOrderTotal * 0.3 : 10.0 // 30% tiền món hoặc $10 cọc bàn
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'card'>('vietqr')

  const handlePayment = () => {
    // Điều hướng sang ReservationDetail
    navigate('/reservation-detail/RES-88921')
  }

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Step 2 of 3</span>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Thanh Toán Đặt Cọc</h1>
          <p className="mt-1 text-xs text-stone-500">Hoàn tất đặt cọc để xác nhận giữ bàn tại ROMS Restaurant.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SUMMARY */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-4">
            <h3 className="font-bold text-base border-b border-stone-100 pb-3">Tóm Tắt Đặt Bàn</h3>

            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Số lượng khách:</span>
                <span className="font-bold text-stone-900">{bookingData.partySize} Khách</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span className="font-bold text-stone-900">{bookingData.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền món pre-order:</span>
                <span className="font-bold text-stone-900">${(bookingData.preOrderTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-center font-bold text-stone-900 text-lg">
              <span>Số tiền cọc (30%):</span>
              <span className="text-orange-500">${depositAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-6">
            <h3 className="font-bold text-base border-b border-stone-100 pb-3">Phương Thức Thanh Toán</h3>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('vietqr')}
                className={`flex items-center gap-3 rounded-2xl p-4 border cursor-pointer transition ${
                  paymentMethod === 'vietqr' ? 'border-orange-500 bg-orange-50/50' : 'border-stone-200'
                }`}
              >
                <QrCode className="text-orange-500" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Chuyển Khoản QR Code (VietQR)</h4>
                  <p className="text-[11px] text-stone-400">Quét mã QR tự động xác nhận trong 5s</p>
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
                  <h4 className="font-bold text-sm">Ví MoMo / ZaloPay</h4>
                  <p className="text-[11px] text-stone-400">Thanh toán qua ví điện tử</p>
                </div>
              </label>
            </div>

            <button
              onClick={handlePayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition"
            >
              <ShieldCheck size={18} /> Xác Nhận Thanh Toán ${depositAmount.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}