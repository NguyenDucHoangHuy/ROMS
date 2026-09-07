import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ChefSidebar from './ChefSidebar';
import PurchaseOrderModal from './PurchaseOrderModal';
import ExpediteOrderModal from './ExpediteOrderModal';
import { queryKeys } from '@/constants/queryKeys';
import { getSocket } from '@/lib/socket';
import { inventoryService, type CreateStockReceiptPayload } from '@/services/modules/inventoryService';
import {
  Search,
  Bell,
  SlidersHorizontal,
  ShoppingCart,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  Package,
  Boxes,
  Clock,
  ShieldCheck,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface CriticalItem {
  id: string;
  name: string;
  estRunout: string;
  quantity: string;
  image: string;
}

interface StockCard {
  id: string;
  name: string;
  location: string;
  quantity: string;
  status: 'Optimal' | 'Reorder';
  image: string;
}

export const ChefInventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // States quản lý bật/tắt Modal riêng biệt
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [isExpediteOpen, setIsExpediteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data: inventoryItems = [] } = useQuery({
    queryKey: queryKeys.inventory.all(),
    queryFn: inventoryService.getAll,
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: inventoryService.getLowStock,
  });

  const createReceiptMutation = useMutation({
    mutationFn: (payload: CreateStockReceiptPayload) => inventoryService.createReceipt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock() });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('kitchen:join');

    const refreshInventory = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock() });
    };

    socket.on('inventory:updated', refreshInventory);
    socket.on('kitchen:queue-updated', refreshInventory);

    return () => {
      socket.off('inventory:updated', refreshInventory);
      socket.off('kitchen:queue-updated', refreshInventory);
    };
  }, [queryClient]);

  const criticalItems: CriticalItem[] = useMemo(
    () =>
      lowStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        estRunout: 'Soon',
        quantity: `${item.currentStock} ${item.unit}`,
        image:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80',
      })),
    [lowStockItems],
  );

  const stockCards: StockCard[] = useMemo(
    () =>
      inventoryItems.map((item, index) => ({
        id: item.id,
        name: item.name,
        location: ['WALK-IN 1', 'PREP FRIDGE', 'DRY PANTRY'][index % 3],
        quantity: `${item.currentStock} ${item.unit}`,
        status: item.isLow ? 'Reorder' : 'Optimal',
        image:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
      })),
    [inventoryItems],
  );

  const locations = ['All', 'WALK-IN 1', 'PREP FRIDGE', 'SAFE', 'DRY PANTRY'];

  const filteredStock = stockCards.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = selectedLocation === 'All' || c.location === selectedLocation;
    return matchesQuery && matchesLoc;
  });

  const totalStockUnits = inventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  const reorderCount = inventoryItems.filter((item) => item.isLow).length;

  return (
    <div className="flex h-screen w-full bg-[#f6f7fb] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold border border-slate-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredients, batches, or SKU..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Header Title + Action Button */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                  Stock Intelligence
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> FIFO Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Real-time inventory levels, dynamic burn rates, and automated procurement tracking.
              </p>
            </div>
            <button
              onClick={() => setIsPOOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>

          {/* Section 1: Critical Low & Metric Cards */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Critical Low (5 Cols) */}
            <div className="col-span-5 bg-gradient-to-br from-rose-50/90 to-red-50/50 rounded-2xl p-5 border border-rose-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-rose-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <h2 className="font-serif text-lg font-bold text-rose-950">Critical Low Stock</h2>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-200">
                    {criticalItems.length} Urgent
                  </span>
                </div>

                <div className="space-y-2.5 mt-3.5">
                  {criticalItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/95 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-rose-100 shadow-sm hover:border-rose-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-100"
                        />
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-900 tracking-wider">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-rose-500" />
                            Est. runout:{' '}
                            <span className="font-semibold text-rose-700">{item.estRunout}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-serif text-base font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsExpediteOpen(true)}
                className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Expedite Emergency Order</span>
              </button>
            </div>

            {/* Metric Cards (7 Cols) */}
            <div className="col-span-7 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Inventory Value
                  </span>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-slate-900 leading-none">
                    {Math.round(totalStockUnits).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+3.2% vs last delivery</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Weekly Waste Variance
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-slate-900 leading-none">
                    2.4%
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
                    <span className="text-emerald-700 font-semibold">Under target</span> (&lt; 3.0% standard)
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tracked Ingredients
                  </span>
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-slate-900 leading-none">
                    {inventoryItems.length} <span className="text-sm font-sans font-semibold text-slate-400">SKUs</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{reorderCount} items need reorder</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                    Next Delivery
                  </span>
                  <Clock className="w-4 h-4 text-white/90" />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold leading-tight">
                    Tomorrow, 06:30
                  </div>
                  <p className="text-xs text-amber-100 mt-1 font-medium">
                    Seafood & Dairy replenishment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Full Stock Items Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Key Tracked Ingredients
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  ({filteredStock.length} items)
                </span>
              </div>

              {/* Location Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location: {selectedLocation}</span>
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-20 space-y-1">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                          selectedLocation === loc
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {filteredStock.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase tracking-wider border border-white/10">
                      {card.location}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-serif text-sm font-bold text-slate-900 truncate">
                      {card.name}
                    </h3>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-sm font-bold text-slate-800">{card.quantity}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          card.status === 'Optimal'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                            : 'bg-rose-50 text-rose-600 border-rose-200/70'
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL OVERLAYS (Import từ file độc lập) */}
      <PurchaseOrderModal
        isOpen={isPOOpen}
        onClose={() => setIsPOOpen(false)}
        inventoryItems={lowStockItems.length > 0 ? lowStockItems : inventoryItems}
        onSubmit={async (payload) => {
          const receipt = await createReceiptMutation.mutateAsync(payload);
          return receipt.receiptCode;
        }}
        onSubmitSuccess={(poNum) => triggerToast(`Purchase Order ${poNum} dispatched to supplier!`)}
      />

      <ExpediteOrderModal
        isOpen={isExpediteOpen}
        onClose={() => setIsExpediteOpen(false)}
        onConfirm={() => triggerToast('Emergency priority dispatched via Direct Express!')}
      />
    </div>
  );
};

export default ChefInventory;
