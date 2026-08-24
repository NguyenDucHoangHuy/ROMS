import React, { useMemo, useState } from "react";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileDown,
  HelpCircle,
  History,
  MoreHorizontal,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface KPIData {
  label: string;
  value: string;
  subtext: string;
  trend?: "positive" | "negative" | "neutral";
  highlighted?: boolean;
}

export interface SalesCategory {
  name: string;
  percentage: number;
  revenue: string;
  tone: "orange" | "blue" | "slate";
}

export interface TopItem {
  rank: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface PaymentBreakdown {
  name: string;
  amount: string;
  icon: React.ElementType;
}

export interface InventoryAlert {
  name: string;
  status: "OUT OF STOCK" | "LOW STOCK (<5)";
  severity: "danger" | "warning";
}

export interface ShiftSummary {
  staffName: string;
  role: string;
  shiftTime: string;
  totalSales: string;
  status: "Closed" | "Open";
}

/* =========================================================
 * MOCK DATA
 * ========================================================= */

const KPI_DATA: KPIData[] = [
  {
    label: "Gross Revenue",
    value: "₫ 45.2M",
    subtext: "↗ +5.2% vs yesterday",
    trend: "positive",
  },
  {
    label: "Discounts / Refunds",
    value: "₫ -1.8M",
    subtext: "4 refunds today",
    trend: "negative",
  },
  {
    label: "Net Revenue",
    value: "₫ 43.4M",
    subtext: "Total realized",
    trend: "neutral",
    highlighted: true,
  },
  {
    label: "Total Orders",
    value: "142",
    subtext: "Peak: 12:00 - 14:00",
    trend: "neutral",
  },
  {
    label: "Avg Order Value",
    value: "₫ 305k",
    subtext: "↗ +2% vs yesterday",
    trend: "positive",
  },
];

const SALES_CATEGORIES: SalesCategory[] = [
  {
    name: "Food",
    percentage: 65,
    revenue: "₫ 28.2M",
    tone: "orange",
  },
  {
    name: "Beverages",
    percentage: 25,
    revenue: "₫ 10.8M",
    tone: "blue",
  },
  {
    name: "Others",
    percentage: 10,
    revenue: "₫ 4.4M",
    tone: "slate",
  },
];

const TOP_ITEMS: TopItem[] = [
  {
    rank: 1,
    name: "Special Beef Pho",
    quantity: 45,
    unit: "servings",
  },
  {
    rank: 2,
    name: "Vietnamese Iced Coffee",
    quantity: 38,
    unit: "cups",
  },
  {
    rank: 3,
    name: "Broken Rice with Pork",
    quantity: 32,
    unit: "servings",
  },
  {
    rank: 4,
    name: "Hanoi Grilled Pork Noodles",
    quantity: 28,
    unit: "servings",
  },
  {
    rank: 5,
    name: "Peach Orange Lemongrass Tea",
    quantity: 25,
    unit: "cups",
  },
];

const PAYMENT_METHODS: PaymentBreakdown[] = [
  {
    name: "Credit Card",
    amount: "₫ 18.5M",
    icon: CreditCard,
  },
  {
    name: "QR Pay / MoMo",
    amount: "₫ 15.2M",
    icon: Smartphone,
  },
  {
    name: "Cash",
    amount: "₫ 9.7M",
    icon: WalletCards,
  },
];

const INVENTORY_ALERTS: InventoryAlert[] = [
  {
    name: "Kobe Beef",
    status: "OUT OF STOCK",
    severity: "danger",
  },
  {
    name: "Pasteurized Fresh Milk",
    status: "LOW STOCK (<5)",
    severity: "warning",
  },
];

const SHIFT_SUMMARY: ShiftSummary[] = [
  {
    staffName: "Alex Nguyen",
    role: "Cashier",
    shiftTime: "06:00 - 14:00",
    totalSales: "₫ 18.5M",
    status: "Closed",
  },
  {
    staffName: "Bella Tran",
    role: "Manager",
    shiftTime: "10:00 - 18:00",
    totalSales: "₫ 12.4M",
    status: "Closed",
  },
  {
    staffName: "Michael Le",
    role: "Cashier",
    shiftTime: "14:00 - 22:00",
    totalSales: "₫ 12.5M",
    status: "Open",
  },
];

/* =========================================================
 * LEGACY NAV DATA
 * ========================================================= */

const navItems = [
  {
    label: "Sales",
    icon: ShoppingBag,
  },
  {
    label: "Orders",
    icon: Receipt,
  },
  {
    label: "History",
    icon: History,
    active: true,
  },
  {
    label: "Refunds",
    icon: RotateCcw,
  },
  {
    label: "Settings",
    icon: Settings,
  },
];

/* =========================================================
 * DATE HELPERS
 * ========================================================= */

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getDateDisplay = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/* =========================================================
 * PROGRESS BAR
 * ========================================================= */

const ProgressBar: React.FC<{
  percentage: number;
  tone: SalesCategory["tone"];
}> = ({ percentage, tone }) => {
  const fillClass =
    tone === "orange"
      ? "bg-orange-600"
      : tone === "blue"
        ? "bg-slate-500"
        : "bg-slate-300";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/* =========================================================
 * MAIN COMPONENT
 * ========================================================= */

const EndOfDayReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("2023-10-24");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* =========================================================
   * FILTERED SHIFTS
   * ========================================================= */

  const filteredShifts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return SHIFT_SUMMARY;
    }

    return SHIFT_SUMMARY.filter(
      (shift) =>
        shift.staffName.toLowerCase().includes(query) ||
        shift.role.toLowerCase().includes(query) ||
        shift.shiftTime.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  /* =========================================================
   * HANDLERS
   * ========================================================= */

  const handleRefresh = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    setIsExporting(true);

    window.setTimeout(() => {
      setIsExporting(false);

      const reportData = [
        "BISTRO POS - END OF DAY REPORT",
        `Date: ${formatDate(selectedDate)}`,
        "",
        "Gross Revenue: ₫ 45.2M",
        "Discounts / Refunds: ₫ -1.8M",
        "Net Revenue: ₫ 43.4M",
        "Total Orders: 142",
        "Avg Order Value: ₫ 305k",
        "",
        "Report generated by ROMS POS.",
      ].join("\n");

      const blob = new Blob([reportData], {
        type: "text/plain;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `bistro-pos-end-of-day-${selectedDate}.txt`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    }, 800);
  };

  /* =========================================================
   * RENDER
   * ========================================================= */

  return (
    <div className="h-screen overflow-hidden bg-slate-100/90 text-slate-800">
      <div className="flex h-full min-h-0 w-full">

        {/* ============================================================
            SIDEBAR
        ============================================================ */}

        <CashierSidebar />

        {/* Legacy sidebar - hidden */}
        <aside className="hidden">
          <div className="flex h-[88px] items-center gap-3 border-b border-white/5 px-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-orange-600 shadow-lg">
              <Zap className="h-5 w-5 fill-current" />
            </div>

            <div className="min-w-0">
              <div className="text-[21px] font-extrabold leading-none tracking-tight text-white">
                Bistro POS
              </div>

              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Terminal 01
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`group relative flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-all ${
                      item.active
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.active && (
                      <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-orange-600" />
                    )}

                    <Icon
                      className={`h-[18px] w-[18px] ${
                        item.active
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setShowNewOrder(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-base font-semibold text-white shadow-lg shadow-orange-950/20 transition-all hover:bg-orange-500 active:scale-[0.98]"
            >
              <span className="text-xl leading-none">+</span>
              New Order
            </button>
          </div>

          <div className="border-t border-white/5 px-3 py-3">
            <button
              type="button"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <HelpCircle className="h-[18px] w-[18px]" />
              Support
            </button>
          </div>
        </aside>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* ==========================================================
              TOP HEADER
          ========================================================== */}

          <header className="relative z-20 flex h-[72px] shrink-0 items-center border-b border-slate-200 bg-white px-5 shadow-sm lg:px-7 print:hidden">

            <div className="flex min-w-0 flex-1 items-center gap-5">

              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-bold tracking-tight text-slate-800">
                  Checkout Express
                </h1>

                <div className="mt-0.5 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">/</span>

                  <span className="font-semibold text-orange-600">
                    End of Day Report
                  </span>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-slate-200 xl:block" />

              <div className="relative hidden xl:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search..."
                  className="h-10 w-80 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex shrink-0 items-center gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 active:scale-95"
              >
                <RefreshCw
                  className={`h-[17px] w-[17px] ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>

              {/* NOTIFICATIONS */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications((value) => !value)
                  }
                  title="Notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 active:scale-95"
                >
                  <Bell className="h-[18px] w-[18px]" />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                      <span className="font-bold text-slate-800">
                        Notifications
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setShowNotifications(false)
                        }
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">

                      <div className="font-semibold">
                        2 inventory alerts require attention
                      </div>

                      <div className="mt-1 text-xs text-rose-600">
                        Kobe Beef is out of stock.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE */}

              <button
                type="button"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 ring-2 ring-white"
                title="User profile"
              >
                <UserRound className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* ==========================================================
              SCROLLABLE DASHBOARD
          ========================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-5 py-5 lg:px-7">

              {/* ======================================================
                  DASHBOARD HEADER
              ====================================================== */}

              <section className="mb-4 flex flex-wrap items-center justify-between gap-3">

                {/* DATE PICKER */}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDatePicker((value) => !value)
                    }
                    className="group flex h-10 items-center gap-2 rounded-lg px-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                  >
                    <CalendarDays className="h-4 w-4 text-orange-600" />

                    <span>
                      {getDateDisplay(selectedDate)}
                    </span>

                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
                  </button>

                  {showDatePicker && (
                    <div className="absolute left-0 top-11 z-30 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">

                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Select report date
                      </label>

                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => {
                          setSelectedDate(
                            event.target.value,
                          );

                          setShowDatePicker(false);
                        }}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  )}
                </div>

                {/* REPORT ACTIONS */}

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <Printer className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      Print Report
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="flex h-10 items-center gap-2 rounded-lg bg-orange-700 px-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
                  >
                    <FileDown
                      className={`h-4 w-4 ${
                        isExporting
                          ? "animate-bounce"
                          : ""
                      }`}
                    />

                    <span>
                      {isExporting
                        ? "Exporting..."
                        : "Export PDF"}
                    </span>
                  </button>
                </div>
              </section>

              {/* ======================================================
                  KPI ROW
              ====================================================== */}

              <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">

                {KPI_DATA.map((kpi) => (
                  <article
                    key={kpi.label}
                    className={`min-h-[126px] rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      kpi.highlighted
                        ? "border-orange-500 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-600/20"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >

                    <div
                      className={`text-xs font-semibold ${
                        kpi.highlighted
                          ? "text-orange-50"
                          : "text-slate-500"
                      }`}
                    >
                      {kpi.label}
                    </div>

                    <div
                      className={`mt-2 text-[28px] font-extrabold leading-none tracking-tight ${
                        kpi.highlighted
                          ? "text-white"
                          : kpi.trend === "negative"
                            ? "text-rose-600"
                            : "text-slate-800"
                      }`}
                    >
                      {kpi.value}
                    </div>

                    <div
                      className={`mt-3 text-[11px] font-medium ${
                        kpi.highlighted
                          ? "text-orange-50"
                          : kpi.trend === "positive"
                            ? "text-emerald-600"
                            : kpi.trend === "negative"
                              ? "text-rose-500"
                              : "text-slate-400"
                      }`}
                    >
                      {kpi.subtext}
                    </div>
                  </article>
                ))}
              </section>

              {/* ======================================================
                  ANALYTICS GRID
              ====================================================== */}

              <section className="grid grid-cols-12 gap-4">

                {/* SALES CATEGORY + TOP ITEMS */}

                <article className="col-span-12 rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-8">

                  <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <ShoppingBag className="h-4 w-4" />
                      </div>

                      <h2 className="text-sm font-bold text-slate-800">
                        Sales by Category &amp; Top Items
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-7 p-5 md:grid-cols-2">

                    {/* REVENUE BREAKDOWN */}

                    <div>

                      <div className="mb-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Revenue Breakdown
                      </div>

                      <div className="space-y-5">

                        {SALES_CATEGORIES.map(
                          (category) => (
                            <div
                              key={category.name}
                            >
                              <div className="mb-2 flex items-center justify-between text-xs">

                                <span className="font-semibold text-slate-600">
                                  {category.name}
                                </span>

                                <span className="font-bold text-slate-700">
                                  {category.percentage}%
                                </span>
                              </div>

                              <ProgressBar
                                percentage={
                                  category.percentage
                                }
                                tone={category.tone}
                              />

                              <div className="mt-2 text-xs font-bold text-slate-700">
                                {category.revenue}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* TOP ITEMS */}

                    <div>

                      <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Top 5 Best-Selling Items
                      </div>

                      <div className="space-y-2">

                        {TOP_ITEMS.map((item) => (
                          <div
                            key={item.rank}
                            className="flex min-h-9 items-center gap-3 rounded-lg px-1 transition-colors hover:bg-slate-50"
                          >

                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                              {item.rank}
                            </span>

                            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                              {item.name}
                            </span>

                            <span className="shrink-0 text-xs font-bold text-slate-800">
                              {item.quantity}{" "}
                              {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                {/* RIGHT STACK */}

                <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">

                  {/* PAYMENT METHODS */}

                  <article className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                    <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-5">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <CreditCard className="h-4 w-4" />
                      </div>

                      <h2 className="text-sm font-bold text-slate-800">
                        Payment Methods
                      </h2>
                    </div>

                    <div className="space-y-2 p-4">

                      {PAYMENT_METHODS.map(
                        (payment) => {
                          const Icon =
                            payment.icon;

                          return (
                            <div
                              key={payment.name}
                              className="flex h-9 items-center gap-2.5 rounded-lg border border-orange-100 bg-white px-2.5"
                            >

                              <Icon className="h-4 w-4 text-orange-600" />

                              <span className="flex-1 text-xs font-medium text-slate-600">
                                {payment.name}
                              </span>

                              <span className="text-xs font-bold text-slate-800">
                                {payment.amount}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </article>

                  {/* INVENTORY ALERTS */}

                  <article className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/70 shadow-sm">

                    <div className="flex h-12 items-center gap-2 border-b border-rose-100 px-4">

                      <AlertTriangle className="h-4 w-4 text-rose-600" />

                      <h2 className="text-sm font-bold text-rose-700">
                        Inventory Alerts
                      </h2>
                    </div>

                    <div className="space-y-2 p-3">

                      {INVENTORY_ALERTS.map(
                        (alert) => (
                          <div
                            key={alert.name}
                            className="flex min-h-9 items-center gap-2 rounded-lg bg-white/70 px-2.5"
                          >

                            <span className="min-w-0 flex-1 truncate text-xs font-medium text-rose-700">
                              {alert.name}
                            </span>

                            <span
                              className={`shrink-0 rounded px-1.5 py-1 text-[8px] font-extrabold tracking-wide ${
                                alert.severity ===
                                "danger"
                                  ? "bg-red-600 text-white"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {alert.status}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </article>
                </div>
              </section>

              {/* ======================================================
                  SHIFT SUMMARY
              ====================================================== */}

              <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Users className="h-4 w-4" />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Shift Summary
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  >
                    View All

                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px] border-collapse">

                    <thead>
                      <tr className="bg-slate-50/80 text-left">

                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Staff Name
                        </th>

                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Role
                        </th>

                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Shift Time
                        </th>

                        <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Total Sales
                        </th>

                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredShifts.map(
                        (shift) => (
                          <tr
                            key={`${shift.staffName}-${shift.shiftTime}`}
                            className="transition-colors hover:bg-slate-50/70"
                          >

                            <td className="px-5 py-3 text-xs font-semibold text-slate-700">
                              {shift.staffName}
                            </td>

                            <td className="px-5 py-3 text-xs font-medium text-slate-500">
                              {shift.role}
                            </td>

                            <td className="px-5 py-3">

                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">

                                <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                                {shift.shiftTime}
                              </div>
                            </td>

                            <td className="px-5 py-3 text-right text-xs font-extrabold text-slate-800">
                              {shift.totalSales}
                            </td>

                            <td className="px-5 py-3 text-center">

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  shift.status ===
                                  "Closed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-orange-50 text-orange-700"
                                }`}
                              >

                                <CheckCircle2 className="h-3 w-3" />

                                {shift.status}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}

                      {filteredShifts.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-8 text-center text-sm text-slate-400"
                          >
                            No shift data found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ======================================================
                  FOOTER
              ====================================================== */}

              <div className="flex h-12 items-center justify-between text-[10px] font-medium text-slate-400">

                <span>
                  ROMS POS • Terminal 01
                </span>

                <span>
                  Report date:{" "}
                  {formatDate(selectedDate)}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================================================================
          NEW ORDER MODAL
      ================================================================ */}

      {showNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-800">
                  New Order
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new order for the customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNewOrder(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowNewOrder(false)
                }
                className="h-12 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dine-in
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowNewOrder(false)
                }
                className="h-12 rounded-xl bg-orange-600 font-semibold text-white hover:bg-orange-500"
              >
                Takeaway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          PRINT STYLES
      ================================================================ */}

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          * {
            box-shadow: none !important;
          }

          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EndOfDayReportPage;
