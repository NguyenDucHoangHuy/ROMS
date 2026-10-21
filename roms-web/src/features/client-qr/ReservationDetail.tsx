import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Users, Calendar, Phone, Utensils, RotateCw, AlertCircle, Loader2, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { reservationService } from '@/services/modules/reservationService'
import { useClientLocale } from '@/contexts/ClientLocaleContext'

export default function ReservationDetail() {
  const { t } = useClientLocale()
  const navigate = useNavigate()
  const params = useParams<{ reservationId?: string; id?: string }>()
  const reservationId = params.reservationId || params.id || ''

  const {
    data: reservation,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => reservationService.getById(reservationId),
    enabled: Boolean(reservationId),
    refetchInterval: 10000, // Tự động làm mới mỗi 10s để xem trạng thái duyệt của Admin
  })

  if (isLoading) {
    return (
      <div className="bg-[#fffaf2] min-h-screen py-16 flex items-center justify-center text-stone-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-orange-500" />
          <p className="text-sm font-bold text-stone-600">{t('Đang tải thông tin đặt bàn...', 'Loading reservation details...')}</p>
        </div>
      </div>
    )
  }

  if (isError || !reservation) {
    return (
      <div className="bg-[#fffaf2] min-h-screen py-16 text-stone-900">
        <div className="mx-auto max-w-md px-4 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold">{t('Không tìm thấy đơn đặt bàn', 'Reservation Not Found')}</h2>
          <p className="text-xs text-stone-500">
            {t('Mã đặt bàn không tồn tại hoặc đã bị xóa.', 'The reservation code does not exist or has been removed.')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition"
          >
            {t('Về trang chủ', 'Go to Home')}
          </button>
        </div>
      </div>
    )
  }

  // Format ngày và giờ
  const resDate = new Date(reservation.reservationTime)
  const timeStr = `${String(resDate.getHours()).padStart(2, '0')}:${String(resDate.getMinutes()).padStart(2, '0')}`
  const dateStr = `${String(resDate.getDate()).padStart(2, '0')}/${String(resDate.getMonth() + 1).padStart(2, '0')}/${resDate.getFullYear()}`

  // Trạng thái badge
  const getStatusBadge = () => {
    switch (reservation.status) {
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: t('Đã xác nhận đặt bàn', 'Confirmed'),
          icon: <CheckCircle2 size={16} className="text-emerald-600" />,
        }
      case 'COMPLETED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: t('Đã check-in vào bàn', 'Checked-In'),
          icon: <CheckCircle2 size={16} className="text-blue-600" />,
        }
      case 'CANCELLED':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          dot: 'bg-stone-400',
          label: t('Đã bị hủy', 'Cancelled'),
          icon: <AlertCircle size={16} className="text-stone-500" />,
        }
      case 'PENDING':
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: t('Đang chờ nhà hàng xác nhận', 'Pending Approval'),
          icon: <Clock size={16} className="text-amber-600" />,
        }
    }
  }

  const badge = getStatusBadge()

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900 font-sans">
      <div className="mx-auto max-w-xl px-4 text-center">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-stone-100 space-y-6">
          
          {/* ICON TRẠNG THÁI */}
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-600">
            <Utensils size={32} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              {t('Bước 3 / 3 • Hoàn tất', 'Step 3 of 3 • Completed')}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
              {reservation.status === 'CONFIRMED'
                ? t('Đặt bàn đã được xác nhận!', 'Reservation Confirmed!')
                : t('Đặt bàn thành công!', 'Reservation Submitted!')}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {t('Mã đặt chỗ:', 'Reservation Code:')}{' '}
              <strong className="text-orange-600 font-mono text-sm tracking-wider">
                #{reservation.id.slice(0, 8).toUpperCase()}
              </strong>
            </p>
          </div>

          {/* BADGE TRẠNG THÁI THỜI GIAN THỰC */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-xs mx-auto"
            style={{ backgroundColor: badge.bg.split(' ')[0].replace('bg-', '') }}>
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
            <span className="flex items-center gap-1.5">{badge.icon} {badge.label}</span>
          </div>

          {/* MÃ QR CHECK-IN TẠI QUẦY */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 inline-block w-full max-w-xs mx-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${reservation.id}`}
              alt={`QR Code ${reservation.id}`}
              className="mx-auto h-36 w-36 rounded-xl bg-white p-2 shadow-xs"
            />
            <p className="text-[11px] text-stone-500 font-semibold mt-3">
              {t('Đưa mã QR này cho Nhân viên phục vụ khi đến nhà hàng để nhận bàn.', 'Present this QR code to the staff when you arrive to be seated.')}
            </p>
          </div>

          {/* CHI TIẾT ĐƠN ĐẶT */}
          <div className="space-y-3 text-left border-t border-stone-100 pt-5 text-sm text-stone-600">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Users size={16} className="text-orange-500" /> {t('Khách hàng:', 'Customer:')}</span>
              <strong className="text-stone-900">{reservation.guestName}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Phone size={16} className="text-stone-400" /> {t('Số điện thoại:', 'Phone:')}</span>
              <span className="text-stone-900 font-medium">{reservation.guestPhone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-orange-500" /> {t('Ngày hẹn:', 'Date:')}</span>
              <strong className="text-stone-900">{dateStr}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> {t('Giờ hẹn:', 'Time:')}</span>
              <strong className="text-stone-900">{timeStr}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Users size={16} className="text-orange-500" /> {t('Số người:', 'Party Size:')}</span>
              <strong className="text-stone-900">{reservation.partySize} {t('khách', 'guests')}</strong>
            </div>

            {reservation.table ? (
              <div className="flex justify-between items-center bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    <MapPin size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t('Bàn đã được xếp', 'Seated Table')}</span>
                    <strong className="text-sm">{reservation.table.tableNumber} • {t('Tầng', 'Floor')} {reservation.table.floor}</strong>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
                  {t('Sẵn sàng đón tiếp', 'Ready')}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-amber-600" />
                  {t('Quản lý đang chọn bàn đẹp nhất theo sở thích của bạn...', 'Manager is assigning the best table for your preferences...')}
                </span>
              </div>
            )}

            {Number(reservation.depositAmount) > 0 && (
              <div className="flex justify-between items-center">
                <span>{t('Tiền cọc:', 'Deposit:')}</span>
                <span className="font-bold text-emerald-600">
                  ${Number(reservation.depositAmount).toFixed(2)} ({reservation.depositStatus})
                </span>
              </div>
            )}

            {reservation.specialRequest && (
              <div className="pt-2 border-t border-stone-100 text-xs text-left">
                <span className="font-bold text-stone-500">{t('Yêu cầu & Sở thích của bạn:', 'Your Preferences & Requests:')}</span>
                <p className="mt-1 text-stone-800 font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  {reservation.specialRequest}
                </p>
              </div>
            )}
          </div>

          {/* NÚT THAO TÁC */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-3 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <RotateCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? t('Đang cập nhật...', 'Refreshing...') : t('Làm mới trạng thái', 'Refresh Status')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-600 transition cursor-pointer"
            >
              {t('Xem thực đơn nhà hàng', 'Browse Menu')}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl bg-stone-100 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            >
              {t('Trang chủ', 'Home')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
