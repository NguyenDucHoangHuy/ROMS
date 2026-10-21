import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  QrCode,
  AlertCircle,
  Loader2,
  ArrowRight,
  Utensils,
  RefreshCw,
  XCircle,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { reservationService } from '@/services/modules/reservationService'
import { useAuth } from '@/hooks/useAuth'
import { useClientLocale } from '@/contexts/ClientLocaleContext'
import type { Reservation } from '@/types/reservation.types'

export default function MyReservationsPage() {
  const { t } = useClientLocale()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [cancelResId, setCancelResId] = useState<string | null>(null)

  const {
    data: reservations = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: reservationService.getMyReservations,
    enabled: Boolean(user),
  })

  // Mutation huỷ đơn đặt bàn
  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationService.cancel(id, 'Khách hàng tự huỷ'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
      setCancelResId(null)
    },
  })

  if (!user) {
    return (
      <div className="bg-[#faf8f5] min-h-screen py-20 text-stone-900 font-sans">
        <div className="mx-auto max-w-md px-4 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <Utensils size={30} />
          </div>
          <h2 className="font-serif text-2xl font-bold">{t('Vui lòng đăng nhập', 'Please Log In')}</h2>
          <p className="text-sm text-stone-500">
            {t(
              'Đăng nhập tài khoản để xem lại các đơn đặt bàn và mã QR check-in của bạn.',
              'Log in to your account to view your reservations and check-in QR codes.'
            )}
          </p>
          <button
            onClick={() => navigate('/login', { state: { redirectTo: '/profile' } })}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition shadow-sm cursor-pointer"
          >
            {t('Đăng nhập ngay', 'Log In Now')}
          </button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: t('Đã xác nhận', 'Confirmed'),
        }
      case 'COMPLETED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: t('Đã check-in vào bàn', 'Completed'),
        }
      case 'CANCELLED':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          dot: 'bg-stone-400',
          label: t('Đã hủy', 'Cancelled'),
        }
      case 'PENDING':
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: t('Chờ nhà hàng xác nhận', 'Pending Approval'),
        }
    }
  }

  return (
    <div className="bg-[#faf8f5] min-h-screen py-12 text-stone-900 font-sans">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* PROFILE INFO CARD */}
        <div className="mb-8 rounded-3xl bg-white border border-stone-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-orange-400 font-serif text-2xl font-bold flex items-center justify-center shadow-md flex-shrink-0">
              {user.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900">{user.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2">
                <span>📞 {user.phone}</span>
                {user.email && <span>• ✉️ {user.email}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs self-start sm:self-center">
            <span className="text-stone-500">{t('Tổng số đơn đặt:', 'Total Bookings:')}</span>
            <strong className="text-orange-600 font-bold text-sm">{reservations.length}</strong>
          </div>
        </div>

        {/* HEADER DANH SÁCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {t('Lịch sử đặt bàn & Mã QR Check-in', 'Reservations & Check-in QR Codes')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              {t(
                'Theo dõi trạng thái duyệt chỗ, xem thông tin bàn ăn và xuất trình mã QR khi đến nhà hàng.',
                'Track confirmation status, view assigned table, and present QR code upon arrival.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw size={14} className={isRefetching ? 'animate-spin text-orange-500' : ''} />
              {t('Làm mới', 'Refresh')}
            </button>
            <button
              onClick={() => navigate('/reservation')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition cursor-pointer shadow-xs"
            >
              {t('Đặt bàn mới', 'Book a Table')}
            </button>
          </div>
        </div>

        {/* NỘI DUNG DANH SÁCH */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 size={36} className="animate-spin text-orange-500" />
            <p className="text-sm font-semibold">{t('Đang tải danh sách đặt bàn...', 'Loading your reservations...')}</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="rounded-3xl bg-white border border-stone-200/80 p-12 text-center shadow-xs">
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-50 text-orange-500 grid place-items-center mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {t('Bạn chưa có đơn đặt bàn nào', 'No Reservations Found')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {t(
                'Hãy lên lịch cho bữa tiệc hoặc bữa tối ẩm thực tuyệt vời tại ROMS Restaurant ngay hôm nay.',
                'Book your unforgettable dining experience with us today.'
              )}
            </p>
            <button
              onClick={() => navigate('/reservation')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-orange-500 transition cursor-pointer shadow-xs"
            >
              <Utensils size={15} />
              {t('Đặt bàn ngay', 'Reserve a Table Now')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res: Reservation) => {
              const resDate = new Date(res.reservationTime)
              const timeStr = `${String(resDate.getHours()).padStart(2, '0')}:${String(resDate.getMinutes()).padStart(2, '0')}`
              const dateStr = `${String(resDate.getDate()).padStart(2, '0')}/${String(resDate.getMonth() + 1).padStart(2, '0')}/${resDate.getFullYear()}`
              const badge = getStatusBadge(res.status)

              return (
                <div
                  key={res.id}
                  className="rounded-2xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                        #{res.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-orange-500 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] text-stone-400 font-bold uppercase">{t('Ngày hẹn', 'Date')}</span>
                          <strong className="text-stone-900 font-semibold">{dateStr}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-orange-500 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] text-stone-400 font-bold uppercase">{t('Giờ hẹn', 'Time')}</span>
                          <strong className="text-stone-900 font-semibold">{timeStr}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={15} className="text-orange-500 flex-shrink-0" />
                        <div>
                          <span className="block text-[10px] text-stone-400 font-bold uppercase">{t('Số khách', 'Guests')}</span>
                          <strong className="text-stone-900 font-semibold">{res.partySize} {t('người', 'guests')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* THÔNG TIN BÀN */}
                    {res.table ? (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
                        <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
                        <span>
                          {t('Bàn của bạn:', 'Your Table:')}{' '}
                          <strong className="font-bold text-emerald-950">
                            {res.table.tableNumber} ({t('Tầng', 'Floor')} {res.table.floor})
                          </strong>
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200">
                        <Clock size={13} className="text-amber-500" />
                        <span>{t('Nhà hàng đang sắp xếp vị trí bàn phù hợp nhất...', 'Table assignment in progress...')}</span>
                      </div>
                    )}

                    {res.specialRequest && (
                      <p className="text-[11.5px] text-stone-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        💬 {res.specialRequest}
                      </p>
                    )}
                  </div>

                  {/* CỘT NÚT THAO TÁC */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/reservation/${res.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-2xs cursor-pointer"
                    >
                      <QrCode size={16} />
                      {t('Mã QR Check-in', 'View QR Code')}
                    </button>

                    {res.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => setCancelResId(res.id)}
                        className="text-xs font-semibold text-stone-500 hover:text-red-600 transition cursor-pointer px-2 py-1"
                      >
                        {t('Hủy đặt bàn', 'Cancel')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN HỦY */}
      {cancelResId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 grid place-items-center">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">{t('Xác nhận huỷ đặt bàn?', 'Cancel Reservation?')}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {t(
                  'Bạn có chắc chắn muốn hủy đơn đặt bàn này không? Thao tác này không thể hoàn tác.',
                  'Are you sure you want to cancel this booking? This action cannot be undone.'
                )}
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCancelResId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
              >
                {t('Giữ lại', 'Keep')}
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => cancelResId && cancelMutation.mutate(cancelResId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer"
              >
                {cancelMutation.isPending ? t('Đang huỷ...', 'Cancelling...') : t('Xác nhận huỷ', 'Yes, Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
