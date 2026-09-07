import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ChefSidebar from './ChefSidebar';
import RecipeSpecDrawer, { type RecipeData } from './RecipeSpecDrawer';
import { queryKeys } from '@/constants/queryKeys';
import { getSocket } from '@/lib/socket';
import { menuService } from '@/services/modules/menuService';
import type { MenuItem } from '@/types/menu.types';
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
  Sparkles,
  Clock,
  CheckCircle2,
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
  // Dữ liệu công thức cho từng món
  recipeSpec?: RecipeData;
}

const SAMPLE_DISHES: DishItem[] = [
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
    recipeSpec: {
      name: 'Pan-Seared Hokkaido Scallops',
      category: 'Signatures',
      prepTime: 12,
      station: 'Grill / Sauté',
      image:
        'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        { name: 'U-10 Hokkaido Fresh Scallops', amount: '3 pcs (140g)' },
        { name: 'English Sweet Pea Purée', amount: '45 ml' },
        { name: 'Crisp Pancetta Tuile', amount: '1 strip' },
        { name: 'Yuzu Beurre Blanc Reduction', amount: '20 ml' },
      ],
      allergens: ['Molluscs (Scallop)', 'Dairy (Beurre blanc)', 'Pork (Pancetta)'],
      steps: [
        'Cast iron skillet must reach 210°C before applying clarified butter.',
        'Sear presentation side hard for 90 seconds until a deep caramel crust forms.',
        'Never crowd the skillet; flip once and baste with cold thyme-infused butter.',
      ],
    },
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
    recipeSpec: {
      name: 'Wild Mushroom Risotto',
      category: 'Signatures',
      prepTime: 22,
      station: 'Sauté',
      image:
        'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        { name: 'Acquerello Carnaroli Rice', amount: '90g' },
        { name: 'Chanterelle & Porcini Stock', amount: '250 ml' },
        { name: 'Parmigiano-Reggiano 24M', amount: '25g' },
        { name: 'Fresh Perigord Black Truffle', amount: '3g shavings' },
      ],
      allergens: ['Dairy (Parmesan & Butter)', 'Alliums (Shallots)'],
      steps: [
        'Toast rice dry until grain edges turn translucent before deglazing with white wine.',
        'Incorporate simmering stock ladle-by-ladle with continuous emulsion agitation.',
        'Rest off-flame for 90 seconds prior to mantecatura with cold cubed butter.',
      ],
    },
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
    recipeSpec: {
      name: 'Dry-Aged Bone-In Ribeye',
      category: 'Signatures',
      prepTime: 35,
      station: 'Grill',
      image:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        { name: '45-Day Dry Aged Ribeye (Bone-In)', amount: '650g' },
        { name: 'Maldon Flaky Sea Salt', amount: '5g' },
        { name: 'Bone Marrow Jus Reduction', amount: '60 ml' },
      ],
      allergens: ['Dairy (Finishing butter)'],
      steps: [
        'Temper steak at room ambient temperature for at least 30 minutes before firing.',
        'Hard sear on open hardwood embers; transfer to indirect heat zone to hit target temp.',
        'Rest for 8 minutes on a warm rack to allow juices to redistribute before carving.',
      ],
    },
  },
];

function mapMenuItemToDish(item: MenuItem, prepTimeOverride?: number): DishItem {
  const prepTime = prepTimeOverride ?? item.preparationTime ?? 12;
  const fallbackImage =
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80';

  return {
    id: item.id,
    name: item.name,
    description:
      item.lowStockWarning ??
      item.description ??
      'Standard kitchen menu item.',
    price: item.price,
    margin: item.margin ?? 0,
    prepTime,
    isAvailable: item.isAvailable,
    category: item.category.name,
    isSignature: item.isRecommendable,
    isLowStock: item.isLowStock,
    lowStockWarning: item.lowStockWarning ?? undefined,
    outOfStockReason: item.isAvailable ? undefined : 'Marked unavailable by kitchen.',
    image: item.imageUrl ?? fallbackImage,
    recipeSpec: {
      name: item.name,
      category: item.category.name,
      prepTime,
      station: item.category.name,
      image: item.imageUrl ?? fallbackImage,
      ingredients:
        item.recipes?.map((recipe) => ({
          name: recipe.itemName,
          amount: `${recipe.quantityRequired} ${recipe.unit}`,
        })) ?? [],
      allergens: [],
      steps: [
        'Review ticket notes before firing.',
        'Prepare according to standard kitchen specification.',
        'Send to pass only after quality check.',
      ],
    },
  };
}

export const ChefMenuManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [prepTimeOverrides, setPrepTimeOverrides] = useState<Record<string, number>>({});

  // Quản lý Drawer công thức
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: menuItems = [] } = useQuery({
    queryKey: queryKeys.menu.all(),
    queryFn: menuService.getAll,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('kitchen:join');

    const refreshMenu = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() });
    };

    socket.on('menu:item-updated', refreshMenu);

    return () => {
      socket.off('menu:item-updated', refreshMenu);
    };
  }, [queryClient]);

  const availabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuService.toggleAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.kitchenQueue() });
    },
  });

  const dishes = useMemo(() => {
    if (menuItems.length === 0) {
      return SAMPLE_DISHES;
    }

    return menuItems.map((item) => mapMenuItemToDish(item, prepTimeOverrides[item.id]));
  }, [menuItems, prepTimeOverrides]);

  const categories = useMemo(() => {
    const counts = dishes.reduce<Record<string, number>>((acc, dish) => {
      acc[dish.category] = (acc[dish.category] ?? 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'All', count: dishes.length },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ];
  }, [dishes]);

  const handleToggleAvailable = (id: string) => {
    const dish = dishes.find((item) => item.id === id);
    if (!dish) return;

    if (menuItems.length === 0) return;
    availabilityMutation.mutate({ id, isAvailable: !dish.isAvailable });
  };

  const handleAdjustPrepTime = (id: string, delta: number) => {
    const dish = dishes.find((item) => item.id === id);
    if (!dish) return;

    setPrepTimeOverrides((current) => ({
      ...current,
      [id]: Math.max(1, dish.prepTime + delta),
    }));
  };

  const handleOpenRecipe = (dish: DishItem) => {
    if (dish.recipeSpec) {
      setSelectedRecipe(dish.recipeSpec);
      setIsDrawerOpen(true);
    }
  };

  const count86 = dishes.filter((d) => !d.isAvailable).length;
  const visibleDishes = dishes.filter((dish) => {
    const categoryMatch =
      selectedCategory === 'All' ||
      (selectedCategory === "86'D" ? !dish.isAvailable : dish.category === selectedCategory);
    const queryMatch =
      !searchQuery.trim() ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && queryMatch;
  });

  return (
    <div className="flex h-screen w-full bg-[#f6f7fb] text-slate-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <ChefSidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search recipes, ingredients, or stock..."
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

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto space-y-7">
          {/* Header Title & Service Stats */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                  Service Menu
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Kitchen Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Manage tonight's active menu, adjust estimated prep times, and mark 86'd items in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white border border-rose-100 shadow-sm px-5 py-3 rounded-2xl min-w-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    86'd Tonight
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-serif font-bold text-rose-600">
                    {count86}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ {dishes.length} items</span>
                </div>
              </div>

              <div className="bg-white border border-amber-100/80 shadow-sm px-5 py-3 rounded-2xl min-w-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Avg Prep Time
                  </span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-serif font-bold text-slate-900">18m</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                    +2m peak
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Categories & Notice (3 Cols) */}
            <div className="col-span-3 space-y-5">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1.5">
                <h3 className="font-serif text-sm font-bold text-slate-900 px-3 py-1 uppercase tracking-wider text-[11px]">
                  Course Categories
                </h3>
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-600/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}

                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedCategory("86'D")}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedCategory === "86'D"
                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                          : 'border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Currently 86'd</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200/60 text-rose-800 font-bold">
                        {count86}
                      </span>
                    </button>
                  </div>
                </nav>
              </div>

              {/* Chef's Note Box */}
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 rounded-2xl p-4 border border-amber-200/80 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900">
                  <div className="p-1.5 bg-amber-100/80 rounded-lg text-amber-800">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900">
                    Chef's Daily Notice
                  </span>
                </div>
                <p className="text-xs text-amber-950/80 leading-relaxed font-serif italic bg-white/70 p-3 rounded-xl border border-amber-100">
                  "Truffle supplier delayed until 9:00 PM. Conserve shavings on the risotto. Recommend front-of-house push the
                  Sea Bass tonight."
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Dish List (9 Cols) */}
            <div className="col-span-9 space-y-4">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/70 transition">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/70 transition">
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
                    placeholder="Quick search dishes..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Stack Dish Items */}
              <div className="space-y-3">
                {visibleDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex ${
                      !dish.isAvailable
                        ? 'border-slate-200/80 bg-slate-50/70'
                        : 'border-slate-200/80 hover:border-amber-300 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-44 h-36 shrink-0 bg-slate-100 overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className={`w-full h-full object-cover transition duration-300 ${
                          !dish.isAvailable ? 'grayscale opacity-75' : ''
                        }`}
                      />
                      {dish.isSignature && dish.isAvailable && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Signature
                        </span>
                      )}
                      {dish.isLowStock && dish.isAvailable && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold rounded-md flex items-center gap-1 border border-white/10 shadow">
                          <PackageX className="w-3 h-3 text-amber-400" /> Low Stock
                        </span>
                      )}
                      {!dish.isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg tracking-wider border border-rose-400">
                            86'D
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-serif text-base font-bold tracking-tight ${
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
                                ? 'text-rose-600 font-medium'
                                : 'text-slate-500'
                            }`}
                          >
                            {dish.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-lg font-serif font-bold ${
                              dish.isAvailable ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            ${dish.price}
                          </span>
                          {dish.isAvailable && (
                            <div className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Margin: {dish.margin}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-6">
                          {/* Prep Time Adjuster */}
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Est. Prep Time
                            </span>
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/70">
                              <button
                                disabled={!dish.isAvailable}
                                onClick={() => handleAdjustPrepTime(dish.id, -1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-slate-800">
                                {dish.prepTime}m
                              </span>
                              <button
                                disabled={!dish.isAvailable}
                                onClick={() => handleAdjustPrepTime(dish.id, 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Trigger mở Recipe Drawer */}
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Specification
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenRecipe(dish)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition hover:underline"
                            >
                              <span>Recipe Sheet</span>
                              <Eye className="w-3 h-3 text-amber-600" />
                            </button>
                          </div>
                        </div>

                        {/* Availability Toggle Switch */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold flex items-center gap-1 ${
                              dish.isAvailable ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {dish.isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Available
                              </>
                            ) : (
                              <>
                                <PackageX className="w-3 h-3 text-rose-500" />
                                86'd
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailable(dish.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              dish.isAvailable
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                                : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                dish.isAvailable ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="pt-2 text-center">
                <button className="px-6 py-2 border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition">
                  Load More Dishes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY DRAWER: RECIPE SPECIFICATION */}
      <RecipeSpecDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recipe={selectedRecipe}
      />
    </div>
  );
};

export default ChefMenuManagement;
