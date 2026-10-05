import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChefHat, CheckCircle2, Clock, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { orderService } from '@/services/modules/orderService'
import { queryKeys } from '@/constants/queryKeys'
import { getSocket } from '@/lib/socket'

const statusLabels: Record<string, string> = {
  CREATED: 'Order received',
  CONFIRMED: 'Order confirmed',
  IN_PROGRESS: 'Being prepared',
  COOKING: 'Being prepared',
  READY: 'Ready to serve',
  SERVED: 'Served',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const statusRank: Record<string, number> = {
  CREATED: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  COOKING: 2,
  READY: 3,
  SERVED: 4,
  COMPLETED: 4,
}

export default function OrderStatusPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = (location.state as { orderId?: string } | null)?.orderId
  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.orders.byTable(tableId ?? ''),
    queryFn: () => orderService.getByTable(tableId!),
    enabled: Boolean(tableId),
    refetchInterval: 2000,
  })

  const refreshOrder = useCallback(() => { void refetch() }, [refetch])
  useEffect(() => {
    if (!tableId) return
    const socket = getSocket()
    socket.connect()
    socket.emit('table:join', { tableId })
    socket.on('order:item-updated', refreshOrder)
    return () => {
      socket.off('order:item-updated', refreshOrder)
      socket.emit('table:leave', { tableId })
      socket.disconnect()
    }
  }, [tableId, refreshOrder])

  const orderItems = order?.items ?? []
  const orderStatus = order?.status ?? 'CREATED'
  const currentRank = statusRank[orderStatus] ?? 0
  const steps = [
    { label: 'Order received', icon: CheckCircle2 },
    { label: 'Being prepared', icon: ChefHat },
    { label: 'Ready to serve', icon: UtensilsCrossed },
  ]

  return (
    <div className="min-h-screen bg-[#fffaf2] py-12 text-stone-900">
      <div className="mx-auto max-w-2xl px-4">
        <div className="space-y-8 rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Your order</h1>
            {order && <p className="mt-1 text-xs text-stone-500">Order {order.orderCode || order.id}</p>}
            <p className="mt-2 text-sm font-semibold text-orange-600">{statusLabels[orderStatus] ?? orderStatus}</p>
          </div>

          {!tableId && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-800">Open this page from the QR code at your table to track an order.</p>}
          {isLoading && <p className="text-center text-sm text-stone-500">Loading your order…</p>}
          {isError && <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">We could not load the order status. <button onClick={refreshOrder} className="font-bold underline">Try again</button></div>}

          {order && orderStatus !== 'CANCELLED' && <div className="relative flex justify-between">
            <div className="absolute left-8 right-8 top-5 h-1 bg-stone-100" />
            {steps.map(({ label, icon: Icon }, index) => {
              const done = currentRank >= index
              return <div key={label} className="relative z-10 flex w-24 flex-col items-center gap-2 bg-white px-1 text-center">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${done ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-400'}`}><Icon size={18} /></span>
                <span className="text-[11px] font-semibold text-stone-700">{label}</span>
              </div>
            })}
          </div>}

          {order && <div className="space-y-3 border-t border-stone-100 pt-6">
            <h2 className="text-sm font-bold">Items in this order</h2>
            {orderItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{item.quantity} × {item.menuItem.name}</span>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{statusLabels[item.status] ?? item.status}</span>
            </div>)}
            {!orderItems.length && <p className="text-sm text-stone-500">Order items will appear here.</p>}
          </div>}

          {order && <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
            <span className="flex items-center gap-2 text-stone-500"><Clock size={15} /> Order total</span>
            <span className="font-bold">${Number(order.totalAmount).toFixed(2)}</span>
          </div>}

          <div className="flex gap-3">
            <button onClick={() => navigate(`/table/${tableId}/menu`)} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white">Add more dishes</button>
            <button onClick={refreshOrder} aria-label="Refresh order" className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-stone-700"><RefreshCw size={17} /></button>
          </div>
          {orderId && !order && <p className="text-center text-xs text-stone-400">We are looking for order {orderId}.</p>}
        </div>
      </div>
    </div>
  )
}
