
import React, { useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  Banknote,
  CreditCard,
  MoreHorizontal,
  QrCode,
  RefreshCw,
  Search,
  Split,
  WalletCards,
  X,
} from "lucide-react";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import { queryKeys } from "@/constants/queryKeys";
import { cashierService } from "@/services/modules/cashierService";
import { reportsService } from "@/services/modules/reportsService";
import { CASHIER_DEV_READ_ONLY } from "./cashierPreviewMode";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface OrderItem {
  id: string;
  name: string;
  note?: string;
  quantity: number;
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
  invoiceId: string;
  table: string;
  paymentMethod: string;
  timestamp: string;
  amount: number;
  status: "Completed" | "Processing" | "Refunded" | "Failed";
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
    label: "Cash",
    icon: Banknote,
  },
  {
    id: "card",
    label: "Bank Transfer",
    icon: CreditCard,
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    icon: WalletCards,
  },
  {
    id: "qr",
    label: "QR Transfer",
    icon: QrCode,
  },
];

const QUICK_CASH_OPTIONS = [
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
    return `${(value / 1_000_000).toFixed(
      value % 1_000_000 === 0 ? 0 : 2,
    )}M`;
  }

  return `${Math.round(value / 1_000)}K`;
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }

  return error instanceof Error ? error.message : fallback;
};

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case "CASH":
      return "Cash";
    case "BANK_TRANSFER":
      return "Bank Card";
    case "MOMO":
      return "E-Wallet";
    case "VNPAY":
      return "QR Transfer";
    default:
      return method;
  }
};

/* =========================================================
 * COMPONENT
 * ========================================================= */

const CashierCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: queryKeys.cashier.tables(),
    queryFn: cashierService.getTables,
    staleTime: 60_000,
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.analytics.revenue({ period: "day" }),
    queryFn: () => reportsService.getRevenueSummary({ period: "day" }),
    staleTime: 60_000,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.cashier.transactionPage({ page: 1, limit: 5 }),
    queryFn: () => cashierService.getTransactions({ page: 1, limit: 5 }),
    staleTime: 60_000,
  });

  const tableData = useMemo(() => tablesQuery.data ?? [], [tablesQuery.data]);
  const pendingOrders = useMemo<PendingOrder[]>(
    () =>
      tableData
        .filter(
          (table) =>
            table.status === "occupied" &&
            (Boolean(table.orderId) || (table.orderItems?.length ?? 0) > 0),
        )
        .map((table) => ({
          id: table.orderId ?? table.id,
          table: table.name,
          elapsed: table.timer ?? "Now",
          amount: Number(table.total ?? 0),
        })),
    [tableData],
  );

  const transactions = useMemo<Transaction[]>(
    () =>
      (transactionsQuery.data?.data ?? []).map((item) => ({
        id: item.id,
        invoiceId: item.invoiceId,
        table: item.tableName,
        paymentMethod: item.paymentMethod,
        timestamp: `${item.date} ${item.time}`,
        amount: item.amount,
        status:
          item.status === "REFUNDED"
            ? "Refunded"
            : item.status === "PENDING"
              ? "Processing"
              : item.status === "FAILED"
                ? "Failed"
                : "Completed",
      })),
    [transactionsQuery.data],
  );

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("cash");

  const [selectedCash, setSelectedCash] =
    useState("exact");

  const [discountCode, setDiscountCode] =
    useState("");

  const [appliedDiscountCode, setAppliedDiscountCode] =
    useState("");

  const [discountAmount, setDiscountAmount] =
    useState(0);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isProcessingPayment, setIsProcessingPayment] =
    useState(false);

  const [selectedPendingOrder, setSelectedPendingOrder] =
    useState<string | null>(null);

  /* =========================================================
   * SELECTED ORDER
   * ========================================================= */

  const selectedOrderData = useMemo(
    () => {
      const requestedTable = tableData.find(
        (table) => table.id === searchParams.get("tableId"),
      );
      return pendingOrders.find((order) => order.id === selectedPendingOrder) ??
      pendingOrders.find((order) => order.id === requestedTable?.orderId) ??
      pendingOrders[0] ?? {
        id: "",
        table: tablesQuery.isLoading
          ? "Loading tables…"
          : tablesQuery.isError
            ? "Unable to load orders"
            : "No open orders",
        elapsed: "",
        amount: 0,
      };
    },
    [pendingOrders, selectedPendingOrder, searchParams, tableData, tablesQuery.isError, tablesQuery.isLoading],
  );

  const selectedTable = useMemo(
    () =>
      tableData.find(
        (table) => table.orderId === selectedOrderData.id,
      ) ?? null,
    [selectedOrderData.id, tableData],
  );

  const selectedOrderItems = useMemo(
    () =>
      (selectedTable?.orderItems ?? []).map((item) => ({
        ...item,
        id: `${selectedTable?.id ?? item.id}-${item.id}`,
        name: item.name,
      })),
    [selectedTable],
  );

  /* =========================================================
   * CALCULATIONS
   * ========================================================= */

  const subtotal = useMemo(() => {
    return selectedOrderData.amount;
  }, [selectedOrderData]);

  const total = useMemo(() => {
    return selectedTable?.unpaidBill?.finalAmount ?? subtotal - discountAmount;
  }, [selectedTable, subtotal, discountAmount]);
  const displayedDiscountCode =
    appliedDiscountCode || selectedTable?.unpaidBill?.promotionCode || "";
  const displayedDiscountAmount = appliedDiscountCode
    ? discountAmount
    : selectedTable?.unpaidBill?.discountAmount ?? 0;

  const selectedCashAmount =
    (selectedCash === "exact" ? total : QUICK_CASH_OPTIONS.find(
      (option) => option.id === selectedCash,
    )?.amount) ?? total;

  /* =========================================================
   * HANDLERS
   * ========================================================= */

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
      const promotion = await cashierService.validatePromotion({ code, subtotal });
      setDiscountAmount(promotion.discountAmount);
      setAppliedDiscountCode(code);
    } catch (error) {
      setDiscountAmount(0);
      setAppliedDiscountCode("");
      alert(getRequestErrorMessage(error, "The promotion could not be validated."));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    void Promise.all([
      tablesQuery.refetch(),
      revenueQuery.refetch(),
      transactionsQuery.refetch(),
    ]).finally(() => setIsRefreshing(false));
  };

  const handlePayment = async () => {
    if (CASHIER_DEV_READ_ONLY) {
      alert("Payment is disabled in development read-only preview mode.");
      return;
    }
    if (!selectedTable) {
      alert("Select an open table before taking payment.");
      return;
    }

    const paymentLabel =
      PAYMENT_METHODS.find(
        (method) => method.id === selectedPayment,
      )?.label ?? "Payment";

    setIsProcessingPayment(true);
    try {
      const tableOrder = await cashierService.getTableOrder(selectedTable.id);
      const sessionId = tableOrder.diningSession?.id;
      if (!sessionId) {
        throw new Error("This table has no active dining session.");
      }

      const existingBill = tableOrder.bills.find((bill) => bill.status === "UNPAID");
      if (
        existingBill &&
        appliedDiscountCode &&
        (existingBill.promotionCode?.toUpperCase() ?? "") !==
          appliedDiscountCode.toUpperCase()
      ) {
        throw new Error(
          existingBill.promotionCode
            ? `An unpaid bill already uses promotion ${existingBill.promotionCode}. Apply that promotion to continue.`
            : "An unpaid bill already exists without a promotion. Clear the applied promotion to continue.",
        );
      }
      const bill = existingBill ?? await cashierService.createBill(sessionId, {
        promotionCode: appliedDiscountCode || undefined,
      });

      if (selectedPayment === "cash" && selectedCashAmount < bill.finalAmount) {
        throw new Error("The cash amount must cover the final bill total.");
      }

      await cashierService.createPayment({
        billId: bill.id,
        paymentMethod: selectedPayment,
        amountPaid: selectedPayment === "cash" ? selectedCashAmount : bill.finalAmount,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.cashier.tables() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.revenue() }),
        queryClient.invalidateQueries({ queryKey: ["analytics", "end-of-day"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cashier.transactions() }),
        queryClient.invalidateQueries({ queryKey: ["cashier", "audit-logs"] }),
      ]);
      setSelectedPendingOrder(null);
      setDiscountCode("");
      setAppliedDiscountCode("");
      setDiscountAmount(0);
      alert(`Payment ${bill.billCode} recorded using ${paymentLabel}.`);
    } catch (error) {
      alert(getRequestErrorMessage(error, "The payment could not be completed."));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMergeBill = () => {
    navigate("/cashier/merge-bill");
  };

  const handleSplitBill = () => {
    if (!selectedTable) {
      alert("Select an open table before splitting a bill.");
      return;
    }
    navigate(`/cashier/split-bill?tableId=${encodeURIComponent(selectedTable.id)}`);
  };

  /* =========================================================
   * RENDER
   * ========================================================= */

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      <div className="flex h-full min-h-0">

        {/* ===================================================
         * SIDEBAR
         * =================================================== */}

        <CashierSidebar />

        {/* ===================================================
         * MAIN AREA
         * =================================================== */}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {tablesQuery.isError && (
            <div role="alert" className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>Could not load tables from the cashier API.</span>
              <button type="button" onClick={() => void tablesQuery.refetch()} className="font-bold underline">Retry</button>
            </div>
          )}
          {revenueQuery.isError && (
            <div role="alert" className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>Could not load daily revenue.</span>
              <button type="button" onClick={() => void revenueQuery.refetch()} className="font-bold underline">Retry</button>
            </div>
          )}
          {!tablesQuery.isLoading && !tablesQuery.isError && pendingOrders.length === 0 && (
            <div role="status" className="mx-4 mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">No open table orders.</div>
          )}

          {/* =================================================
           * HEADER
           * ================================================= */}

          <header className="flex h-[76px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 xl:px-6">

            {/* MOBILE BRAND */}

            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c2410c] text-sm font-bold text-white">
                B
              </div>

              <span className="text-[16px] font-bold text-slate-900">
                Bistro POS
              </span>
            </div>

            {/* TITLE */}

            <h2 className="shrink-0 text-[24px] font-bold tracking-tight text-slate-900">
              Checkout Express
            </h2>

            {/* SEARCH */}

            <div className="relative ml-2 hidden max-w-[340px] flex-1 lg:block">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search orders..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-[#d9531e] focus:bg-white focus:ring-2 focus:ring-[#d9531e]/10"
              />
            </div>

            <div className="hidden min-w-0 flex-col border-l border-slate-200 pl-4 md:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Today&apos;s net revenue
              </span>
              <span className="text-sm font-bold text-slate-800">
                {revenueQuery.isPending
                  ? "Loading…"
                  : revenueQuery.isError
                    ? "Unavailable"
                    : formatCurrency(revenueQuery.data.summary.netRevenue)}
              </span>
            </div>

            {/* HEADER ACTIONS */}

            <div className="ml-auto flex shrink-0 items-center gap-2">

              {/* MERGE */}

              <button
                type="button"
                onClick={handleMergeBill}
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 lg:flex"
              >
                <WalletCards size={17} />
                Merge Bill
              </button>

              {/* SPLIT */}

              <button
                type="button"
                onClick={handleSplitBill}
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 xl:flex"
              >
                <Split size={17} />
                Split Bill
              </button>

              {/* QUICK CASH */}

              <button
                type="button"
                onClick={() => setSelectedCash("exact")}
                className="hidden h-10 items-center gap-2 rounded-xl bg-[#c2410c] px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#a83a0b] md:flex"
              >
                <Banknote size={17} />
                Quick Cash
              </button>

              {/* NOTIFICATION */}

              <button
                type="button"
                onClick={() => window.alert("Cashier notifications are unavailable because the backend does not expose a notifications API.")}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Bell size={20} />

              </button>

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <RefreshCw
                  size={18}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              {/* USER */}

              <button
                type="button"
                onClick={() => navigate("/cashier/settings")}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-[12px] font-bold text-white"
              >
                TL
              </button>

            </div>
          </header>

          {/* =================================================
           * CONTENT WORKSPACE
           * ================================================= */}

          <div className="min-h-0 flex-1 overflow-hidden p-4 xl:p-5">

            <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.25fr)_300px]">

              {/* =================================================
               * COLUMN 1 — ORDER
               * ================================================= */}

              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">

                {/* ORDER HEADER */}

                <div className="shrink-0 border-b border-slate-100 px-5 py-4">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h3 className="truncate text-[19px] font-bold text-slate-900">
                          {selectedOrderData.table}
                        </h3>

                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                          Serving
                        </span>

                      </div>

                      <p className="mt-1.5 truncate text-[11px] text-slate-400">
                        Order #{selectedOrderData.id} • Awaiting payment
                      </p>

                    </div>

                    <button
                      type="button"
                      className="shrink-0 text-slate-400 transition hover:text-slate-700"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                  </div>

                </div>

                {/* ITEM HEADER */}

                <div className="grid shrink-0 grid-cols-[1fr_45px_95px] border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <span>Item</span>

                  <span className="text-center">
                    Qty
                  </span>

                  <span className="text-right">
                    Price
                  </span>
                </div>

                {/* ITEMS */}

                <div className="min-h-0 flex-1 overflow-y-auto">

                  <div className="divide-y divide-slate-100">

                    {selectedOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_45px_95px] gap-2 px-5 py-3.5"
                      >

                        <div className="min-w-0">

                          <p className="truncate text-[13px] font-semibold text-slate-700">
                            {item.name}
                          </p>

                          {item.note && (
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              ({item.note})
                            </p>
                          )}

                        </div>

                        <span className="text-center text-[12px] font-medium text-slate-600">
                          {item.quantity}
                        </span>

                        <span className="text-right text-[12px] font-semibold text-slate-700">
                          {new Intl.NumberFormat(
                            "vi-VN",
                          ).format(item.price)}
                        </span>

                      </div>
                    ))}

                  </div>

                </div>

                {/* PRICE SUMMARY */}

                <div className="shrink-0 border-t border-slate-100 p-5">

                  <div className="space-y-3">

                    <PriceRow
                      label="Subtotal"
                      value={formatCurrency(subtotal)}
                    />

                    {/* DISCOUNT */}

                    <div className="flex gap-2">

                      <input
                        value={discountCode}
                        onChange={(event) =>
                          setDiscountCode(
                            event.target.value,
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter"
                          ) {
                            handleApplyDiscount();
                          }
                        }}
                        placeholder="Discount code..."
                        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-[#d9531e] focus:ring-2 focus:ring-[#d9531e]/10"
                      />

                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-[11px] font-bold text-white transition hover:bg-slate-800"
                      >
                        Apply
                      </button>

                    </div>

                    {displayedDiscountCode && (
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-[11px]">

                        <span className="font-medium text-emerald-600">
                          Code {displayedDiscountCode}
                        </span>

                        <span className="font-bold text-emerald-600">
                          -
                          {formatCurrency(
                            displayedDiscountAmount,
                          )}
                        </span>

                      </div>
                    )}

                    {/* TOTAL */}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">

                      <span className="text-[13px] font-bold text-slate-700">
                        Total
                      </span>

                      <span className="text-[20px] font-bold text-[#c2410c]">
                        {formatCurrency(total)}
                      </span>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
               * COLUMN 2 — PAYMENT
               * ================================================= */}

              <section className="flex min-h-0 flex-col gap-4">

                {/* PAYMENT AMOUNT */}

                <div className="shrink-0 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[11px] font-medium text-slate-400">
                        Amount received
                      </p>

                      <h3 className="mt-1 flex items-center text-[28px] font-bold tracking-tight text-slate-900">

                        {new Intl.NumberFormat(
                          "vi-VN",
                        ).format(
                          selectedCashAmount,
                        )}

                        <span className="ml-1.5 text-[19px] font-semibold text-slate-500">
                          đ
                        </span>

                      </h3>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCash("exact")
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Reset payment amount"
                    >
                      <X size={17} />
                    </button>

                  </div>

                  {/* QUICK CASH */}

                  <div className="mt-4 grid grid-cols-4 gap-2">

                    {[{ id: "exact", label: "Exact" }, ...QUICK_CASH_OPTIONS].map(
                      (option) => {

                        const active =
                          selectedCash ===
                          option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setSelectedCash(
                                option.id,
                              )
                            }
                            className={[
                              "h-10 rounded-lg border text-[10px] font-bold transition",
                              active
                                ? "border-[#d9531e] bg-[#fff7f3] text-[#c2410c] shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {option.label}
                          </button>
                        );
                      },
                    )}

                  </div>

                </div>

                {/* PAYMENT METHODS */}

                <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">

                  {PAYMENT_METHODS.map(
                    (method) => {

                      const Icon =
                        method.icon;

                      const active =
                        selectedPayment ===
                        method.id;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() =>
                            setSelectedPayment(
                              method.id,
                            )
                          }
                          className={[
                            "group relative flex min-h-0 flex-col items-center justify-center rounded-2xl border bg-white p-4 transition duration-200",
                            "active:scale-[0.98]",
                            active
                              ? "border-[#d9531e] bg-[#fffaf7] shadow-md ring-2 ring-[#d9531e]/10"
                              : "border-slate-200/70 shadow-sm hover:-translate-y-0.5 hover:border-[#d9531e]/40 hover:shadow-md",
                          ].join(" ")}
                        >

                          {active && (
                            <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[#c2410c]" />
                          )}

                          <div
                            className={[
                              "flex h-12 w-12 items-center justify-center rounded-xl transition",
                              active
                                ? "bg-[#fff0e9] text-[#c2410c]"
                                : "bg-slate-50 text-[#c2410c] group-hover:bg-[#fff0e9]",
                            ].join(" ")}
                          >
                            <Icon
                              size={24}
                              strokeWidth={1.8}
                            />
                          </div>

                          <span
                            className={[
                              "mt-3 text-[13px] font-bold",
                              active
                                ? "text-[#c2410c]"
                                : "text-slate-600",
                            ].join(" ")}
                          >
                            {method.label}
                          </span>

                          {active && (
                            <span className="mt-1 text-[10px] text-slate-400">
                              Selected
                            </span>
                          )}

                        </button>
                      );
                    },
                  )}

                </div>
                <p className="text-center text-[10px] text-slate-500">
                  Payments are recorded in ROMS only; no external bank, wallet, or QR provider is contacted.
                </p>

                {/* PAYMENT SUMMARY */}

                <div className="shrink-0 rounded-2xl border border-[#f4d9ce] bg-[#fff3ed] p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-[11px] text-[#b86a4b]">
                        Total amount due
                      </p>

                      <p className="mt-1 text-[22px] font-bold tracking-tight text-[#c2410c]">
                        {formatCurrency(
                          total,
                        )}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={CASHIER_DEV_READ_ONLY || isProcessingPayment || !selectedTable}
                      className="rounded-xl bg-[#c2410c] px-6 py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#a83a0b] active:scale-[0.98]"
                    >
                      {isProcessingPayment ? "Processing…" : "Pay"}
                    </button>

                  </div>

                  {selectedCashAmount >
                    total && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#efd0c3] pt-3 text-[11px]">

                      <span className="text-[#a96850]">
                        Change
                      </span>

                      <span className="text-[13px] font-bold text-[#c2410c]">
                        {formatCurrency(
                          selectedCashAmount -
                            total,
                        )}
                      </span>

                    </div>
                  )}

                </div>

              </section>

              {/* =================================================
               * COLUMN 3
               * ================================================= */}

              <aside className="flex min-h-0 flex-col gap-4">

                {/* WAITING PAYMENT */}

                <section className="shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                    <div className="flex items-center gap-2">

                      <h3 className="text-[14px] font-bold text-slate-800">
                        Pending Payment
                      </h3>

                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 px-1.5 text-[10px] font-bold text-red-500">
                        {pendingOrders.length}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                  </div>

                  <div className="divide-y divide-slate-100">

                    {tablesQuery.isLoading ? (
                      <p className="px-4 py-5 text-center text-xs text-slate-500">
                        Loading pending orders…
                      </p>
                    ) : tablesQuery.isError ? (
                      <div className="px-4 py-5 text-center">
                        <p role="alert" className="text-xs font-semibold text-red-700">
                          Pending orders could not be loaded.
                        </p>
                        <button
                          type="button"
                          onClick={() => void tablesQuery.refetch()}
                          className="mt-2 text-xs font-bold text-[#c2410c] underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : pendingOrders.length === 0 ? (
                      <p className="px-4 py-5 text-center text-xs text-slate-500">
                        No pending payments.
                      </p>
                    ) : pendingOrders.map(
                      (order) => {

                        const active = selectedOrderData.id === order.id;

                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => {
                              setSelectedPendingOrder(
                                order.id,
                              );
                              setDiscountCode("");
                              setAppliedDiscountCode("");
                              setDiscountAmount(0);
                            }}
                            className={[
                              "w-full px-4 py-3 text-left transition",
                              active
                                ? "bg-[#fff8f4]"
                                : "hover:bg-slate-50",
                            ].join(" ")}
                          >

                            <div className="flex items-center justify-between gap-3">

                              <div className="min-w-0">

                                <p className="truncate text-[12px] font-bold text-slate-700">
                                  {order.table}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">

                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 align-middle" />

                                  <span className="ml-1.5">
                                    {order.elapsed}
                                  </span>

                                </p>

                              </div>

                              <span className="shrink-0 text-[12px] font-bold text-[#c2410c]">
                                {formatShortCurrency(
                                  order.amount,
                                )}
                              </span>

                            </div>

                          </button>
                        );
                      },
                    )}

                  </div>

                </section>

                {/* TRANSACTIONS */}

                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">

                  <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">

                    <h3 className="text-[14px] font-bold text-slate-800">
                      Transaction History
                    </h3>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100">

                    {transactionsQuery.isPending ? (
                      <p className="px-4 py-5 text-center text-xs text-slate-500">
                        Loading transactions…
                      </p>
                    ) : transactionsQuery.isError ? (
                      <div className="px-4 py-5 text-center">
                        <p role="alert" className="text-xs font-semibold text-red-700">
                          Transactions could not be loaded.
                        </p>
                        <button
                          type="button"
                          onClick={() => void transactionsQuery.refetch()}
                          className="mt-2 text-xs font-bold text-[#c2410c] underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : transactions.length === 0 ? (
                      <p className="px-4 py-5 text-center text-xs text-slate-500">
                        No transactions yet.
                      </p>
                    ) : transactions.map(
                      (transaction) => (

                        <button
                          type="button"
                          key={transaction.id}
                          onClick={() =>
                            navigate(
                              `/cashier/history-refund?orderId=${encodeURIComponent(transaction.id)}&date=${encodeURIComponent(transaction.timestamp.slice(0, 10))}`,
                            )
                          }
                          className="w-full px-4 py-3.5 text-left transition hover:bg-slate-50"
                        >

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <p className="truncate text-[11px] font-bold text-slate-800">

                                {transaction.invoiceId}

                                <span className="font-normal text-slate-400">
                                  {" "}
                                  ({transaction.table})
                                </span>

                              </p>

                              <p className="mt-1 truncate text-[9px] text-slate-400">
                                {formatPaymentMethod(transaction.paymentMethod)}{" "}
                                •{" "}
                                {transaction.timestamp}
                              </p>

                            </div>

                            <div className="shrink-0 text-right">

                              <p className="text-[10px] font-bold text-slate-700">
                                {formatCurrency(
                                  transaction.amount,
                                )}
                              </p>

                              <p className={`mt-1 text-[9px] ${
                                transaction.status === "Completed"
                                  ? "text-emerald-500"
                                  : transaction.status === "Processing"
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }`}>
                                {transaction.status}
                              </p>

                            </div>

                          </div>

                        </button>
                      ),
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/cashier/history-refund",
                      )
                    }
                    className="shrink-0 border-t border-slate-100 px-4 py-3.5 text-center text-[11px] font-bold text-[#c2410c] transition hover:bg-[#fff8f4]"
                  >
                    View all
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
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-semibold text-slate-600">
        {value}
      </span>
    </div>
  );
};

export default CashierCheckoutPage;
