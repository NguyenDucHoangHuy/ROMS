import React, { useMemo, useState } from "react";
import {
  Bell,
  Banknote,
  CreditCard,
  History,
  LifeBuoy,
  MoreHorizontal,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Split,
  WalletCards,
  X,
} from "lucide-react";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface OrderItem {
  id: string;
  name: string;
  note?: string;
  quantity: number;

  /**
   * Giá được hiển thị trong POS là tổng giá của dòng món.
   * Ví dụ: Phở quantity = 2, price = 150.000đ.
   * Điều này khớp với UI mẫu và subtotal 315.000đ.
   */
  price: number;
}

export type PaymentMethod =
  | "cash"
  | "card"
  | "ewallet"
  | "qr";

export interface PendingOrder {
  id: string;
  table: string;
  elapsed: string;
  amount: number;
}

export interface Transaction {
  id: string;
  table: string;
  paymentMethod: string;
  timestamp: string;
  amount: number;
  status: "Hoàn tất" | "Đang xử lý";
}

/* =========================================================
 * MOCK DATA
 * ========================================================= */

const orderItems: OrderItem[] = [
  {
    id: "item-1",
    name: "Phở Bò Đặc Biệt",
    note: "Ít bánh, nhiều hành",
    quantity: 2,
    price: 150_000,
  },
  {
    id: "item-2",
    name: "Chả Giò",
    note: "Phần",
    quantity: 1,
    price: 85_000,
  },
  {
    id: "item-3",
    name: "Cà Phê Sữa Đá",
    quantity: 2,
    price: 70_000,
  },
  {
    id: "item-4",
    name: "Trà Đá",
    quantity: 2,
    price: 10_000,
  },
];

const pendingOrders: PendingOrder[] = [
  {
    id: "pending-1",
    table: "Bàn 08",
    elapsed: "5 phút trước",
    amount: 850_000,
  },
  {
    id: "pending-2",
    table: "Bàn 12",
    elapsed: "2 phút trước",
    amount: 1_240_000,
  },
  {
    id: "pending-3",
    table: "Mang đi #45",
    elapsed: "Vừa xong",
    amount: 120_000,
  },
];

const transactions: Transaction[] = [
  {
    id: "#28490",
    table: "Bàn 02",
    paymentMethod: "Thẻ tín dụng",
    timestamp: "12:45",
    amount: 540_000,
    status: "Hoàn tất",
  },
  {
    id: "#28489",
    table: "Bàn 05",
    paymentMethod: "Tiền mặt",
    timestamp: "12:30",
    amount: 210_000,
    status: "Hoàn tất",
  },
  {
    id: "#28488",
    table: "Mang đi",
    paymentMethod: "QR MoMo",
    timestamp: "12:15",
    amount: 85_000,
    status: "Hoàn tất",
  },
];

/* =========================================================
 * CONSTANTS
 * ========================================================= */

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  icon: React.ElementType;
}> = [
  {
    id: "cash",
    label: "Tiền mặt",
    icon: Banknote,
  },
  {
    id: "card",
    label: "Thẻ ngân hàng",
    icon: CreditCard,
  },
  {
    id: "ewallet",
    label: "Ví điện tử",
    icon: WalletCards,
  },
  {
    id: "qr",
    label: "Chuyển khoản QR",
    icon: QrCode,
  },
];

const QUICK_CASH_OPTIONS = [
  {
    id: "exact",
    label: "Chính xác",
    amount: 340_200,
  },
  {
    id: "350",
    label: "350,000",
    amount: 350_000,
  },
  {
    id: "400",
    label: "400,000",
    amount: 400_000,
  },
  {
    id: "500",
    label: "500,000",
    amount: 500_000,
  },
];

/* =========================================================
 * HELPERS
 * ========================================================= */

const formatCurrency = (value: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
};

const formatShortCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  }

  return `${Math.round(value / 1_000)}K`;
};

/* =========================================================
 * COMPONENT
 * ========================================================= */

const CashierCheckoutPage: React.FC = () => {
  /* -------------------------------------------------------
   * STATE
   * ------------------------------------------------------- */

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("cash");

  const [selectedCash, setSelectedCash] = useState("350");

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] =
    useState("");

  const [discountAmount, setDiscountAmount] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedPendingOrder, setSelectedPendingOrder] =
    useState<string | null>(null);

  const [notificationCount] = useState(3);

  /* -------------------------------------------------------
   * CALCULATIONS
   * ------------------------------------------------------- */

  const subtotal = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.price, 0);
  }, []);

  const vat = useMemo(() => {
    return Math.round((subtotal - discountAmount) * 0.08);
  }, [subtotal, discountAmount]);

  const total = useMemo(() => {
    return subtotal - discountAmount + vat;
  }, [subtotal, discountAmount, vat]);

  const selectedCashAmount =
    QUICK_CASH_OPTIONS.find(
      (option) => option.id === selectedCash,
    )?.amount ?? total;

  /* -------------------------------------------------------
   * HANDLERS
   * ------------------------------------------------------- */

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();

    if (!code) {
      setAppliedDiscountCode("");
      setDiscountAmount(0);
      return;
    }

    /**
     * Demo promotion rules.
     *
     * GIAM10  => 10% subtotal
     * GIAM20  => 20.000đ
     */
    if (code === "GIAM10") {
      setDiscountAmount(Math.round(subtotal * 0.1));
      setAppliedDiscountCode(code);
      return;
    }

    if (code === "GIAM20") {
      setDiscountAmount(20_000);
      setAppliedDiscountCode(code);
      return;
    }

    setDiscountAmount(0);
    setAppliedDiscountCode("");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handlePayment = () => {
    const paymentLabel =
      PAYMENT_METHODS.find(
        (method) => method.id === selectedPayment,
      )?.label ?? "Thanh toán";

    console.log("Processing payment:", {
      method: paymentLabel,
      amount: selectedCashAmount,
      total,
      discountCode: appliedDiscountCode,
    });

    alert(
      `Thanh toán ${formatCurrency(
        selectedCashAmount,
      )} bằng ${paymentLabel}`,
    );
  };

  /* =========================================================
   * RENDER
   * ========================================================= */

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <div className="flex min-h-screen">
        {/* ===================================================
         * SIDEBAR
         * =================================================== */}

        <aside className="hidden w-[235px] shrink-0 flex-col bg-[#1a1d21] text-white lg:flex">
          {/* Brand */}
          <div className="flex h-[82px] items-center gap-3 border-b border-white/5 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c2410c] text-lg font-bold">
              B
            </div>

            <div>
              <h1 className="text-[15px] font-bold tracking-tight">
                Bistro POS
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Terminal 01
              </p>
            </div>
          </div>

          {/* New Order */}
          <div className="px-4 pt-5">
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f35b25] text-sm font-semibold text-white shadow-sm transition hover:bg-[#d94b1a] active:scale-[0.98]"
            >
              <Plus size={17} strokeWidth={2.5} />
              New Order
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-3">
            <SidebarItem
              icon={ShoppingBag}
              label="Sales"
              active
            />

            <SidebarItem
              icon={Receipt}
              label="Orders"
            />

            <SidebarItem
              icon={History}
              label="History"
            />

            <SidebarItem
              icon={RotateCcw}
              label="Refunds"
            />

            <SidebarItem
              icon={Settings}
              label="Settings"
            />
          </nav>

          {/* Support */}
          <div className="border-t border-white/5 p-3">
            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <LifeBuoy size={17} />
              Support
            </button>
          </div>
        </aside>

        {/* ===================================================
         * MAIN
         * =================================================== */}

        <main className="min-w-0 flex-1">
          {/* =================================================
           * HEADER
           * ================================================= */}

          <header className="flex min-h-[82px] flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 xl:px-8">
            {/* Mobile brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c2410c] text-sm font-bold text-white">
                B
              </div>

              <span className="font-bold text-slate-900">
                Bistro POS
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Checkout Express
            </h2>

            {/* Search */}
            <div className="relative order-last w-full sm:order-none sm:ml-3 sm:max-w-[310px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#d9531e] focus:bg-white focus:ring-2 focus:ring-[#d9531e]/10"
              />
            </div>

            {/* Header actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:flex"
              >
                <Split size={15} />
                Split Bill
              </button>

              <button
                type="button"
                className="hidden h-10 items-center gap-2 rounded-lg bg-[#c2410c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a83a0b] md:flex"
                onClick={() => setSelectedCash("exact")}
              >
                Quick Cash
              </button>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Bell size={18} />

                {notificationCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2410c] px-1 text-[9px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <RefreshCw
                  size={17}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <button
                type="button"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white"
              >
                TL
              </button>
            </div>
          </header>

          {/* =================================================
           * CONTENT
           * ================================================= */}

          <div className="p-4 sm:p-5 xl:p-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(310px,0.95fr)_minmax(430px,1.25fr)_280px]">
              {/* =================================================
               * COLUMN 1 - ORDER DETAILS
               * ================================================= */}

              <section className="flex min-h-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                {/* Order header */}
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          Bàn 14
                        </h3>

                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                          Đang phục vụ
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Hóa đơn #28491 • 2 Khách
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 transition hover:text-slate-700"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1">
                  <div className="grid grid-cols-[1fr_45px_85px] border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>Món</span>
                    <span className="text-center">SL</span>
                    <span className="text-right">Giá</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_45px_85px] gap-2 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {item.name}
                          </p>

                          {item.note && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              ({item.note})
                            </p>
                          )}
                        </div>

                        <span className="text-center text-xs text-slate-600">
                          {item.quantity}
                        </span>

                        <span className="text-right text-xs font-medium text-slate-700">
                          {new Intl.NumberFormat("vi-VN").format(
                            item.price,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price summary */}
                <div className="border-t border-slate-100 p-5">
                  <div className="space-y-3">
                    <PriceRow
                      label="Tạm tính"
                      value={formatCurrency(subtotal)}
                    />

                    <PriceRow
                      label="VAT (8%)"
                      value={formatCurrency(vat)}
                    />

                    {/* Discount */}
                    <div className="flex gap-2">
                      <input
                        value={discountCode}
                        onChange={(event) =>
                          setDiscountCode(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleApplyDiscount();
                          }
                        }}
                        placeholder="Mã giảm giá..."
                        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#d9531e] focus:ring-2 focus:ring-[#d9531e]/10"
                      />

                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="h-9 shrink-0 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {appliedDiscountCode && (
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs">
                        <span className="font-medium text-emerald-700">
                          {appliedDiscountCode}
                        </span>

                        <span className="font-semibold text-emerald-600">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                    <span className="text-base font-bold text-slate-800">
                      Tổng cộng
                    </span>

                    <span className="text-2xl font-bold tracking-tight text-[#c2410c]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4">
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <Split size={14} />
                    Tách Bill
                  </button>

                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <Plus size={14} />
                    Gộp Bill
                  </button>
                </div>
              </section>

              {/* =================================================
               * COLUMN 2 - PAYMENT
               * ================================================= */}

              <section className="flex min-h-[720px] flex-col gap-4">
                {/* Payment amount */}
                <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-center">
                      <p className="text-xs font-medium text-slate-400">
                        Số tiền thanh toán
                      </p>

                      <h3 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {new Intl.NumberFormat("vi-VN").format(
                          selectedCashAmount,
                        )}
                        <span className="ml-1 text-xl font-semibold text-slate-500">
                          đ
                        </span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCash("exact")}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Reset payment amount"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Quick cash */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {QUICK_CASH_OPTIONS.map((option) => {
                      const active =
                        selectedCash === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSelectedCash(option.id)
                          }
                          className={[
                            "h-9 rounded-lg border text-[10px] font-semibold transition sm:text-xs",
                            active
                              ? "border-[#d9531e] bg-[#fff7f3] text-[#c2410c] shadow-sm"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment methods */}
                <div className="grid flex-1 grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;

                    const active =
                      selectedPayment === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          setSelectedPayment(method.id)
                        }
                        className={[
                          "group relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border bg-white p-5 transition duration-200",
                          "active:scale-[0.98]",
                          active
                            ? "border-[#d9531e] bg-[#fffaf7] shadow-md ring-2 ring-[#d9531e]/10"
                            : "border-slate-200/70 shadow-sm hover:-translate-y-0.5 hover:border-[#d9531e]/40 hover:shadow-md",
                        ].join(" ")}
                      >
                        {active && (
                          <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#c2410c]" />
                        )}

                        <div
                          className={[
                            "flex h-11 w-11 items-center justify-center rounded-xl transition",
                            active
                              ? "bg-[#fff0e9] text-[#c2410c]"
                              : "bg-slate-50 text-[#c2410c] group-hover:bg-[#fff0e9]",
                          ].join(" ")}
                        >
                          <Icon
                            size={23}
                            strokeWidth={1.8}
                          />
                        </div>

                        <span
                          className={[
                            "mt-4 text-xs font-semibold",
                            active
                              ? "text-[#c2410c]"
                              : "text-slate-600",
                          ].join(" ")}
                        >
                          {method.label}
                        </span>

                        {active && (
                          <span className="mt-1 text-[10px] text-slate-400">
                            Đã chọn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Payment summary */}
                <div className="rounded-2xl border border-[#f4d9ce] bg-[#fff3ed] p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#b86a4b]">
                        Tổng tiền cần thu
                      </p>

                      <p className="mt-1 text-2xl font-bold tracking-tight text-[#c2410c]">
                        {formatCurrency(selectedCashAmount)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayment}
                      className="rounded-xl bg-[#c2410c] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#a83a0b] active:scale-[0.98]"
                    >
                      Thanh toán
                    </button>
                  </div>

                  {selectedCashAmount > total && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#efd0c3] pt-3 text-xs">
                      <span className="text-[#a96850]">
                        Tiền thừa
                      </span>

                      <span className="font-bold text-[#c2410c]">
                        {formatCurrency(
                          selectedCashAmount - total,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
               * COLUMN 3 - QUEUE & HISTORY
               * ================================================= */}

              <aside className="flex min-h-[720px] flex-col gap-4">
                {/* Waiting payment */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        Bàn Chờ TT
                      </h3>

                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 px-1.5 text-[10px] font-bold text-red-500">
                        {pendingOrders.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pendingOrders.map((order) => {
                      const active =
                        selectedPendingOrder === order.id;

                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() =>
                            setSelectedPendingOrder(order.id)
                          }
                          className={[
                            "w-full px-4 py-3 text-left transition",
                            active
                              ? "bg-[#fff8f4]"
                              : "hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {order.table}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 align-middle" />{" "}
                                <span className="ml-1">
                                  {order.elapsed}
                                </span>
                              </p>
                            </div>

                            <span className="text-xs font-bold text-[#c2410c]">
                              {formatShortCurrency(
                                order.amount,
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Recent transactions */}
                <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Lịch Sử Giao Dịch
                    </h3>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>

                  <div className="flex-1 divide-y divide-slate-100">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-800">
                              {transaction.id}{" "}
                              <span className="font-normal text-slate-400">
                                ({transaction.table})
                              </span>
                            </p>

                            <p className="mt-1 truncate text-[9px] text-slate-400">
                              {transaction.paymentMethod} •{" "}
                              {transaction.timestamp}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-bold text-slate-700">
                              {formatCurrency(
                                transaction.amount,
                              )}
                            </p>

                            <p className="mt-1 text-[9px] text-emerald-500">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="border-t border-slate-100 px-4 py-4 text-center text-[10px] font-semibold text-[#c2410c] transition hover:bg-[#fff8f4]"
                  >
                    Xem tất cả
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/* =========================================================
 * SIDEBAR ITEM
 * ========================================================= */

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active = false,
}) => {
  return (
    <button
      type="button"
      className={[
        "group relative mb-1 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-2.5 h-6 w-0.5 rounded-r-full bg-[#f35b25]" />
      )}

      <Icon
        size={17}
        strokeWidth={active ? 2.2 : 1.8}
        className={
          active
            ? "text-[#f35b25]"
            : "text-slate-400 group-hover:text-white"
        }
      />

      <span className={active ? "font-semibold" : "font-medium"}>
        {label}
      </span>
    </button>
  );
};

/* =========================================================
 * PRICE ROW
 * ========================================================= */

interface PriceRowProps {
  label: string;
  value: string;
}

const PriceRow: React.FC<PriceRowProps> = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>

      <span className="font-medium text-slate-600">
        {value}
      </span>
    </div>
  );
};

export default CashierCheckoutPage;