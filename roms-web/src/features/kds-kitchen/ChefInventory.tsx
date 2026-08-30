import React, { useState } from 'react';
import ChefSidebar from './ChefSidebar';
import {
  Search,
  Bell,
  SlidersHorizontal,
  ShoppingCart,
  AlertTriangle,
//   Flame,
//   ShieldCheck,
//   TrendingDown,
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
  const [activeZone, setActiveZone] = useState<'Proteins' | 'Pantry' | 'Perishables'>('Proteins');

  const criticalItems: CriticalItem[] = [
    {
      id: 'c-1',
      name: 'A5 WAGYU STRIPLOIN',
      estRunout: 'Tonight',
      quantity: '1.2kg',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-2',
      name: 'PERIGORD TRUFFLES',
      estRunout: 'Tomorrow',
      quantity: '45g',
      image:
        'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const stockCards: StockCard[] = [
    {
      id: 's-1',
      name: 'Diver Scallops',
      location: 'WALK-IN 1',
      quantity: '12 kg',
      status: 'Optimal',
      image:
        'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 's-2',
      name: 'Heirloom Tomatoes',
      location: 'PREP FRIDGE',
      quantity: '4 kg',
      status: 'Reorder',
      image:
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 's-3',
      name: 'Beluga Caviar',
      location: 'SAFE',
      quantity: '250 g',
      status: 'Optimal',
      image:
        'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
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

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {/* Header Title + Action Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                Stock Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Real-time inventory analysis and automated replenishment tracking across all storage
                zones.
              </p>
            </div>
            <button className="flex items-center gap-2.5 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-2xl shadow-sm transition">
              <ShoppingCart className="w-4 h-4" />
              <span>New Purchase Order</span>
            </button>
          </div>

          {/* Upper Grid: Critical Low + Storage Zones */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Card: Critical Low (4 Cols) */}
            <div className="col-span-4 bg-gradient-to-b from-[#fcedea] to-[#fae5e1] rounded-3xl p-6 border border-red-200/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4">
                  <h2 className="font-serif text-2xl font-bold text-red-900">Critical Low</h2>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>

                <div className="space-y-3">
                  {criticalItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 flex items-center justify-between border border-red-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-[11px] font-extrabold text-red-900 tracking-wider">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Est. runout:{' '}
                            <span className="font-semibold text-slate-700">{item.estRunout}</span>
                          </p>
                        </div>
                      </div>
                      <span className="font-serif text-lg font-bold text-red-600">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-5 py-3 bg-[#a12020] hover:bg-[#881717] text-white text-xs font-bold rounded-2xl shadow-md transition">
                Expedite Order
              </button>
            </div>

            {/* Right Card: Storage Zones Concentric Rings (8 Cols) */}
            <div className="col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-slate-900">Storage Zones</h2>
                <div className="flex items-center gap-1 bg-[#edece8] p-1 rounded-2xl">
                  {(['Proteins', 'Pantry', 'Perishables'] as const).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setActiveZone(zone)}
                      className={`px-4 py-1 rounded-xl text-xs font-semibold transition ${
                        activeZone === zone
                          ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concentric Circle Visualizer */}
              <div className="relative py-4 flex items-center justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Outer Ring - Perishables */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-[#5a5751]"></div>

                  {/* Middle Ring - Proteins */}
                  <div className="absolute inset-5 rounded-full border-[10px] border-[#8b5a19]"></div>

                  {/* Inner Ring - Total Capacity */}
                  <div className="absolute inset-10 rounded-full border-[10px] border-[#c49a45] flex flex-col items-center justify-center text-center bg-white shadow-inner">
                    <span className="text-3xl font-serif font-bold text-slate-900 leading-none">
                      82%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Total Capacity
                    </span>
                  </div>

                  {/* Ring Labels Overlay */}
                  <div className="absolute -top-1 left-2 text-left">
                    <span className="text-sm font-serif font-bold text-slate-800">80%</span>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">
                      PROTEINS
                    </span>
                  </div>

                  <div className="absolute bottom-2 -right-4 text-left">
                    <span className="text-sm font-serif font-bold text-slate-800">28%</span>
                    <span className="block text-[8px] font-bold text-slate-400 tracking-wider">
                      PERISHABLES
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                Optimal warehouse threshold maintained at 75–85% overall fill.
              </div>
            </div>
          </div>

          {/* Lower Grid: Waste Mitigation + Stock Item Cards */}
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Waste Mitigation Box (3 Cols) */}
            <div className="col-span-3 bg-[#edece8] rounded-3xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Waste Mitigation
                </span>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-serif font-bold text-[#8b5a19]">2.4%</span>
                  <span className="text-xs text-slate-600 font-medium leading-tight">
                    Total variance this week
                  </span>
                </div>
                <div className="w-16 h-1 bg-[#8b5a19] rounded-full mt-2"></div>
              </div>

              <div className="pt-4 border-t border-slate-300/60">
                <span className="text-xs font-semibold text-slate-600">Target: &lt; 3.0%</span>
              </div>
            </div>

            {/* Item Stock Cards (9 Cols - 3 items) */}
            <div className="col-span-9 grid grid-cols-3 gap-5">
              {stockCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {card.location}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-serif text-base font-bold text-slate-900 leading-snug">
                      {card.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-sm font-semibold text-slate-600">{card.quantity}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          card.status === 'Optimal'
                            ? 'bg-[#f4efe6] text-amber-900'
                            : 'bg-red-50 text-red-600 border border-red-100'
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
    </div>
  );
};

export default ChefInventory;