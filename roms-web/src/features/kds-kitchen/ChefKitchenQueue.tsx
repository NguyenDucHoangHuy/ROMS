import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ChefSidebar from './ChefSidebar'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Crown,
  Flame,
  Loader2,
  MessageSquare,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Volume2,
  XCircle,
} from 'lucide-react'
import { queryKeys } from '@/constants/queryKeys'
import { orderService } from '@/services/modules/orderService'
import { getSocket } from '@/lib/socket'
import type { KitchenOrderItem } from '@/types/order.types'

type Station = 'All' | 'Appetizer' | 'Main' | 'Dessert' | 'Drink'
type TicketStatus = 'incoming' | 'in_progress' | 'window'

interface TicketOrder {
  id: string
  orderNumber: string
  table: string
  tableId: string
  isPriority: boolean
  server: string
  elapsedTime: string
  isOverdue: boolean
  status: TicketStatus
  items: KitchenOrderItem[]
}

const stations: Station[] = ['All', 'Appetizer', 'Main', 'Dessert', 'Drink']

function getElapsedTime(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getTicketStatus(items: KitchenOrderItem[]): TicketStatus {
  if (items.every((item) => item.status === 'READY')) return 'window'
  if (items.some((item) => item.status === 'COOKING' || item.status === 'READY')) return 'in_progress'
  return 'incoming'
}

function groupItemsIntoTickets(items: KitchenOrderItem[]): TicketOrder[] {
  const map = new Map<string, KitchenOrderItem[]>()

  items.forEach((item) => {
    const current = map.get(item.orderId) ?? []
    map.set(item.orderId, [...current, item])
  })

  return Array.from(map.values()).map((group) => {
    const first = group[0]
    const elapsedMinutes = Math.floor((Date.now() - new Date(first.createdAt).getTime()) / 60000)

    return {
      id: first.orderId,
      orderNumber: first.orderCode,
      table: first.tableName,
      tableId: first.tableId,
      isPriority: group.some((item) => item.isPriority),
      server: first.waiterName,
      elapsedTime: getElapsedTime(first.createdAt),
      isOverdue: elapsedMinutes >= 15,
      status: getTicketStatus(group),
      items: group,
    }
  })
}

function getStationBadge(station: string) {
  switch (station) {
    case 'Main':
      return 'bg-rose-50 text-rose-700 border border-rose-200/60'
    case 'Appetizer':
      return 'bg-amber-50 text-amber-800 border border-amber-200/60'
    case 'Dessert':
      return 'bg-violet-50 text-violet-800 border border-violet-200/60'
    case 'Drink':
      return 'bg-sky-50 text-sky-800 border border-sky-200/60'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

export const ChefKitchenQueue: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedStation, setSelectedStation] = useState<Station>('All')
  const [isExpediterActive, setIsExpediterActive] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.orders.kitchenQueue(),
    queryFn: orderService.getKitchenQueue,
    refetchInterval: 30000,
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    socket.emit('kitchen:join')

    const refreshKitchen = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.kitchenQueue() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock() })
    }

    socket.on('kitchen:queue-updated', refreshKitchen)
    socket.on('order:item-updated', refreshKitchen)
    socket.on('inventory:updated', refreshKitchen)

    return () => {
      socket.off('kitchen:queue-updated', refreshKitchen)
      socket.off('order:item-updated', refreshKitchen)
      socket.off('inventory:updated', refreshKitchen)
      socket.emit('kitchen:leave')
    }
  }, [queryClient])

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      itemId,
      status,
      rejectedReason,
    }: {
      orderId: string
      itemId: string
      status: KitchenOrderItem['status']
      rejectedReason?: string
    }) => orderService.updateItemStatus(orderId, itemId, status, rejectedReason),
    onSuccess: () => {
      setActionError(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.kitchenQueue() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock() })
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Kitchen action failed. Please try again.'
      setActionError(message)
    },
  })

  const prioritizeMutation = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      orderService.prioritizeItem(orderId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.kitchenQueue() }),
  })

  const tickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return groupItemsIntoTickets(data).filter((ticket) => {
      const stationMatch =
        selectedStation === 'All' ||
        ticket.items.some((item) => item.categoryName === selectedStation)
      const searchMatch =
        !query ||
        ticket.orderNumber.toLowerCase().includes(query) ||
        ticket.table.toLowerCase().includes(query) ||
        ticket.items.some((item) => item.menuItemName.toLowerCase().includes(query))

      return stationMatch && searchMatch
    })
  }, [data, searchQuery, selectedStation])

  const incomingOrders = tickets.filter((order) => order.status === 'incoming')
  const inProgressOrders = tickets.filter((order) => order.status === 'in_progress')
  const windowOrders = tickets.filter((order) => order.status === 'window')

  const handleFireOrder = (order: TicketOrder) => {
    order.items
      .filter((item) => item.status === 'PENDING')
      .forEach((item) =>
        updateStatusMutation.mutate({ orderId: order.id, itemId: item.id, status: 'COOKING' }),
      )
  }

  const handleMarkReady = (order: TicketOrder) => {
    order.items
      .filter((item) => item.status === 'COOKING' || item.status === 'PENDING')
      .forEach((item) =>
        updateStatusMutation.mutate({ orderId: order.id, itemId: item.id, status: 'READY' }),
      )
  }

  const handlePageRunner = (order: TicketOrder) => {
    order.items
      .filter((item) => item.status === 'READY')
      .forEach((item) =>
        updateStatusMutation.mutate({ orderId: order.id, itemId: item.id, status: 'SERVED' }),
      )
  }

  const handleRejectItem = (item: KitchenOrderItem) => {
    const reason = window.prompt('Reason for rejecting this item?', 'Out of stock')
    if (!reason) return

    updateStatusMutation.mutate({
      orderId: item.orderId,
      itemId: item.id,
      status: 'REJECTED',
      rejectedReason: reason,
    })
  }

  const renderTicket = (order: TicketOrder, variant: TicketStatus) => (
    <div
      key={order.id}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border flex flex-col overflow-hidden ${
        order.isOverdue ? 'border-rose-400/80 ring-2 ring-rose-500/10' : 'border-slate-200/90'
      }`}
    >
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold tracking-wider text-slate-700">
                {order.table}
              </span>
              {order.isPriority && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  <Crown className="w-3 h-3" /> Priority
                </span>
              )}
            </div>
            <span className="text-base font-bold text-slate-900 mt-0.5 block font-serif">
              Order {order.orderNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Server: {order.server}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                order.isOverdue
                  ? 'text-rose-700 bg-rose-100/80 animate-pulse'
                  : 'text-indigo-600 bg-indigo-50'
              }`}
            >
              +{order.elapsedTime}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-0.5">
          {order.items.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === 'READY' ? (
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {item.quantity}
                    </span>
                  )}
                  <span
                    className={`font-semibold truncate ${
                      item.status === 'READY' ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {item.menuItemName}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${getStationBadge(item.categoryName)}`}>
                  {item.categoryName}
                </span>
              </div>

              {item.note && <div className="pl-7 text-[11px] text-slate-500 font-normal">{item.note}</div>}
              {item.status !== 'READY' && (
                <div className="pl-7">
                  <button
                    type="button"
                    onClick={() => handleRejectItem(item)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700"
                  >
                    <XCircle className="w-3 h-3" />
                    Reject item
                  </button>
                </div>
              )}
              {item.recipes?.some((recipe) => recipe.currentStock <= recipe.minAlertThreshold) && (
                <div className="pl-7 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    Low ingredient stock
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {variant === 'incoming' && (
        <div className="grid grid-cols-3 bg-slate-50/70 border-t border-slate-100">
          <button
            type="button"
            onClick={() => window.print()}
            className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border-r border-slate-200/70 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={() => prioritizeMutation.mutate({ orderId: order.id, itemId: order.items[0].id })}
            className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 border-r border-slate-200/70 transition"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Priority</span>
          </button>
          <button
            disabled={updateStatusMutation.isPending}
            onClick={() => handleFireOrder(order)}
            className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-60 transition"
          >
            <Flame className="w-3.5 h-3.5 fill-white/20" />
            <span>Fire</span>
          </button>
        </div>
      )}

      {variant === 'in_progress' && (
        <div className="grid grid-cols-2 bg-amber-50/40 border-t border-amber-100">
          <button
            type="button"
            onClick={() => window.alert(`Message sent to ${order.server}`)}
            className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-100/60 border-r border-amber-200/60 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Chat</span>
          </button>
          <button
            disabled={updateStatusMutation.isPending}
            onClick={() => handleMarkReady(order)}
            className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 disabled:opacity-60 transition"
          >
            <Check className="w-4 h-4 text-amber-800 stroke-[2.5]" />
            <span>Mark Ready</span>
          </button>
        </div>
      )}

      {variant === 'window' && (
        <button
          disabled={updateStatusMutation.isPending}
          onClick={() => handlePageRunner(order)}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200/80 disabled:opacity-60 border-t border-emerald-200 transition shadow-sm"
        >
          <Volume2 className="w-4 h-4 text-emerald-800" />
          <span>Page Runner</span>
        </button>
      )}
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-[#f6f7fb] text-slate-800 font-sans overflow-hidden">
      <ChefSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders, dishes, or notes..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="px-8 pt-7 pb-4 shrink-0 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                Kitchen Display
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                DB Live Service
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dinner Shift • <span className="font-semibold text-slate-800">{tickets.length} Active Tickets</span>
              {isFetching && <span className="ml-2 text-amber-700">Refreshing...</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpediterActive(!isExpediterActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm border ${
                isExpediterActive
                  ? 'bg-rose-50 border-rose-200/80 text-rose-700 hover:bg-rose-100/70'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isExpediterActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Expediter {isExpediterActive ? 'Live' : 'Paused'}</span>
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-slate-200/60 p-1 rounded-xl border border-slate-200/60">
              {stations.map((station) => (
                <button
                  key={station}
                  onClick={() => setSelectedStation(station)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedStation === station
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {station === 'All' ? 'All Stations' : station}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isError && (
          <div className="mx-8 mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Cannot load kitchen queue. Check backend and database connection.
          </div>
        )}

        {actionError && (
          <div className="mx-8 mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 grid place-items-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="flex-1 px-8 pb-6 grid grid-cols-3 gap-6 overflow-hidden min-h-0">
            <div className="flex flex-col h-full overflow-hidden bg-slate-100/50 rounded-2xl p-3 border border-slate-200/60">
              <ColumnHeader title="Incoming" count={incomingOrders.length} />
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {incomingOrders.map((order) => renderTicket(order, 'incoming'))}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-hidden bg-amber-50/30 rounded-2xl p-3 border border-amber-200/50">
              <ColumnHeader title="In Progress" count={inProgressOrders.length} tone="amber" />
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {inProgressOrders.map((order) => renderTicket(order, 'in_progress'))}
              </div>
            </div>

            <div className="flex flex-col h-full overflow-hidden bg-emerald-50/30 rounded-2xl p-3 border border-emerald-200/50">
              <ColumnHeader title="Window (Pass)" count={windowOrders.length} tone="emerald" />
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {windowOrders.map((order) => renderTicket(order, 'window'))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ColumnHeader({
  title,
  count,
  tone = 'slate',
}: {
  title: string
  count: number
  tone?: 'slate' | 'amber' | 'emerald'
}) {
  const badgeClass =
    tone === 'amber'
      ? 'bg-amber-500 text-white'
      : tone === 'emerald'
        ? 'bg-emerald-600 text-white'
        : 'bg-slate-200 text-slate-700'

  return (
    <div className="flex items-center justify-between pb-3 px-1 shrink-0">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${badgeClass}`}>
          {count}
        </span>
      </div>
      {tone === 'emerald' && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
    </div>
  )
}

export default ChefKitchenQueue
