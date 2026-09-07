import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChefSidebar from './ChefSidebar';
import { queryKeys } from '@/constants/queryKeys';
import { getSocket } from '@/lib/socket';
import { inventoryService } from '@/services/modules/inventoryService';
import { orderService } from '@/services/modules/orderService';
import type { KitchenOrderItem } from '@/types/order.types';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Clock,
  Flame,
  Soup,
  ChefHat,
  AlertTriangle,
  Package,
  CheckCircle2,
  AlertCircle,
  Timer,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  icon: React.ElementType;
  activeCount: number;
  pendingCount: number;
  capacityPercent: number;
  loadStatus: 'High Load' | 'Moderate' | 'Normal';
  theme: {
    badge: string;
    iconBg: string;
    iconColor: string;
    bar: string;
    border: string;
  };
}

interface TicketItem {
  name: string;
  note?: string;
  status: 'done' | 'cooking' | 'pending';
}

interface Ticket {
  id: string;
  table: string;
  elapsedMin: number;
  urgency: 'critical' | 'warning' | 'normal';
  items: TicketItem[];
  allergyNotice?: string;
}

export const ChefDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [ticketFilter, setTicketFilter] = useState<'all' | 'urgent'>('all');

  const { data: queue = [] } = useQuery({
    queryKey: queryKeys.orders.kitchenQueue(),
    queryFn: orderService.getKitchenQueue,
    refetchInterval: 30000,
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: inventoryService.getLowStock,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('kitchen:join');

    const refreshKitchen = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.kitchenQueue() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock() });
    };

    socket.on('kitchen:queue-updated', refreshKitchen);
    socket.on('order:item-updated', refreshKitchen);
    socket.on('inventory:updated', refreshKitchen);

    return () => {
      socket.off('kitchen:queue-updated', refreshKitchen);
      socket.off('order:item-updated', refreshKitchen);
      socket.off('inventory:updated', refreshKitchen);
    };
  }, [queryClient]);

  const stations: Station[] = [
    {
      id: 'grill',
      name: 'Grill Station',
      icon: Flame,
      activeCount: 12,
      pendingCount: 4,
      capacityPercent: 85,
      loadStatus: 'High Load',
      theme: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
        iconBg: 'bg-rose-100/70',
        iconColor: 'text-rose-600',
        bar: 'bg-gradient-to-r from-rose-500 to-orange-500',
        border: 'hover:border-rose-300',
      },
    },
    {
      id: 'saute',
      name: 'Sauté Station',
      icon: Soup,
      activeCount: 8,
      pendingCount: 2,
      capacityPercent: 55,
      loadStatus: 'Moderate',
      theme: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
        iconBg: 'bg-amber-100/70',
        iconColor: 'text-amber-600',
        bar: 'bg-amber-500',
        border: 'hover:border-amber-300',
      },
    },
    {
      id: 'prep',
      name: 'Prep Station',
      icon: ChefHat,
      activeCount: 5,
      pendingCount: 8,
      capacityPercent: 30,
      loadStatus: 'Normal',
      theme: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        iconBg: 'bg-emerald-100/70',
        iconColor: 'text-emerald-600',
        bar: 'bg-emerald-500',
        border: 'hover:border-emerald-300',
      },
    },
  ];

  const tickets: Ticket[] = [
    {
      id: '#1042',
      table: 'Table 08',
      elapsedMin: 18,
      urgency: 'critical',
      allergyNotice: 'Shellfish (Guest 3 only)',
      items: [
        { name: '2x Wagyu Ribeye', note: 'Medium Rare', status: 'done' },
        { name: '1x Truffle Risotto', status: 'cooking' },
        { name: '1x Lobster Thermidor', status: 'pending' },
      ],
    },
    {
      id: '#1043',
      table: 'Table 14',
      elapsedMin: 8,
      urgency: 'warning',
      items: [{ name: "4x Chef's Tasting Menu", status: 'cooking' }],
    },
    {
      id: '#1044',
      table: 'Bar 02',
      elapsedMin: 3,
      urgency: 'normal',
      items: [
        { name: '1x Charcuterie Board', status: 'cooking' },
        { name: '1x Fresh Oysters (Half Dozen)', status: 'cooking' },
      ],
    },
  ];

  const liveStations = useMemo<Station[]>(() => {
    if (queue.length === 0) return [];

    const grouped = queue.reduce<Record<string, KitchenOrderItem[]>>((acc, item) => {
      const key = item.categoryName || 'Main';
      acc[key] = [...(acc[key] ?? []), item];
      return acc;
    }, {});

    const icons = [Flame, Soup, ChefHat, Package];

    return Object.entries(grouped).map(([name, items], index) => {
      const activeCount = items.filter((item) => item.status === 'COOKING').length;
      const pendingCount = items.filter((item) => item.status === 'PENDING').length;
      const capacityPercent = Math.min(100, Math.round(((activeCount + pendingCount) / 8) * 100));
      const loadStatus = capacityPercent >= 75 ? 'High Load' : capacityPercent >= 40 ? 'Moderate' : 'Normal';

      return {
        id: name,
        name: `${name} Station`,
        icon: icons[index % icons.length],
        activeCount,
        pendingCount,
        capacityPercent,
        loadStatus,
        theme:
          loadStatus === 'High Load'
            ? {
                badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
                iconBg: 'bg-rose-100/70',
                iconColor: 'text-rose-600',
                bar: 'bg-gradient-to-r from-rose-500 to-orange-500',
                border: 'hover:border-rose-300',
              }
            : loadStatus === 'Moderate'
            ? {
                badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
                iconBg: 'bg-amber-100/70',
                iconColor: 'text-amber-600',
                bar: 'bg-amber-500',
                border: 'hover:border-amber-300',
              }
            : {
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                iconBg: 'bg-emerald-100/70',
                iconColor: 'text-emerald-600',
                bar: 'bg-emerald-500',
                border: 'hover:border-emerald-300',
              },
      };
    });
  }, [queue]);

  const liveTickets = useMemo<Ticket[]>(() => {
    if (queue.length === 0) return [];

    const grouped = queue.reduce<Record<string, KitchenOrderItem[]>>((acc, item) => {
      acc[item.orderId] = [...(acc[item.orderId] ?? []), item];
      return acc;
    }, {});

    return Object.values(grouped).map((items) => {
      const first = items[0];
      const elapsedMin = Math.max(0, Math.floor((Date.now() - new Date(first.createdAt).getTime()) / 60000));

      return {
        id: first.orderCode,
        table: first.tableName,
        elapsedMin,
        urgency: elapsedMin >= 20 ? 'critical' : elapsedMin >= 10 ? 'warning' : 'normal',
        items: items.map((item) => ({
          name: `${item.quantity}x ${item.menuItemName}`,
          note: item.note ?? undefined,
          status:
            item.status === 'READY'
              ? 'done'
              : item.status === 'COOKING'
              ? 'cooking'
              : 'pending',
        })),
      };
    });
  }, [queue]);

  const stationRows = liveStations.length > 0 ? liveStations : stations;
  const ticketRows = liveTickets.length > 0 ? liveTickets : tickets;

  const activeTicketCount = queue.length > 0 ? new Set(queue.map((item) => item.orderId)).size : 42;
  const avgTicketMinutes =
    liveTickets.length > 0
      ? Math.round(liveTickets.reduce((sum, ticket) => sum + ticket.elapsedMin, 0) / liveTickets.length)
      : 14;

  const filteredTickets = ticketRows.filter((t) =>
    ticketFilter === 'urgent' ? t.urgency === 'critical' : true
  );

  return (
    <div className="flex h-screen w-full bg-slate-50/70 text-slate-800 font-sans antialiased overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="relative w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active orders, dishes, ingredients..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Refresh Queue"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                title="Notifications"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              </button>
            </div>
            <button
              title="Filter"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
          {/* LEFT & CENTER: Metrics, Stations, Alerts (8 Cols) */}
          <section className="col-span-8 space-y-7">
            {/* Service Overview & KPI Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Kitchen Active</span>
                </div>
                <h1 className="text-3xl font-serif font-extrabold text-slate-900 tracking-tight mt-1">
                  Service Overview
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Friday Dinner Service • Seatings 19:00 - 22:00</p>
              </div>

              {/* KPI Badges */}
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm text-center min-w-[110px]">
                  <span className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Timer className="w-3.5 h-3.5" /> Avg Ticket
                  </span>
                  <span className="text-2xl font-serif font-bold text-slate-800 tracking-tight">{avgTicketMinutes}m</span>
                </div>

                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm border border-slate-800 text-center min-w-[110px]">
                  <span className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                    Active Tickets
                  </span>
                  <span className="text-2xl font-serif font-bold tracking-tight">{activeTicketCount}</span>
                </div>
              </div>
            </div>

            {/* Station Load Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Station Capacity</h2>
                <span className="text-xs text-slate-400">{stationRows.length} Stations Operational</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {stationRows.map((st) => {
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.id}
                      className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 ${st.theme.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.theme.iconBg} ${st.theme.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${st.theme.badge}`}>
                          {st.loadStatus}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-900">{st.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <strong className="text-slate-800">{st.activeCount} active</strong> • {st.pendingCount} queued
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                          <span>Load</span>
                          <span>{st.capacityPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${st.theme.bar}`}
                            style={{ width: `${st.capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Alerts Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <h2 className="font-serif text-lg font-bold text-slate-900">Priority Notifications</h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">Auto-clears upon resolution</span>
              </div>

              {/* Overdue Ticket Alert */}
              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-rose-950">Table 12 — Delay Alert</h4>
                      <span className="px-2 py-0.2 text-[10px] font-bold bg-rose-200/60 text-rose-800 rounded-md">
                        +28 mins
                      </span>
                    </div>
                    <p className="text-xs text-rose-700/90 mt-0.5">
                      Main courses pending excessive dwell time. Waiting on station: <strong>Grill</strong>.
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition">
                  Expedite Now
                </button>
              </div>

              {/* Low Stock Alert */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-amber-950">Low Inventory Threshold</h4>
                      <span className="px-2 py-0.2 text-[10px] font-bold bg-amber-200/60 text-amber-900 rounded-md">
                        2 units left
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/90 mt-0.5">
                      {lowStockItems[0]?.name ?? 'Inventory'} reserve is below threshold. Reorder recommendation generated.
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl transition active:scale-95">
                  Acknowledge
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE: EXPEDITOR LIVE COLUMN (4 Cols) */}
          <aside className="col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)]">
            {/* Expeditor Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">Expeditor Queue</h2>
                <p className="text-[11px] text-slate-400">Chronological live stream</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span className="text-[11px] font-bold text-rose-600 tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 py-3 border-b border-slate-100 shrink-0">
              <button
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  ticketFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All ({ticketRows.length})
              </button>
              <button
                onClick={() => setTicketFilter('urgent')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  ticketFilter === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Urgent ({ticketRows.filter((t) => t.urgency === 'critical').length})
              </button>
            </div>

            {/* Ticket Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pt-3 pr-1">
              {filteredTickets.map((t) => {
                const isCritical = t.urgency === 'critical';
                const isWarning = t.urgency === 'warning';

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl bg-white border transition-all duration-150 space-y-3 shadow-xs ${
                      isCritical
                        ? 'border-rose-300 border-l-[6px] border-l-rose-600 bg-rose-50/20'
                        : isWarning
                        ? 'border-amber-300 border-l-[6px] border-l-amber-500'
                        : 'border-slate-200 border-l-[6px] border-l-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t.id}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {t.elapsedMin}m
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-2xl font-bold text-slate-900">{t.table}</h3>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dish Items */}
                    <div className="space-y-2 text-sm divide-y divide-slate-100 pt-1">
                      {t.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between pt-1.5 first:pt-0">
                          <div>
                            <p className="font-medium text-slate-800 leading-tight">{item.name}</p>
                            {item.note && (
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded mt-0.5">
                                {item.note}
                              </span>
                            )}
                          </div>
                          {item.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Allergy Callout */}
                    {t.allergyNotice && (
                      <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200/80 rounded-xl text-[11px] font-semibold text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Allergy: {t.allergyNotice}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ChefDashboard;
