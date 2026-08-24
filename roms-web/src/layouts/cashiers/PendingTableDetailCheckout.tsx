import React, { useMemo, useState } from "react";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CreditCard,
  History,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Split,
  Users,
  WalletCards,
  X,
} from "lucide-react";

/* =========================================================
 * Types
 * ======================================================= */

export interface TableItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDetail {
  id: string;
  tableName: string;
  floor: string;
  customerCount: number;
  time: string;
  status: "serving" | "pending";
  items: TableItem[];
  subtotal: number;
  vat: number;
  vatRate: number;
  total: number;
}

export interface PendingTableOrder {
  id: string;
  tableName: string;
  floor: string;
  elapsed: string;
  total: number;
  type: "table" | "takeaway";
  order: OrderDetail;
}

export interface TransactionHistory {
  id: string;
  tableName: string;
  paymentMethod: string;
  time: string;
  amount: number;
  status: "completed";
}

/* =========================================================
 * Data
 * ======================================================= */

const formatVND = (value: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const formatShortVND = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(".00", "")}M`;
  }

  return `${Math.round(value / 1_000)}K`;
};

const currentTableItems: TableItem[] = [
  {
    id: "current-1",
    name: "Special Beef Pho",
    quantity: 2,
    unitPrice: 150_000,
  },
  {
    id: "current-2",
    name: "Fried Spring Rolls",
    quantity: 1,
    unitPrice: 85_000,
  },
  {
    id: "current-3",
    name: "Vietnamese Iced Coffee",
    quantity: 2,
    unitPrice: 70_000,
  },
  {
    id: "current-4",
    name: "Iced Tea",
    quantity: 2,
    unitPrice: 10_000,
  },
];

const pendingOrders: PendingTableOrder[] = [
  {
    id: "28485",
    tableName: "Table 08",
    floor: "Floor 1",
    elapsed: "5 minutes ago",
    total: 850_000,
    type: "table",
    order: {
      id: "28485",
      tableName: "Table 08",
      floor: "Floor 1",
      customerCount: 4,
      time: "12:10",
      status: "pending",
      items: [
        {
          id: "28485-1",
          name: "Large Seafood Thai Hot Pot",
          quantity: 1,
          unitPrice: 450_000,
        },
        {
          id: "28485-2",
          name: "Lotus Stem Salad with Shrimp & Pork",
          quantity: 1,
          unitPrice: 180_000,
        },
        {
          id: "28485-3",
          name: "Heineken Beer",
          quantity: 6,
          unitPrice: 25_000,
        },
        {
          id: "28485-4",
          name: "Cold Towel",
          quantity: 4,
          unitPrice: 5_000,
        },
      ],
      subtotal: 800_000,
      vat: 50_000,
      vatRate: 10,
      total: 850_000,
    },
  },
  {
    id: "28486",
    tableName: "Table 12",
    floor: "Floor 2",
    elapsed: "2 minutes ago",
    total: 1_240_000,
    type: "table",
    order: {
      id: "28486",
      tableName: "Table 12",
      floor: "Floor 2",
      customerCount: 6,
      time: "12:13",
      status: "pending",
      items: [
        {
          id: "28486-1",
          name: "Large Seafood Thai Hot Pot",
          quantity: 2,
          unitPrice: 450_000,
        },
        {
          id: "28486-2",
          name: "Lotus Stem Salad with Shrimp & Pork",
          quantity: 1,
          unitPrice: 180_000,
        },
        {
          id: "28486-3",
          name: "Heineken Beer",
          quantity: 8,
          unitPrice: 25_000,
        },
        {
          id: "28486-4",
          name: "Cold Towel",
          quantity: 4,
          unitPrice: 5_000,
        },
      ],
      subtotal: 1_000_000,
      vat: 240_000,
      vatRate: 24,
      total: 1_240_000,
    },
  },
  {
    id: "28487",
    tableName: "Takeaway #45",
    floor: "Waiting Area",
    elapsed: "Just now",
    total: 120_000,
    type: "takeaway",
    order: {
      id: "28487",
      tableName: "Takeaway #45",
      floor: "Waiting Area",
      customerCount: 1,
      time: "12:15",
      status: "pending",
      items: [
        {
          id: "28487-1",
          name: "Fried Fish Sauce Chicken Rice",
          quantity: 1,
          unitPrice: 75_000,
        },
        {
          id: "28487-2",
          name: "Vietnamese Iced Coffee",
          quantity: 1,
          unitPrice: 45_000,
        },
      ],
      subtotal: 120_000,
      vat: 0,
      vatRate: 0,
      total: 120_000,
    },
  },
];

const transactions: TransactionHistory[] = [
  {
    id: "28490",
    tableName: "Table 02",
    paymentMethod: "Credit Card",
    time: "12:45",
    amount: 540_000,
    status: "completed",
  },
  {
    id: "28489",
    tableName: "Table 05",
    paymentMethod: "Cash",
    time: "12:30",
    amount: 210_000,
    status: "completed",
  },
  {
    id: "28488",
    tableName: "Takeaway",
    paymentMethod: "Momo QR",
    time: "12:15",
    amount: 85_000,
    status: "completed",
  },
];

/* =========================================================
 * Sidebar
 * ======================================================= */

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left",
        "text-[15px] font-semibold transition-all duration-150",
        active
          ? "bg-[#292d32] text-white"
          : "text-slate-400 hover:bg-[#25292e] hover:text-white",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-orange-600" />
      )}

      <span
        className={[
          "flex h-7 w-7 items-center justify-center",
          active ? "text-orange-500" : "text-slate-400",
        ].join(" ")}
      >
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
};

/* =========================================================
 * Main Component
 * ======================================================= */

const CashierCheckoutDashboard: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState("28485");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [activeNav, setActiveNav] = useState("Sales");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const selectedPendingOrder = useMemo(() => {
    return (
      pendingOrders.find((item) => item.id === selectedOrderId) ??
      pendingOrders[0]
    );
  }, [selectedOrderId]);

  const currentSubtotal = 315_000;
  const currentVat = 25_200;
  const currentTotal = 340_200;

  const selectedOrder = selectedPendingOrder.order;

  const applyCoupon = () => {
    if (!coupon.trim()) return;
    setAppliedCoupon(true);
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4f6f8] font-sans text-slate-800">
      <div className="flex h-full min-h-0">
        {/* =====================================================
         * LEFT SIDEBAR
         * =================================================== */}

        <CashierSidebar />

        <aside className="hidden">
          {/* Brand */}
          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-xl font-black shadow-lg shadow-orange-950/30">
              B
            </div>

            <div className="min-w-0">
              <div className="truncate text-[16px] font-extrabold tracking-tight">
                Bistro POS
              </div>

              <div className="mt-0.5 text-xs font-medium text-slate-500">
                Terminal 01
              </div>
            </div>
          </div>

          {/* New Order */}
          <button
            type="button"
            className="mb-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-[15px] font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-700 active:scale-[0.98]"
          >
            <Plus size={19} strokeWidth={2.8} />
            New Order
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            <SidebarItem
              label="Sales"
              active={activeNav === "Sales"}
              onClick={() => setActiveNav("Sales")}
              icon={<LayoutDashboard size={19} />}
            />

            <SidebarItem
              label="Orders"
              active={activeNav === "Orders"}
              onClick={() => setActiveNav("Orders")}
              icon={<ShoppingBag size={19} />}
            />

            <SidebarItem
              label="History"
              active={activeNav === "History"}
              onClick={() => setActiveNav("History")}
              icon={<History size={19} />}
            />

            <SidebarItem
              label="Refunds"
              active={activeNav === "Refunds"}
              onClick={() => setActiveNav("Refunds")}
              icon={<RotateCcw size={19} />}
            />

            <SidebarItem
              label="Settings"
              active={activeNav === "Settings"}
              onClick={() => setActiveNav("Settings")}
              icon={<Settings size={19} />}
            />
          </nav>

          <div className="flex-1" />

          {/* Support */}
          <button
            type="button"
            className="flex h-12 items-center gap-4 rounded-xl px-4 text-[15px] font-semibold text-slate-400 transition hover:bg-[#25292e] hover:text-white"
          >
            <CircleHelp size={19} />
            Support
          </button>

          {/* Terminal status */}
          <div className="mt-3 flex items-center gap-3 border-t border-white/5 px-3 pt-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-medium text-slate-500">
              System is operational
            </span>
          </div>
        </aside>

        {/* =====================================================
         * RIGHT APP AREA
         * =================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ===================================================
           * TOP HEADER
           * ================================================= */}

          <header className="flex h-[76px] shrink-0 items-center border-b border-slate-200 bg-white px-7">
            {/* Title */}
            <div className="flex min-w-[280px] items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 xl:flex">
                <Receipt size={21} />
              </div>

              <div>
                <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900">
                  Checkout Express
                </h1>

                <p className="text-xs font-medium text-slate-400">
                  Cashier Counter • Terminal 01
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mx-auto flex w-[390px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
              <Search size={19} className="shrink-0 text-slate-400" />

              <input
                value={coupon === "__SEARCH__" ? "" : undefined}
                onChange={() => undefined}
                placeholder="Search orders..."
                className="h-11 w-full bg-transparent px-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />

              <kbd className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-400 xl:block">
                Ctrl K
              </kbd>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2.5">
              <div className="mx-1 h-8 w-px bg-slate-200" />

              <button
                type="button"
                onClick={() => setShowNotification((value) => !value)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Bell size={20} />

                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-600" />
              </button>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <RefreshCw size={19} />
              </button>

              <button
                type="button"
                className="ml-1 flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 transition hover:bg-slate-100"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                    TL
                  </div>

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="hidden text-left xl:block">
                  <div className="text-xs font-bold text-slate-800">
                    Cashier
                  </div>

                  <div className="text-[10px] font-medium text-slate-400">
                    Online
                  </div>
                </div>
              </button>
            </div>

            {/* Notification */}
            {showNotification && (
              <div className="absolute right-32 top-[68px] z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Notifications
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowNotification(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-orange-600">
                      <Bell size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        3 tables are waiting for payment
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Please process them in order to minimize customer wait
                        time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* ===================================================
           * MAIN CONTENT
           * ================================================= */}

          <main className="min-h-0 flex-1 p-5">
            <div className="grid h-full min-h-0 grid-cols-[minmax(320px,0.85fr)_minmax(600px,1.75fr)_minmax(285px,0.85fr)] gap-5">
              {/* =================================================
               * COLUMN 1 - CURRENT CHECKOUT
               * =============================================== */}

              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[20px] font-extrabold text-slate-900">
                          Table 14
                        </h2>

                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                          Serving
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Invoice #28491 • 2 Guests
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="min-h-0 flex-1 overflow-hidden">
                  <div className="grid grid-cols-[minmax(0,1fr)_42px_95px] border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Price</span>
                  </div>

                  <div className="divide-y divide-slate-100 px-5">
                    {currentTableItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid min-h-[62px] grid-cols-[minmax(0,1fr)_42px_95px] items-center py-3"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                            {item.quantity} serving
                            {item.quantity !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <span className="text-center text-sm font-bold text-slate-700">
                          {item.quantity}
                        </span>

                        <span className="text-right text-sm font-bold text-slate-700">
                          {formatVND(item.unitPrice).replace(" VND", "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial */}
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-bold text-slate-700">
                        {formatVND(currentSubtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        VAT (8%)
                      </span>

                      <span className="font-bold text-slate-700">
                        {formatVND(currentVat)}
                      </span>
                    </div>

                    <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <input
                        value={coupon}
                        onChange={(event) => {
                          setCoupon(event.target.value);
                          setAppliedCoupon(false);
                        }}
                        placeholder="Discount code..."
                        className="min-w-0 flex-1 px-3 text-xs font-medium outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="border-l border-slate-200 px-3 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 size={13} />
                        Discount code applied successfully
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex items-end justify-between border-t border-dashed border-slate-200 pt-4">
                    <span className="text-base font-extrabold text-slate-900">
                      Total
                    </span>

                    <span className="text-[26px] font-black tracking-tight text-orange-600">
                      {formatVND(currentTotal)}
                    </span>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Split size={17} />
                      Split Bill
                    </button>

                    <button
                      type="button"
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Receipt size={17} />
                      Merge Bill
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
               * COLUMN 2 - DETAIL
               * =============================================== */}

              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Detail Header */}
                <div className="flex min-h-[108px] shrink-0 items-center justify-between gap-5 border-b border-slate-100 px-6 py-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    >
                      <ArrowLeft size={21} />
                    </button>

                    <div className="min-w-0">
                      <h2 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                        Invoice Details - {selectedOrder.tableName} (
                        {selectedOrder.floor})
                      </h2>

                      <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Invoice #{selectedOrder.id}</span>
                        <span>•</span>
                        <span>{selectedOrder.customerCount} Guests</span>
                        <span>•</span>
                        <span>{selectedOrder.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Amount Due
                    </p>

                    <p className="mt-0.5 text-[30px] font-black tracking-tight text-orange-600">
                      {formatVND(selectedOrder.total)}
                    </p>
                  </div>
                </div>

                {/* Detail Items */}
                <div className="min-h-0 flex-1 overflow-auto">
                  <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_70px_150px_160px] border-b border-slate-100 bg-slate-50 px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>Item Name</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-right">Amount</span>
                  </div>

                  <div className="divide-y divide-slate-100 px-6">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_70px_150px_160px] items-center"
                      >
                        <div className="min-w-0 pr-5">
                          <p className="truncate text-[15px] font-bold text-slate-800">
                            {item.name}
                          </p>

                          {item.quantity > 1 && (
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {item.quantity} serving
                              {item.quantity !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>

                        <span className="text-center text-sm font-bold text-slate-700">
                          {item.quantity}
                        </span>

                        <span className="text-right text-sm font-semibold text-slate-600">
                          {formatVND(item.unitPrice)}
                        </span>

                        <span className="text-right text-sm font-extrabold text-slate-900">
                          {formatVND(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-5">
                  <div className="flex items-end justify-between gap-8">
                    <div className="min-w-[260px]">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-bold text-slate-700">
                          {formatVND(selectedOrder.subtotal)}
                        </span>
                      </div>

                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-500">
                          VAT ({selectedOrder.vatRate}%)
                        </span>

                        <span className="font-bold text-slate-700">
                          {formatVND(selectedOrder.vat)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                        <span className="text-lg font-extrabold text-slate-900">
                          Total
                        </span>

                        <span className="text-[23px] font-black text-orange-600">
                          {formatVND(selectedOrder.total)}
                        </span>
                      </div>
                    </div>

                    <div className="w-[390px]">
                      <button
                        type="button"
                        onClick={handlePayment}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-orange-600 px-5 text-[16px] font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 active:scale-[0.99]"
                      >
                        <CreditCard size={20} strokeWidth={2.5} />
                        Proceed to Payment
                      </button>

                      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Printer size={16} />
                          Print Estimate
                        </button>

                        <button
                          type="button"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Menu size={16} />
                          Edit Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
               * COLUMN 3 - QUEUE + HISTORY
               * =============================================== */}

              <aside className="flex min-h-0 flex-col gap-5">
                {/* Pending Queue */}
                <section className="flex min-h-0 flex-[1.05] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <Receipt size={17} />
                      </div>

                      <h3 className="text-[16px] font-extrabold text-slate-900">
                        Payment Queue
                      </h3>
                    </div>

                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-100 px-2 text-[11px] font-black text-orange-700">
                      {pendingOrders.length}
                    </span>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto p-3">
                    <div className="space-y-2">
                      {pendingOrders.map((pending) => {
                        const selected = pending.id === selectedOrderId;

                        return (
                          <button
                            key={pending.id}
                            type="button"
                            onClick={() => setSelectedOrderId(pending.id)}
                            className={[
                              "relative w-full rounded-xl border p-3.5 text-left transition-all",
                              selected
                                ? "border-orange-400 bg-orange-50/60 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {selected && (
                              <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-orange-600" />
                            )}

                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-extrabold text-slate-900">
                                    {pending.tableName}
                                  </span>

                                  {pending.type === "takeaway" && (
                                    <ShoppingBag
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>

                                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                                  {pending.floor} • {pending.elapsed}
                                </p>
                              </div>

                              <span
                                className={[
                                  "shrink-0 text-[16px] font-black",
                                  selected
                                    ? "text-orange-600"
                                    : "text-slate-800",
                                ].join(" ")}
                              >
                                {formatShortVND(pending.total)}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                <Users size={12} />
                                {pending.order.customerCount} guests
                              </span>

                              {selected ? (
                                <span className="text-[10px] font-extrabold text-orange-600">
                                  Selected
                                </span>
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="text-slate-300"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* History */}
                <section className="flex min-h-0 flex-[0.95] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <History size={17} />
                      </div>

                      <h3 className="text-[16px] font-extrabold text-slate-900">
                        Transaction History
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto">
                    <div className="divide-y divide-slate-100 px-5">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-800">
                                #{transaction.id} ({transaction.tableName})
                              </p>

                              <p className="mt-1 text-[10px] font-medium text-slate-400">
                                {transaction.paymentMethod} •{" "}
                                {transaction.time}
                              </p>
                            </div>

                            <span className="shrink-0 text-sm font-black text-slate-800">
                              {formatVND(transaction.amount)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                            <CheckCircle2 size={12} />
                            Completed
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flex h-12 shrink-0 items-center justify-center border-t border-slate-100 text-xs font-extrabold text-orange-600 transition hover:bg-orange-50 hover:underline"
                  >
                    View All
                    <ChevronRight size={15} className="ml-1" />
                  </button>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {/* =========================================================
       * PAYMENT MODAL
       * ======================================================= */}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-6 backdrop-blur-[2px]">
          <div className="w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Proceed to Payment
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {selectedOrder.tableName} • Invoice #{selectedOrder.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Amount */}
            <div className="bg-orange-50 px-6 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-700/60">
                Amount Due
              </p>

              <p className="mt-1 text-[36px] font-black tracking-tight text-orange-600">
                {formatVND(selectedOrder.total)}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3 px-6 py-6">
              <button
                type="button"
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-50 text-orange-700"
              >
                <WalletCards size={24} />

                <span className="text-xs font-extrabold">Cash</span>
              </button>

              <button
                type="button"
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <CreditCard size={24} />

                <span className="text-xs font-extrabold">
                  Card
                </span>
              </button>

              <button
                type="button"
                className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Receipt size={24} />

                <span className="text-xs font-extrabold">
                  QR Code
                </span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="h-12 flex-[1.5] rounded-xl bg-orange-600 text-sm font-extrabold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierCheckoutDashboard;