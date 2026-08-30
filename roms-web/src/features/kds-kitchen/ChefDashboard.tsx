import React from 'react';
import ChefSidebar from './ChefSidebar';
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
} from 'lucide-react';

export const ChefDashboard: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR TÁCH RIÊNG */}
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

        {/* Content Body Grid */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
          {/* LEFT & CENTER DASHBOARD CONTENT (8 Cols) */}
          <div className="col-span-8 space-y-7">
            {/* Service Overview & KPI Header */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Service Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Friday Evening Service — Peak Hours</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#edece8] px-5 py-3 rounded-2xl text-center min-w-[100px]">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Avg Ticket Time
                  </span>
                  <span className="text-2xl font-serif font-bold text-slate-900">14m</span>
                </div>
                <div className="bg-[#8b5a19] text-white px-5 py-3 rounded-2xl text-center min-w-[100px] shadow-sm">
                  <span className="block text-[10px] font-bold text-amber-200/80 uppercase tracking-wider">
                    Active Tickets
                  </span>
                  <span className="text-2xl font-serif font-bold">42</span>
                </div>
              </div>
            </div>

            {/* Station Load Cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Grill Station */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-red-50 text-red-600 rounded-full">
                    High Load
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-800">Grill Station</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">12 active items</span> • 4 pending
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-4/5 rounded-full"></div>
                </div>
              </div>

              {/* Sauté Station */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Soup className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full">
                    Moderate
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-800">Sauté Station</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">8 active items</span> • 2 pending
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full w-1/2 rounded-full"></div>
                </div>
              </div>

              {/* Prep Station */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">
                    Normal
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-800">Prep Station</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">5 active items</span> • 8 pending
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full w-1/4 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Critical Alerts Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="font-serif text-xl font-bold text-slate-800">Critical Alerts</h2>
              </div>

              {/* Overdue Alert */}
              <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-900 leading-tight">
                      Table 12 — Overdue
                    </h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Mains pending for 28 mins. Waiting on Grill.
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#8b1818] hover:bg-[#721313] text-white text-xs font-semibold rounded-xl shadow transition">
                  Expedite
                </button>
              </div>

              {/* Low Stock Alert */}
              <div className="p-4 bg-[#f2f2f0] border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                      Low Stock Alert
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Truffle oil dropping below threshold (2 bottles left).
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition">
                  Reorder
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: EXPEDITOR LIVE COLUMN (4 Cols) */}
          <div className="col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col h-full max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <h2 className="font-serif text-2xl font-bold text-slate-800 leading-none">
                Expeditor Live
              </h2>
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                LIVE
              </span>
            </div>

            {/* Ticket Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
              {/* Ticket #1042 - Urgent */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-red-600 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Ticket #1042</span>
                  <span className="text-xs font-bold text-red-600">18m</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Table 08</h3>

                {/* Items */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">2x Wagyu Ribeye</p>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        MR (Medium Rare)
                      </span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">1x Truffle Risotto</p>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">1x Lobster Thermidor</p>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>

                {/* Allergy Box */}
                <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-700">
                  Allergy: Shellfish (Guest 3 only)
                </div>
              </div>

              {/* Ticket #1043 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-amber-600 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Ticket #1043</span>
                  <span className="text-xs font-bold text-slate-500">8m</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Table 14</h3>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-800">4x Chef's Tasting Menu</p>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>

              {/* Ticket #1044 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-slate-400 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Ticket #1044</span>
                  <span className="text-xs font-bold text-slate-500">2m</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Bar 02</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">1x Charcuterie Board</p>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">1x Oysters (Half Dozen)</p>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChefDashboard;