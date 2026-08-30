import React, { useState } from 'react';
import ChefSidebar from './ChefSidebar';
import {
  Search,
  Bell,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Eye,
  Plus,
  Minus,
  Megaphone,
  PackageX,
} from 'lucide-react';

interface DishItem {
  id: string;
  name: string;
  description: string;
  price: number;
  margin: number;
  prepTime: number;
  isAvailable: boolean;
  category: string;
  isSignature?: boolean;
  isLowStock?: boolean;
  lowStockWarning?: string;
  outOfStockReason?: string;
  image: string;
}

const INITIAL_DISHES: DishItem[] = [
  {
    id: 'dish-1',
    name: 'Pan-Seared Hokkaido Scallops',
    description: 'English pea purée, pancetta crisp, yuzu beurre',
    price: 42,
    margin: 68,
    prepTime: 12,
    isAvailable: true,
    category: 'Signatures',
    isSignature: true,
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-2',
    name: 'Wild Mushroom Risotto',
    description: 'Warning: Truffle inventory critical (approx. 4 portions left).',
    price: 38,
    margin: 55,
    prepTime: 22,
    isAvailable: true,
    category: 'Signatures',
    isLowStock: true,
    lowStockWarning: 'Warning: Truffle inventory critical (approx. 4 portions left).',
    image:
      'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'dish-3',
    name: 'Dry-Aged Bone-In Ribeye',
    description: 'Out of stock: Premium Ribeye Cut.',
    price: 85,
    margin: 60,
    prepTime: 35,
    isAvailable: false,
    category: 'Signatures',
    outOfStockReason: 'Out of stock: Premium Ribeye Cut.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
  },
];

export const ChefMenuManagement: React.FC = () => {
  const [dishes, setDishes] = useState<DishItem[]>(INITIAL_DISHES);
  const [selectedCategory, setSelectedCategory] = useState<string>('Signatures');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { name: 'Signatures', count: 12 },
    { name: 'Appetizers', count: 8 },
    { name: 'Mains', count: 14 },
    { name: 'Desserts', count: 5 },
  ];

  // Toggle Bật/Tắt món (86'd status)
  const handleToggleAvailable = (id: string) => {
    setDishes((prev) =>
      prev.map((dish) =>
        dish.id === id ? { ...dish, isAvailable: !dish.isAvailable } : dish
      )
    );
  };

  // Tăng giảm thời gian Est. Prep Time
  const handleAdjustPrepTime = (id: string, delta: number) => {
    setDishes((prev) =>
      prev.map((dish) =>
        dish.id === id
          ? { ...dish, prepTime: Math.max(1, dish.prepTime + delta) }
          : dish
      )
    );
  };

  const count86 = dishes.filter((d) => !d.isAvailable).length;

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN CONTENT AREA */}
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
        <div className="flex-1 p-8 overflow-y-auto space-y-7">
          {/* Header Title & Service Stats */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">Service Menu</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Manage tonight's offerings, adjust prep times, and update ingredient availability in
                real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Items 86'd Stat Card */}
              <div className="bg-[#f4f2ee] border-l-4 border-l-amber-700 px-5 py-3 rounded-2xl min-w-[150px]">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Items 86'd Tonight
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-serif font-bold text-red-600">
                    {count86 + 2}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ 42 total</span>
                </div>
              </div>

              {/* Avg Ticket Time Stat Card */}
              <div className="bg-[#edece8] px-5 py-3 rounded-2xl min-w-[150px]">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Avg Ticket Time
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-serif font-bold text-slate-900">18m</span>
                  <span className="text-xs font-semibold text-amber-800">+2m vs avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Left Column (Categories & Note) + Right Column (Dishes List) */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Categories & Chef's Note (3 Cols) */}
            <div className="col-span-3 space-y-6">
              {/* Categories Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                <h3 className="font-serif text-lg font-bold text-slate-900 px-2 py-1">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}

                  {/* 86'd Quick Filter */}
                  <button
                    onClick={() => setSelectedCategory("86'D")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      selectedCategory === "86'D"
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'text-red-600 hover:bg-red-50/50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Currently 86'd</span>
                  </button>
                </nav>
              </div>

              {/* Chef's Note Box */}
              <div className="bg-[#edece8] rounded-2xl p-5 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900">
                  <Megaphone className="w-4 h-4 text-amber-800" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
                    Chef's Note
                  </span>
                </div>
                <p className="text-xs italic text-slate-600 leading-relaxed">
                  "Truffle supplier delayed. Conserve shavings on the risotto. Recommend pushing the
                  Sea Bass tonight."
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Dish List (9 Cols) */}
            <div className="col-span-9 space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sort: Popularity</span>
                  </button>
                </div>

                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find dish..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dish Items Stack */}
              <div className="space-y-3">
                {dishes.map((dish) => {
                  return (
                    <div
                      key={dish.id}
                      className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden flex ${
                        !dish.isAvailable
                          ? 'border-slate-200 opacity-70 bg-slate-50/50'
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {/* Dish Thumbnail */}
                      <div className="relative w-44 h-36 shrink-0 bg-slate-100 overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className={`w-full h-full object-cover ${
                            !dish.isAvailable ? 'grayscale' : ''
                          }`}
                        />
                        {dish.isSignature && dish.isAvailable && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-800/90 text-white text-[10px] font-bold rounded">
                            Signature
                          </span>
                        )}
                        {dish.isLowStock && dish.isAvailable && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 text-white text-[10px] font-semibold rounded flex items-center gap-1">
                            <PackageX className="w-3 h-3 text-amber-400" />
                            Low Stock
                          </span>
                        )}
                        {!dish.isAvailable && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow">
                              86'D
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dish Details */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        {/* Top: Name & Price */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-serif text-lg font-bold ${
                                  dish.isAvailable ? 'text-slate-900' : 'text-slate-500 line-through'
                                }`}
                              >
                                {dish.name}
                              </h3>
                              {dish.isLowStock && (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${
                                dish.isLowStock
                                  ? 'text-amber-800 font-medium'
                                  : !dish.isAvailable
                                  ? 'text-red-500 font-medium'
                                  : 'text-slate-500'
                              }`}
                            >
                              {dish.description}
                            </p>
                          </div>

                          {/* Price & Margin Tag */}
                          <div className="text-right">
                            <span
                              className={`text-lg font-serif font-bold ${
                                dish.isAvailable ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              ${dish.price}
                            </span>
                            {dish.isAvailable && (
                              <div className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                Margin: {dish.margin}%
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom: Prep Time, Recipe Link & Toggle Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-6">
                            {/* Prep Time Adjuster */}
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Est. Prep Time
                              </span>
                              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                <button
                                  disabled={!dish.isAvailable}
                                  onClick={() => handleAdjustPrepTime(dish.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-800">
                                  {dish.prepTime}m
                                </span>
                                <button
                                  disabled={!dish.isAvailable}
                                  onClick={() => handleAdjustPrepTime(dish.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* View Recipe */}
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Components
                              </span>
                              <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-700">
                                <span>View Recipe</span>
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Availability Toggle Switch */}
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`text-xs font-bold ${
                                dish.isAvailable ? 'text-slate-700' : 'text-red-500'
                              }`}
                            >
                              {dish.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleAvailable(dish.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                dish.isAvailable ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  dish.isAvailable ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              <div className="pt-2 text-center">
                <button className="px-6 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition">
                  Load More Items
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChefMenuManagement;