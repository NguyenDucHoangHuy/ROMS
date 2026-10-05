import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function DepositPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const bookingData = location.state || { partySize: 2, selectedTime: '18:30', preOrderTotal: 0 }

  const preOrderTotal = bookingData.preOrderTotal || 0

  // Logic mới: Đặt cọc 30% nếu tổng tiền pre-order >= $50, ngược lại không cần đặt cọc ($0)
  const depositAmount = preOrderTotal >= 50 ? preOrderTotal * 0.3 : 0.0
  
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
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Reservation Confirmation & Deposit</h1>
          <p className="mt-1 text-xs text-stone-500">
            {depositAmount > 0 
              ? 'Complete your deposit to confirm your table reservation at ROMS Restaurant.' 
              : 'No deposit required for orders under $50. Confirm to complete your reservation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SUMMARY */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-4">
            <h3 className="font-bold text-base border-b border-stone-100 pb-3">Reservation Summary</h3>

            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Party Size:</span>
                <span className="font-bold text-stone-900">{bookingData.partySize} Guests</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Time:</span>
                <span className="font-bold text-stone-900">{bookingData.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Pre-Order Total:</span>
                <span className="font-bold text-stone-900">${preOrderTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-center font-bold text-stone-900 text-lg">
              <span>Deposit Required:</span>
              <span className={depositAmount > 0 ? "text-orange-500" : "text-green-600"}>
                {depositAmount > 0 ? `$${depositAmount.toFixed(2)} (30%)` : 'Free ($0.00)'}
              </span>
            </div>

            {preOrderTotal < 50 && (
              <p className="text-[11px] text-stone-400 italic">
                * Pre-orders under $50 do not require a deposit.
              </p>
            )}
          </div>

          {/* PAYMENT METHODS OR CONFIRMATION */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 space-y-6">
            {depositAmount > 0 ? (
              <>
                <h3 className="font-bold text-base border-b border-stone-100 pb-3">Payment Methods</h3>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`flex items-center gap-3 rounded-2xl p-4 border cursor-pointer transition ${
                      paymentMethod === 'vietqr' ? 'border-orange-500 bg-orange-50/50' : 'border-stone-200'
                    }`}
                  >
                    <QrCode className="text-orange-500" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">Transfer via QR Code (VietQR)</h4>
                      <p className="text-[11px] text-stone-400">Scan QR code for automatic confirmation in 5s</p>
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
                      <h4 className="font-bold text-sm">MoMo / ZaloPay Wallet</h4>
                      <p className="text-[11px] text-stone-400">Pay via digital wallet</p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600 transition cursor-pointer"
                >
                  <ShieldCheck size={18} /> Confirm Payment ${depositAmount.toFixed(2)}
                </button>
              </>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="font-bold text-stone-900">Ready to Confirm</h3>
                <p className="text-xs text-stone-500">
                  Your pre-order total is under $70. You can complete your reservation immediately without paying a deposit.
                </p>

                <button
                  onClick={handlePayment}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-amber-400 shadow-lg hover:bg-stone-800 transition cursor-pointer"
                >
                  Confirm Reservation Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}