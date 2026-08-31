import React, { useState } from 'react';
import ChefSidebar from './ChefSidebar';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Flame,
  Printer,
  MessageSquare,
  Check,
  CheckCheck,
  Volume2,
  RefreshCw,
  //Clock,
  Filter,
} from 'lucide-react';

export type Station = 'Grill' | 'Sauté' | 'Garde Manger' | 'All';
export type OrderStatus = 'incoming' | 'in_progress' | 'window';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  station: 'Grill' | 'Sauté' | 'Garde Manger';
  status: 'pending' | 'cooking' | 'done';
  modifier?: string;
  notes?: string[];
  allergy?: string;
  progressPercent?: number; // 0 to 100
}

export interface TicketOrder {
  id: string;
  orderNumber: string;
  table: string;
  isVIP?: boolean;
  server: string;
  elapsedTime: string;
  isOverdue?: boolean;
  status: OrderStatus;
  items: OrderItem[];
}

const INITIAL_ORDERS: TicketOrder[] = [
  {
    id: 't-1',
    orderNumber: '#8492',
    table: 'TABLE 12',
    server: 'Mia',
    elapsedTime: '02:15',
    status: 'incoming',
    items: [
      {
        id: 'i-1',
        name: 'Wagyu Ribeye',
        quantity: 1,
        station: 'Grill',
        status: 'pending',
        modifier: '** MR (Med Rare)',
        notes: ['- No Asparagus', '+ Sub Pommes Frites'],
      },
      {
        id: 'i-2',
        name: 'Scallop Crudo',
        quantity: 1,
        station: 'Garde Manger',
        status: 'pending',
        allergy: 'ALLERGY: Nuts',
      },
    ],
  },
  {
    id: 't-2',
    orderNumber: '#8493',
    table: 'TABLE 4',
    server: 'David',
    elapsedTime: '00:45',
    status: 'incoming',
    items: [
      {
        id: 'i-3',
        name: 'Truffle Risotto',
        quantity: 2,
        station: 'Sauté',
        status: 'pending',
      },
    ],
  },
  {
    id: 't-3',
    orderNumber: '#8488',
    table: 'TABLE 8',
    isVIP: true,
    server: 'Elena',
    elapsedTime: '18:30',
    isOverdue: true,
    status: 'in_progress',
    items: [
      {
        id: 'i-4',
        name: 'Oysters (Dozen)',
        quantity: 1,
        station: 'Garde Manger',
        status: 'done',
      },
      {
        id: 'i-5',
        name: 'Duck Breast',
        quantity: 1,
        station: 'Sauté',
        status: 'cooking',
        progressPercent: 70,
      },
    ],
  },
  {
    id: 't-4',
    orderNumber: '#8490',
    table: 'TABLE 22',
    server: 'James',
    elapsedTime: '08:12',
    status: 'in_progress',
    items: [
      {
        id: 'i-6',
        name: 'Branzino Whole',
        quantity: 2,
        station: 'Grill',
        status: 'cooking',
        progressPercent: 45,
      },
    ],
  },
  {
    id: 't-5',
    orderNumber: '#8485',
    table: 'BAR 3',
    server: 'Alex',
    elapsedTime: '14:20',
    status: 'window',
    items: [
      {
        id: 'i-7',
        name: 'Artisan Cheese Board',
        quantity: 1,
        station: 'Garde Manger',
        status: 'done',
      },
      {
        id: 'i-8',
        name: 'House Focaccia',
        quantity: 1,
        station: 'Garde Manger',
        status: 'done',
      },
    ],
  },
];

export const ChefKitchenQueue: React.FC = () => {
  const [orders, setOrders] = useState<TicketOrder[]>(INITIAL_ORDERS);
  const [selectedStation, setSelectedStation] = useState<Station>('All');
  const [isExpediterActive, setIsExpediterActive] = useState<boolean>(true);

  // Chuyển đơn từ Incoming -> In Progress
  const handleFireOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'in_progress',
              items: o.items.map((it) => ({
                ...it,
                status: 'cooking',
                progressPercent: 20,
              })),
            }
          : o
      )
    );
  };

  // Chuyển đơn từ In Progress -> Window (Đã xong)
  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'window',
              items: o.items.map((it) => ({
                ...it,
                status: 'done',
                progressPercent: 100,
              })),
            }
          : o
      )
    );
  };

  // Hoàn tất đơn tại Window khi Runner bưng món
  const handlePageRunner = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Lọc theo trạm bếp
  const filterByStation = (orderList: TicketOrder[]) => {
    if (selectedStation === 'All') return orderList;
    return orderList.filter((o) =>
      o.items.some((it) => it.station === selectedStation)
    );
  };

  const incomingOrders = filterByStation(orders.filter((o) => o.status === 'incoming'));
  const inProgressOrders = filterByStation(orders.filter((o) => o.status === 'in_progress'));
  const windowOrders = filterByStation(orders.filter((o) => o.status === 'window'));

  const stations: Station[] = ['All', 'Grill', 'Sauté', 'Garde Manger'];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders, recipes, or stock..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Title Bar & Filter Actions */}
        <div className="px-8 pt-6 pb-4 shrink-0 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
              Kitchen Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Friday Night Dinner Service • <span className="font-semibold text-slate-700">{orders.length} Open Orders</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Expediter Status Toggle */}
            <button
              onClick={() => setIsExpediterActive(!isExpediterActive)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-200/80 hover:bg-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isExpediterActive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                }`}
              ></span>
              <span>Expediter {isExpediterActive ? 'Active' : 'Paused'}</span>
            </button>

            {/* Station Filter Tabs */}
            <div className="flex items-center bg-[#edece8] p-1 rounded-2xl">
              {stations.map((st) => {
                const isActive = selectedStation === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStation(st)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#8b5a19] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'All' ? 'All Stations' : st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. KANBAN QUEUE BOARD */}
        <div className="flex-1 px-8 pb-8 grid grid-cols-3 gap-6 overflow-hidden min-h-0">
          {/* COLUMN 1: INCOMING */}
          <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-slate-900">Incoming</h2>
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                  {incomingOrders.length}
                </span>
              </div>
              <Filter className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5">
              {incomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-[#8b5a19]/80 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-4 space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold tracking-wider text-slate-700 block">
                          {order.table}
                        </span>
                        <span className="text-lg font-serif font-bold text-slate-900">
                          Order {order.orderNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Server: {order.server}</span>
                        <span className="text-sm font-bold text-slate-800">{order.elapsedTime}</span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-3 pt-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                                {item.quantity}
                              </span>
                              <span className="font-semibold text-slate-900">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {item.station}
                            </span>
                          </div>

                          {/* Modifiers & Notes */}
                          {item.modifier && (
                            <div className="pl-7">
                              <span className="inline-block text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                {item.modifier}
                              </span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="pl-7 text-[11px] font-medium text-slate-500 space-y-0.5">
                              {item.notes.map((n, idx) => (
                                <p key={idx}>{n}</p>
                              ))}
                            </div>
                          )}

                          {item.allergy && (
                            <div className="pl-7 pt-0.5">
                              <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded tracking-wide">
                                {item.allergy}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 bg-slate-50 border-t border-slate-100">
                    <button className="py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100 border-r border-slate-200 transition">
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => handleFireOrder(order.id)}
                      className="py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#8b5a19] hover:bg-[#724813] transition"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Fire Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-slate-900">In Progress</h2>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {inProgressOrders.length}
                </span>
              </div>
              <RefreshCw className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5">
              {inProgressOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden flex flex-col ${
                    order.isOverdue
                      ? 'border-l-red-600 border border-slate-200'
                      : 'border-l-amber-500 border border-slate-200'
                  }`}
                >
                  <div className="p-4 space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold tracking-wider ${
                              order.isVIP ? 'text-red-600 font-extrabold' : 'text-slate-700'
                            }`}
                          >
                            {order.table} {order.isVIP && '(VIP)'}
                          </span>
                        </div>
                        <span className="text-lg font-serif font-bold text-slate-900">
                          Order {order.orderNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Server: {order.server}</span>
                        <span
                          className={`text-sm font-bold ${
                            order.isOverdue ? 'text-red-600' : 'text-slate-800'
                          }`}
                        >
                          {order.elapsedTime}
                        </span>
                      </div>
                    </div>

                    {/* Cooking Items List */}
                    <div className="space-y-3 pt-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {item.status === 'done' ? (
                                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                  {item.quantity}
                                </span>
                              )}
                              <span
                                className={`font-semibold ${
                                  item.status === 'done'
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-900'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {item.station}
                            </span>
                          </div>

                          {/* Progress Bar for cooking item */}
                          {item.status === 'cooking' && (
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#8b5a19] h-full rounded-full transition-all duration-300"
                                style={{ width: `${item.progressPercent || 40}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 bg-amber-50/50 border-t border-amber-100">
                    <button className="py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-amber-100/50 border-r border-amber-200 transition">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      className="py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200/60 bg-amber-100/80 transition"
                    >
                      <Check className="w-4 h-4 text-amber-800" />
                      <span>Mark Ready</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: WINDOW (THE PASS) */}
          <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-slate-900">Window</h2>
                <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center">
                  {windowOrders.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5">
              {windowOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-4 space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold tracking-wider text-slate-700 block">
                          {order.table}
                        </span>
                        <span className="text-lg font-serif font-bold text-slate-900">
                          Order {order.orderNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Server: {order.server}</span>
                    </div>

                    {/* All Items Done Checklist */}
                    <div className="space-y-2 pt-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2.5 text-sm">
                          <CheckCheck className="w-4 h-4 text-slate-700 shrink-0" />
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Page Runner Button */}
                  <button
                    onClick={() => handlePageRunner(order.id)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-t border-slate-200 transition"
                  >
                    <Volume2 className="w-4 h-4 text-slate-600" />
                    <span>Page Runner</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChefKitchenQueue;