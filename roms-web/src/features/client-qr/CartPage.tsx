import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Utensils,
  CalendarCheck,
  QrCode,
  Info,
  Loader2,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { orderService } from '@/services/modules/orderService'
import { useClientLocale } from '@/contexts/ClientLocaleContext'

export default function CartPage() {
  const { t } = useClientLocale()
  const navigate = useNavigate()
  const { tableId } = useParams()
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Khách đang ngồi tại bàn thực tế nếu tableId hợp lệ và khác 'demo'
  const isDineIn = Boolean(tableId && tableId !== 'demo')

  const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleCheckout = async () => {
    // 1. Nếu là khách xem web bình thường (đặt bàn trước)
    if (!isDineIn) {
      navigate('/reservation')
      return
    }

    // 2. Nếu là khách quét QR tại bàn (Dine-in Order)
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const order = await orderService.create({
        tableId: tableId!,
        items: items.map(({ menuItem, quantity }) => ({
          menuItemId: menuItem.id,
          quantity,
        })),
      })
      clearCart()
      navigate(`/table/${tableId}/order-status`, { state: { orderId: order.id } })
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setSubmitError(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg || t(
              'Không thể gửi đơn gọi món. Vui lòng thử lại hoặc nhờ nhân viên phục vụ hỗ trợ.',
              'We could not send your order. Please try again or ask a waiter for help.'
            )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#fffaf2] min-h-screen py-12 text-stone-900 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="text-orange-500" />{' '}
              {isDineIn
                ? t('Giỏ hàng gọi món tại bàn', 'Dine-In Cart')
                : t('Giỏ hàng món ăn (Đặt trước)', 'Pre-Order Cart')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {isDineIn
                ? t(
                    'Các món sẽ được gửi trực tiếp đến Bếp để chế biến cho bàn của bạn.',
                    'Dishes will be sent straight to the kitchen for preparation.'
                  )
                : t(
                    'Các món bạn chọn sẽ được liên kết với đơn đặt bàn để nhà hàng chuẩn bị chu đáo trước.',
                    'Your selected dishes will be included with your table reservation.'
                  )}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="text-xs font-bold text-orange-600 px-4 py-2 rounded-xl border border-orange-200 hover:border-orange-500 bg-white hover:bg-orange-50 transition cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              {t('+ Thêm món khác từ thực đơn', '+ Add more dishes from menu')}
            </button>
          )}
        </div>

        {/* THÔNG BÁO NGỮ CẢNH: ĐẶT BÀN TRƯỚC HAY GỌI MÓN TẠI BÀN */}
        {items.length > 0 && !isDineIn && (
          <div className="mb-6 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 text-xs text-amber-900 flex items-start sm:items-center gap-3 shadow-2xs">
            <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <span className="font-bold">
                {t('Bạn đang chọn món để Đặt bàn trước (Pre-order):', 'You are selecting dishes for Table Reservation (Pre-order):')}
              </span>{' '}
              {t(
                'Nhấn nút "Tiếp tục đặt bàn" bên dưới để chọn Ngày, Giờ và Số lượng khách. Món ăn sẽ được ghi nhận vào đơn đặt của bạn.',
                'Click "Proceed to reservation" below to choose Date, Time, and Party size. Dishes will be included in your reservation.'
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-stone-100 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 grid place-items-center mx-auto mb-4">
              <Utensils size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {t('Giỏ hàng của bạn đang trống', 'Your cart is currently empty')}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              {t(
                'Hãy khám phá thực đơn đa dạng và chọn những món ăn hấp dẫn bạn yêu thích nhé!',
                'Explore our delicious menu and pick your favorite dishes!'
              )}
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white text-xs sm:text-sm shadow-md hover:bg-orange-600 transition cursor-pointer"
            >
              {t('Khám phá thực đơn ngay', 'Explore the menu')} <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITEM LIST */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-stone-100 gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.menuItem.imageUrl || '/Home/default-dish.jpg'}
                      alt={item.menuItem.name}
                      className="h-18 w-18 sm:h-20 sm:w-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-orange-500 mt-1">
                        ${item.menuItem.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition cursor-pointer"
                        title={t('Giảm số lượng', 'Decrease')}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition cursor-pointer"
                        title={t('Tăng số lượng', 'Increase')}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="font-bold text-stone-900 text-sm hidden sm:block w-16 text-right">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItem.id)}
                      className="text-stone-400 hover:text-red-500 transition p-2 cursor-pointer"
                      title={t('Xóa món', 'Remove item')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-stone-100 h-fit space-y-6">
              <h2 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-4">
                {t('Tóm tắt đơn hàng', 'Order summary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>{t('Tạm tính', 'Subtotal')}</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('Thuế VAT (8%)', 'Tax (8%)')}</span>
                  <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-900">
                  <span>{t('Tổng cộng', 'Total')}</span>
                  <span className="text-orange-500 font-extrabold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              {submitError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  {submitError}
                </div>
              )}

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('Đang gửi gọi món...', 'Sending order...')}</span>
                  </>
                ) : isDineIn ? (
                  <>
                    <Utensils size={16} />
                    <span>{t('Gửi gọi món vào bếp (Place order)', 'Place Order')}</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <CalendarCheck size={16} />
                    <span>{t('Tiếp tục đặt bàn với món đã chọn', 'Proceed to Reservation')}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* HINT FOR DINE-IN USERS */}
              {!isDineIn && (
                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  💡 {t(
                    'Đang ngồi tại nhà hàng? Vui lòng quét mã QR trên bàn ăn để gọi món trực tiếp.',
                    'Seated at the restaurant? Please scan the QR code on your table to order directly.'
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
