import React, { useMemo, useState } from "react";
import { Bell, Banknote, CreditCard, History, LifeBuoy, MoreHorizontal, Plus, QrCode, Receipt, RefreshCw, RotateCcw, Search, Settings, ShoppingBag, Split, WalletCards, X, } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { cashierService } from "@/services/modules/cashierService";
import { reportsService } from "@/services/modules/reportsService";
import { CASHIER_DEV_READ_ONLY } from "./cashierPreviewMode";
import { useLocation, useNavigate } from "react-router-dom";
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
export type PaymentMethod = "cash" | "bank_transfer" | "momo" | "vnpay";
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
    status: string;
}
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
        id: "bank_transfer",
        label: "Chuyển khoản",
        icon: CreditCard,
    },
    {
        id: "momo",
        label: "Ví MoMo",
        icon: WalletCards,
    },
    {
        id: "vnpay",
        label: "VNPay / QR",
        icon: QrCode,
    },
];
const QUICK_CASH_OPTIONS = [
    {
        id: "exact",
        label: "Chính xác",
        amount: 0,
    },
    {
        id: "350",
        label: "350,000",
        amount: 350000,
    },
    {
        id: "400",
        label: "400,000",
        amount: 400000,
    },
    {
        id: "500",
        label: "500,000",
        amount: 500000,
    },
];
/* =========================================================
 * HELPERS
 * ========================================================= */
const formatCurrency = (value: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
};
const formatShortCurrency = (value: number) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}M`;
    }
    return `${Math.round(value / 1000)}K`;
};
/* =========================================================
 * COMPONENT
 * ========================================================= */
const CashierCheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tablesQuery = useQuery({
        queryKey: queryKeys.cashier.tables(),
        queryFn: cashierService.getTables,
        staleTime: 60000,
    });
    const transactionsQuery = useQuery({
        queryKey: queryKeys.cashier.transactionPage({ page: 1, limit: 5 }),
        queryFn: () => cashierService.getTransactions({ page: 1, limit: 5 }),
        staleTime: 60000,
    });
    const revenueQuery = useQuery({
        queryKey: queryKeys.analytics.revenue({ period: "day" }),
        queryFn: () => reportsService.getRevenueSummary({ period: "day" }),
        staleTime: 60000,
    });
    const queryClient = useQueryClient();
    const tableData = useMemo(() => tablesQuery.data ?? [], [tablesQuery.data]);
    const pendingOrders = useMemo<PendingOrder[]>(() => {
        return tableData
            .filter((table) => table.status === "occupied" &&
            ((table.orderId && table.orderId.length > 0) || (table.orderItems?.length ?? 0) > 0))
            .map((table) => ({
            id: table.orderId ?? table.id,
            table: table.name,
            elapsed: table.timer ?? "Now",
            amount: Number(table.unpaidBill?.finalAmount ?? table.total ?? 0),
        }));
    }, [tableData]);
    const transactions = useMemo<Transaction[]>(() => {
        return (transactionsQuery.data?.data ?? []).map((item) => ({
            id: item.transactionCode ?? item.id,
            table: item.tableName,
            paymentMethod: item.paymentMethod,
            timestamp: `${item.date} ${item.time}`,
            amount: item.amount,
            status: item.status === "REFUNDED" ? "Refunded" : item.status === "SUCCESS" ? "Completed" : item.status,
        }));
    }, [transactionsQuery.data]);
    /* -------------------------------------------------------
     * STATE
     * ------------------------------------------------------- */
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("cash");
    const [selectedCash, setSelectedCash] = useState("exact");
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [selectedPendingOrder, setSelectedPendingOrder] = useState<string | null>(null);
    const selectedOrderData = useMemo(() => pendingOrders.find((order) => order.id === selectedPendingOrder) ??
        pendingOrders[0] ?? {
        id: "",
        table: "No open orders",
        elapsed: "",
        amount: 0,
    }, [pendingOrders, selectedPendingOrder]);
    const selectedTable = useMemo(() => tableData.find((table) => table.orderId === selectedPendingOrder ||
        table.id === selectedPendingOrder ||
        table.name === selectedOrderData.table) ?? null, [selectedOrderData.table, selectedPendingOrder, tableData]);
    const orderItems = useMemo<OrderItem[]>(() => {
        return (selectedTable?.orderItems ?? []).map((item) => ({
            ...item,
            id: `${selectedTable?.id ?? item.id}-${item.id}`,
            name: `${item.name}${selectedTable?.name ? ` - ${selectedTable.name}` : ""}`,
            quantity: Number(item.quantity ?? 0),
            price: Number(item.quantity ?? 0) * Number(item.price ?? 0),
        }));
    }, [selectedTable]);
    /* -------------------------------------------------------
     * CALCULATIONS
     * ------------------------------------------------------- */
    const subtotal = useMemo(() => {
        return orderItems.reduce((total, item) => total + item.price, 0);
    }, [orderItems]);
    const total = useMemo(() => {
        return selectedTable?.unpaidBill?.finalAmount ?? subtotal - discountAmount;
    }, [selectedTable, subtotal, discountAmount]);
    const selectedCashAmount = (selectedCash === "exact" ? total : QUICK_CASH_OPTIONS.find((option) => option.id === selectedCash)?.amount) ?? total;
    /* -------------------------------------------------------
     * HANDLERS
     * ------------------------------------------------------- */
    const handleApplyDiscount = async () => {
        const code = discountCode.trim().toUpperCase();
        if (!code) {
            setAppliedDiscountCode("");
            setDiscountAmount(0);
            return;
        }
        if (!selectedTable || subtotal <= 0) {
            alert("Select a table with an open order before applying a promotion.");
            return;
        }
        if (selectedTable.unpaidBill) {
            alert("This bill already exists. Its promotion and total cannot be changed.");
            return;
        }
        try {
            const validation = await cashierService.validatePromotion({ code, subtotal });
            setDiscountAmount(validation.discountAmount);
            setAppliedDiscountCode(code);
        }
        catch (error) {
            setDiscountAmount(0);
            setAppliedDiscountCode("");
            alert(error instanceof Error ? error.message : "The promotion could not be validated.");
        }
    };
    const handleRefresh = () => {
        setIsRefreshing(true);
        void Promise.all([tablesQuery.refetch(), revenueQuery.refetch(), transactionsQuery.refetch()]).finally(() => setIsRefreshing(false));
    };
    const handlePayment = async () => {
        if (isProcessingPayment) return;
        if (CASHIER_DEV_READ_ONLY) {
            alert("Payment is disabled in development read-only preview mode.");
            return;
        }
        if (!selectedTable)
            return;
        const paymentLabel = PAYMENT_METHODS.find((method) => method.id === selectedPayment)?.label ?? "Payment";
        setIsProcessingPayment(true);
        try {
            const tableOrder = await cashierService.getTableOrder(selectedTable.id);
            const sessionId = tableOrder.diningSession?.id;
            if (!sessionId)
                throw new Error("This table has no active dining session.");
            const existingBill = tableOrder.bills.find((item) => item.status === "UNPAID");
            if (
                existingBill &&
                appliedDiscountCode &&
                existingBill.promotionCode?.toUpperCase() !== appliedDiscountCode.toUpperCase()
            ) {
                throw new Error("An unpaid bill already exists with a different promotion. Remove the code to pay that bill.");
            }
            const bill = existingBill ??
                await cashierService.createBill(sessionId, { promotionCode: appliedDiscountCode || undefined });
            const amountPaid = selectedPayment === "cash"
                ? selectedCash === "exact" ? bill.finalAmount : selectedCashAmount
                : bill.finalAmount;
            if (selectedPayment === "cash" && amountPaid < bill.finalAmount) {
                throw new Error("The cash amount must cover the final bill total.");
            }
            await cashierService.createPayment({
                billId: bill.id,
                paymentMethod: selectedPayment.toUpperCase(),
                amountPaid,
            });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.cashier.tables() }),
                queryClient.invalidateQueries({ queryKey: queryKeys.analytics.revenue() }),
                queryClient.invalidateQueries({ queryKey: ["analytics", "end-of-day"] }),
                queryClient.invalidateQueries({ queryKey: ["cashier", "transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["cashier", "audit-logs"] }),
            ]);
            alert(`Payment ${bill.billCode} recorded using ${paymentLabel}.`);
        }
        catch (error) {
            alert(error instanceof Error ? error.message : "Payment could not be completed.");
        } finally {
            setIsProcessingPayment(false);
        }
    };
    /* =========================================================
     * RENDER
     * ========================================================= */
    return (<div className="min-h-screen bg-[#f8fafc] text-slate-800">
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
            <button type="button" onClick={() => navigate("/cashier/tables")} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f35b25] text-sm font-semibold text-white shadow-sm transition hover:bg-[#d94b1a] active:scale-[0.98]">
              <Plus size={17} strokeWidth={2.5}/>
              New Order
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-3">
            <SidebarItem icon={ShoppingBag} label="Sales" to="/cashier" active={location.pathname === "/cashier"}/>
            <SidebarItem icon={Receipt} label="Orders" to="/cashier/pending-checkout" active={location.pathname === "/cashier/pending-checkout"}/>
            <SidebarItem icon={Banknote} label="Table Status" to="/cashier/tables" active={location.pathname === "/cashier/tables"}/>
            <SidebarItem icon={History} label="History & Refunds" to="/cashier/history-refund" active={location.pathname === "/cashier/history-refund"}/>
            <SidebarItem icon={RotateCcw} label="Revenue & Audit" to="/cashier/revenue-audit-log" active={location.pathname === "/cashier/revenue-audit-log"}/>
            <SidebarItem icon={Receipt} label="End of Day" to="/cashier/end-of-day" active={location.pathname === "/cashier/end-of-day"}/>
            <SidebarItem icon={Settings} label="Settings" to="/cashier/settings" active={location.pathname === "/cashier/settings"}/>
          </nav>

          {/* Support */}
          <div className="border-t border-white/5 p-3">
            <button type="button" onClick={() => navigate("/cashier/settings")} className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white">
              <LifeBuoy size={17}/>
              Help & Settings
            </button>
          </div>
        </aside>

        {/* ===================================================
         * MAIN
         * =================================================== */}

        <main className="min-w-0 flex-1">
          {(tablesQuery.isError || revenueQuery.isError) && (
            <div role="alert" className="m-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{tablesQuery.isError ? "Could not load tables." : "Could not load daily revenue."}</span>
              <button type="button" onClick={() => void Promise.all([tablesQuery.refetch(), revenueQuery.refetch()])} className="font-bold underline">Retry</button>
            </div>
          )}
          {transactionsQuery.isError && (
            <div role="alert" className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>Could not load recent cashier transactions.</span>
              <button type="button" onClick={() => void transactionsQuery.refetch()} className="font-bold underline">Retry</button>
            </div>
          )}
          {!tablesQuery.isLoading && !tablesQuery.isError && pendingOrders.length === 0 && (
            <div role="status" className="mx-4 mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">No open table orders.</div>
          )}
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
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

              <input type="text" placeholder="Tìm kiếm đơn hàng..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#d9531e] focus:bg-white focus:ring-2 focus:ring-[#d9531e]/10"/>
            </div>

            {/* Header actions */}
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => navigate(`/cashier/split-bill${selectedTable ? `?tableId=${encodeURIComponent(selectedTable.id)}` : ""}`)} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:flex">
                <Split size={15}/>
                Split Bill
              </button>

              <button type="button" className="hidden h-10 items-center gap-2 rounded-lg bg-[#c2410c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a83a0b] md:flex" onClick={() => setSelectedCash("exact")}>
                Quick Cash
              </button>

              <button type="button" onClick={() => window.alert("Cashier notifications are unavailable because the backend does not expose a notifications API.")} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" title="Notifications">
                <Bell size={18}/>

              </button>

              <button type="button" onClick={handleRefresh} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                <RefreshCw size={17} className={isRefreshing
            ? "animate-spin"
            : ""}/>
              </button>

              <button type="button" onClick={() => navigate("/cashier/settings")} aria-label="Open cashier settings" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
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
                          {selectedTable?.name ?? "No table selected"}
                        </h3>

                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                          {selectedTable?.status === "occupied" ? "Đang phục vụ" : selectedTable?.status === "reserved" ? "Đã đặt trước" : selectedTable?.status === "dirty" ? "Cần dọn dẹp" : selectedTable ? "Bàn trống" : "Không có bàn đang phục vụ"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {selectedOrderData.id ? `Hóa đơn ${selectedOrderData.id}` : "Chưa có hóa đơn"} • {selectedTable?.guests ?? 0} Khách
                      </p>
                    </div>

                    <button type="button" className="text-slate-400 transition hover:text-slate-700">
                      <MoreHorizontal size={18}/>
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
                    {orderItems.map((item) => (<div key={item.id} className="grid grid-cols-[1fr_45px_85px] gap-2 px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {item.name}
                          </p>

                          {item.note && (<p className="mt-1 text-[10px] text-slate-400">
                              ({item.note})
                            </p>)}
                        </div>

                        <span className="text-center text-xs text-slate-600">
                          {item.quantity}
                        </span>

                        <span className="text-right text-xs font-medium text-slate-700">
                          {new Intl.NumberFormat("vi-VN").format(item.price)}
                        </span>
                      </div>))}
                  </div>
                </div>

                {/* Price summary */}
                <div className="border-t border-slate-100 p-5">
                  <div className="space-y-3">
                    <PriceRow label="Tạm tính" value={formatCurrency(subtotal)}/>



                    {/* Discount */}
                    <div className="flex gap-2">
                      <input value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") {
                handleApplyDiscount();
            }
        }} placeholder="Mã giảm giá..." className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-[#d9531e] focus:ring-2 focus:ring-[#d9531e]/10"/>

                      <button type="button" onClick={handleApplyDiscount} className="h-9 shrink-0 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                        Áp dụng
                      </button>
                    </div>

                    {appliedDiscountCode && (<div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs">
                        <span className="font-medium text-emerald-700">
                          {appliedDiscountCode}
                        </span>

                        <span className="font-semibold text-emerald-600">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>)}
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
                  <button type="button" onClick={() => navigate(`/cashier/split-bill${selectedTable ? `?tableId=${encodeURIComponent(selectedTable.id)}` : ""}`)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]">
                    <Split size={14}/>
                    Tách Bill
                  </button>

                  <button type="button" onClick={() => navigate("/cashier/merge-bill")} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]">
                    <Plus size={14}/>
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
                        {new Intl.NumberFormat("vi-VN").format(selectedCashAmount)}
                        <span className="ml-1 text-xl font-semibold text-slate-500">
                          đ
                        </span>
                      </h3>
                    </div>

                    <button type="button" onClick={() => setSelectedCash("exact")} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Reset payment amount">
                      <X size={15}/>
                    </button>
                  </div>

                  {/* Quick cash */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {QUICK_CASH_OPTIONS.map((option) => {
            const active = selectedCash === option.id;
            return (<button key={option.id} type="button" onClick={() => setSelectedCash(option.id)} className={[
                    "h-9 rounded-lg border text-[10px] font-semibold transition sm:text-xs",
                    active
                        ? "border-[#d9531e] bg-[#fff7f3] text-[#c2410c] shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}>
                          {option.label}
                        </button>);
        })}
                  </div>
                </div>

                {/* Payment methods */}
                <div className="grid flex-1 grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const active = selectedPayment === method.id;
            return (<button key={method.id} type="button" onClick={() => setSelectedPayment(method.id)} className={[
                    "group relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border bg-white p-5 transition duration-200",
                    "active:scale-[0.98]",
                    active
                        ? "border-[#d9531e] bg-[#fffaf7] shadow-md ring-2 ring-[#d9531e]/10"
                        : "border-slate-200/70 shadow-sm hover:-translate-y-0.5 hover:border-[#d9531e]/40 hover:shadow-md",
                ].join(" ")}>
                        {active && (<span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#c2410c]"/>)}

                        <div className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl transition",
                    active
                        ? "bg-[#fff0e9] text-[#c2410c]"
                        : "bg-slate-50 text-[#c2410c] group-hover:bg-[#fff0e9]",
                ].join(" ")}>
                          <Icon size={23} strokeWidth={1.8}/>
                        </div>

                        <span className={[
                    "mt-4 text-xs font-semibold",
                    active
                        ? "text-[#c2410c]"
                        : "text-slate-600",
                ].join(" ")}>
                          {method.label}
                        </span>

                        {active && (<span className="mt-1 text-[10px] text-slate-400">
                            Đã chọn
                          </span>)}
                      </button>);
        })}
                </div>

                <p className="text-center text-[10px] text-slate-500">
                  Chỉ ghi nhận giao dịch trong ROMS; không kết nối ngân hàng, ví điện tử hoặc cổng QR.
                </p>

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

                    <button type="button" onClick={handlePayment} disabled={CASHIER_DEV_READ_ONLY || isProcessingPayment || !selectedTable} className="rounded-xl bg-[#c2410c] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#a83a0b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                      {isProcessingPayment ? "Đang xử lý…" : "Thanh toán"}
                    </button>
                  </div>

                  {selectedCashAmount > total && (<div className="mt-3 flex items-center justify-between border-t border-[#efd0c3] pt-3 text-xs">
                      <span className="text-[#a96850]">
                        Tiền thừa
                      </span>

                      <span className="font-bold text-[#c2410c]">
                        {formatCurrency(selectedCashAmount - total)}
                      </span>
                    </div>)}
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

                    <button type="button" className="text-slate-400 hover:text-slate-700">
                      <MoreHorizontal size={17}/>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pendingOrders.map((order) => {
            const active = selectedPendingOrder === order.id;
            return (<button key={order.id} type="button" onClick={() => setSelectedPendingOrder(order.id)} className={[
                    "w-full px-4 py-3 text-left transition",
                    active
                        ? "bg-[#fff8f4]"
                        : "hover:bg-slate-50",
                ].join(" ")}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {order.table}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 align-middle"/>{" "}
                                <span className="ml-1">
                                  {order.elapsed}
                                </span>
                              </p>
                            </div>

                            <span className="text-xs font-bold text-[#c2410c]">
                              {formatShortCurrency(order.amount)}
                            </span>
                          </div>
                        </button>);
        })}
                  </div>
                </section>

                {/* Recent transactions */}
                <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Lịch Sử Giao Dịch
                    </h3>

                    <button type="button" className="text-slate-400 hover:text-slate-700">
                      <MoreHorizontal size={17}/>
                    </button>
                  </div>

                  <div className="flex-1 divide-y divide-slate-100">
                    {transactionsQuery.isLoading && <div role="status" className="px-4 py-4 text-xs text-slate-500">Loading transactions…</div>}
                    {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length === 0 && <div className="px-4 py-4 text-xs text-slate-500">No transactions found.</div>}
                    {transactions.map((transaction) => (<div key={transaction.id} className="px-4 py-4">
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
                              {formatCurrency(transaction.amount)}
                            </p>

                            <p className={`mt-1 text-[9px] ${transaction.status === "Refunded" ? "text-rose-500" : transaction.status === "Completed" ? "text-emerald-500" : "text-amber-600"}`}>
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      </div>))}
                  </div>

                  <button type="button" onClick={() => navigate("/cashier/history-refund")} className="border-t border-slate-100 px-4 py-4 text-center text-[10px] font-semibold text-[#c2410c] transition hover:bg-[#fff8f4]">
                    Xem tất cả
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>);
};
/* =========================================================
 * SIDEBAR ITEM
 * ========================================================= */
interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    active?: boolean;
}
const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active = false, }) => {
    const navigate = useNavigate();
    return (<button type="button" onClick={() => navigate(to)} aria-current={active ? "page" : undefined} className={[
            "group relative mb-1 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition",
            active
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
        ].join(" ")}>
      {active && (<span className="absolute left-0 top-2.5 h-6 w-0.5 rounded-r-full bg-[#f35b25]"/>)}

      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active
            ? "text-[#f35b25]"
            : "text-slate-400 group-hover:text-white"}/>

      <span className={active ? "font-semibold" : "font-medium"}>
        {label}
      </span>
    </button>);
};
/* =========================================================
 * PRICE ROW
 * ========================================================= */
interface PriceRowProps {
    label: string;
    value: string;
}
const PriceRow: React.FC<PriceRowProps> = ({ label, value, }) => {
    return (<div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>

      <span className="font-medium text-slate-600">
        {value}
      </span>
    </div>);
};
export default CashierCheckoutPage;
