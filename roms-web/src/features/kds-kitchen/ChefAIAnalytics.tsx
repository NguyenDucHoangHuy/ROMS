import React from 'react';
import ChefSidebar from './ChefSidebar';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Users,
  Utensils,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  Recycle,
  Package,
} from 'lucide-react';

interface ForecastItem {
  id: string;
  name: string;
  range: string;
  confidence: string;
  trend: string;
  image: string;
}

export const ChefAIAnalytics: React.FC = () => {
  const forecastItems: ForecastItem[] = [
    {
      id: 'f-1',
      name: 'Wagyu Ribeye',
      range: '45-50',
      confidence: 'High confidence',
      trend: 'Trending up',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'f-2',
      name: 'Pan-Seared Scallops',
      range: '30-35',
      confidence: 'Medium confidence',
      trend: 'Stable',
      image:
        'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'f-3',
      name: 'Truffle Risotto',
      range: '20-25',
      confidence: 'Low confidence',
      trend: 'Weather dependent',
      image:
        'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=200&auto=format&fit=crop&q=80',
    },
  ];

  // Ma trận Heatmap: Màu sắc đại diện cho độ tải (0: rất thấp -> 4: cực cao)
  const heatmapData = [
    { station: 'Grill', values: [1, 2, 4, 5, 3, 1] },
    { station: 'Sauté', values: [0, 2, 5, 5, 2, 0] },
    { station: 'Garde Manger', values: [3, 4, 2, 1, 0, 0] },
    { station: 'Pastry', values: [0, 1, 1, 2, 4, 5] },
  ];

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 5:
        return 'bg-[#70420d]'; // Quá tải (Nâu đậm nhất)
      case 4:
        return 'bg-[#8b5a19]';
      case 3:
        return 'bg-[#b6894c]';
      case 2:
        return 'bg-[#d8be98]';
      case 1:
        return 'bg-[#ede5d8]';
      default:
        return 'bg-[#f7f5f0]'; // Thấp nhất
    }
  };

  const hours = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

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
          {/* Header Title */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
              Kitchen Intelligence
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Predictive insights and operational forecasts tailored for executive culinary
              management.
            </p>
          </div>

          {/* Main Grid: Left Column (8 Cols) + Right Column (4 Cols) */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Top KPIs + Heatmap + Actionable Insights (8 Cols) */}
            <div className="col-span-8 space-y-6">
              {/* Top 3 KPI Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Est Covers */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Est. Covers
                    </span>
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-serif font-bold text-slate-900">284</span>
                    <p className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+12% vs last Friday</span>
                    </p>
                  </div>
                </div>

                {/* Prep Load */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Prep Load
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#fcedea] text-red-700 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-serif font-bold text-slate-900">High</span>
                    <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Peak at 19:30</span>
                    </p>
                  </div>
                </div>

                {/* Waste Risk */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Waste Risk
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Recycle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-serif font-bold text-slate-900">4.2%</span>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      ↘ Below average
                    </p>
                  </div>
                </div>
              </div>

              {/* Kitchen Workload Heatmap */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900 leading-tight">
                      Kitchen Workload Heatmap
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Projected station stress levels for tonight's service.
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tonight</span>
                  </button>
                </div>

                {/* Heatmap Grid */}
                <div className="space-y-2 pt-2">
                  {heatmapData.map((row) => (
                    <div key={row.station} className="flex items-center gap-3">
                      <span className="w-24 text-xs font-semibold text-slate-600 truncate">
                        {row.station}
                      </span>
                      <div className="flex-1 grid grid-cols-6 gap-2">
                        {row.values.map((val, idx) => (
                          <div
                            key={idx}
                            className={`h-10 rounded-xl transition ${getHeatmapColor(val)}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Hours axis */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="w-24"></span>
                    <div className="flex-1 grid grid-cols-6 gap-2 text-center">
                      {hours.map((h) => (
                        <span key={h} className="text-[10px] font-semibold text-slate-400">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h2 className="font-serif text-xl font-bold text-slate-900">
                    Actionable Insights
                  </h2>
                </div>

                {/* Staffing Optimization */}
                <div className="bg-[#f7f6f2] border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ede9df] text-amber-900 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Staffing Optimization
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-lg">
                        Model predicts a 30% surge in grill orders between 19:00 and 20:30 due to
                        local event. Recommend scheduling a floater to support the Grill station.
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shrink-0 shadow-sm transition">
                    Review Roster
                  </button>
                </div>

                {/* Waste Reduction */}
                <div className="bg-[#f7f6f2] border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ede9df] text-slate-700 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Waste Reduction: Sea Bass
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-lg">
                        Historical data indicates lower demand for seafood on rainy Tuesdays.
                        Suggest reducing prep quantity of Chilean Sea Bass by 15% to minimize
                        potential spoilage.
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shrink-0 shadow-sm transition">
                    Adjust Prep
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Demand Forecast & Model Accuracy (4 Cols) */}
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                    Demand Forecast
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Predicted volume for signature items based on weather, bookings, and
                    historical trends.
                  </p>
                </div>

                {/* Forecast List */}
                <div className="space-y-4 pt-1">
                  {forecastItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <span className="text-xs font-bold font-serif text-slate-900">
                              {item.range}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.confidence} • {item.trend}
                          </p>
                          {/* Progress Line */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-[#8b5a19] h-full w-3/4 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Model Accuracy Gauge */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Model Accuracy
                    </span>
                    <span className="text-2xl font-serif font-bold text-slate-900">94.2%</span>
                  </div>
                  {/* Circular Accuracy Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#8b5a19] border-r-[#8b5a19] -rotate-45"></div>
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

export default ChefAIAnalytics;