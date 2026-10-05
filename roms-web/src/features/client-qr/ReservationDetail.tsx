import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Calendar, Clock, Users, ArrowRight, Utensils } from 'lucide-react'

export default function ReservationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900">
      <div className="mx-auto max-w-xl px-4 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-stone-100 space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold">Reservation Successful!</h1>
            <p className="text-xs text-stone-500 mt-1">Reservation Number: <strong className="text-stone-900">{id || 'RES-88921'}</strong></p>
          </div>

          {/* QR CODE FOR CHECKIN */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 inline-block">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ROMS-RES-88921"
              alt="QR Code Checkin"
              className="mx-auto h-36 w-36"
            />
            <p className="text-[11px] text-stone-400 mt-2">Present this QR code to the cashier when you arrive at the restaurant</p>
          </div>

          <div className="space-y-3 text-left border-t border-stone-100 pt-4 text-sm text-stone-600">
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><Users size={16} /> Quantity:</span>
              <span className="font-bold text-stone-900">2 Customers</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><Clock size={16} /> Time:</span>
              <span className="font-bold text-stone-900">18:30 - Today</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl bg-stone-100 py-3 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-600 transition"
            >
              View Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}