import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import {
  Bell,
  Check,
  CreditCard,
  Download,
  FileText,
  Filter,
  LockKeyhole,
  Printer,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Search,
  Smartphone,
  UserCircle,
  X,
  Banknote,
  AlertCircle,
  Clock3,
  ArrowDownLeft,
} from "lucide-react";

/* =========================================================
 * Types
 * ======================================================= */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | "completed"
  | "pending"
  | "refunded";

export type PaymentMethod =
  | "credit_card"
  | "cash"
  | "e_wallet";

export interface OrderTransaction {
  id: string;
  date: string;
  time: string;
  table: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  cardLast4?: string;
}

export type RefundReason =
  | "cancel"
  | "food_error"
  | "slow_service"
  | "payment_error"
  | "wrong_order"
  | "other";

export interface RefundPayload {
  orderId: string;
  amount: number;
  reason: RefundReason;
  note?: string;
  managerPin: string;
  refundMethod: "cash" | "original";
  itemIds?: string[];
}

/* =========================================================
 * Constants
 * ======================================================= */

const TAX_RATE = 0.1;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  credit_card: "Credit Card",
  cash: "Cash",
  e_wallet: "E-Wallet",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  refunded: "Refunded",
};

const REFUND_REASONS: {
  value: RefundReason;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    value: "cancel",
    icon: <X size={24} />,
    title: "Customer Changed Mind / Cancelled",
    description: "Cancel the order before preparation",
  },
  {
    value: "food_error",
    icon: <AlertCircle size={24} />,
    title: "Food Quality Issue",
    description: "Incorrect order / foreign object",
  },
  {
    value: "slow_service",
    icon: <Clock3 size={24} />,
    title: "Service Too Slow",
    description: "Customer does not want to wait",
  },
  {
    value: "payment_error",
    icon: <CreditCard size={24} />,
    title: "Incorrect Payment",
    description: "Payment error / duplicate card charge",
  },
  {
    value: "wrong_order",
    icon: <RotateCcw size={24} />,
    title: "Wrong Table / Order",
    description: "Incorrect order or table assignment",
  },
  {
    value: "other",
    icon: <FileText size={24} />,
    title: "Other Reason",
    description: "Enter a detailed explanation",
  },
];

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character
  );

const createPrintableReceipt = (order: OrderTransaction) => {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}<br /><small>x${item.quantity}</small></td>
          <td>${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
    <html><head><title>Receipt ${escapeHtml(order.id)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 32px auto; max-width: 420px; }
      h1 { font-size: 22px; margin: 0 0 6px; }
      p { color: #4b5563; margin: 4px 0; }
      table { border-collapse: collapse; margin: 24px 0; width: 100%; }
      td { border-bottom: 1px solid #e5e7eb; padding: 10px 0; vertical-align: top; }
      td:last-child { text-align: right; white-space: nowrap; }
      small { color: #6b7280; }
      .total { font-size: 18px; font-weight: 700; }
      .summary { display: flex; justify-content: space-between; margin: 8px 0; }
      @media print { body { margin: 0; } }
    </style></head><body>
      <h1>ROMS Restaurant</h1>
      <p>Receipt ${escapeHtml(order.id)}</p>
      <p>${escapeHtml(order.date)} ${escapeHtml(order.time)} | ${escapeHtml(order.table)}</p>
      <table><tbody>${items}</tbody></table>
      <div class="summary"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="summary"><span>Tax (10%)</span><span>${formatCurrency(tax)}</span></div>
      <div class="summary total"><span>Total</span><span>${formatCurrency(total)}</span></div>
      <p>Payment: ${escapeHtml(PAYMENT_LABEL[order.paymentMethod])}</p>
    </body></html>`;
};

/* =========================================================
 * Mock Data
 * ======================================================= */

const INITIAL_ORDERS: OrderTransaction[] = [
  {
    id: "#ORD-892",
    date: "2026-08-24",
    time: "14:30",
    table: "Table 12",
    amount: 850000,
    paymentMethod: "credit_card",
    status: "completed",
    cardLast4: "4242",
    items: [
      {
        id: "steak",
        name: "US Beef Steak (Medium Rare)",
        quantity: 1,
        unitPrice: 450000,
      },
      {
        id: "salmon",
        name: "Salmon Salad",
        quantity: 1,
        unitPrice: 150000,
      },
      {
        id: "wine",
        name: "Red Wine (Glass)",
        quantity: 2,
        unitPrice: 125000,
      },
    ],
  },
  {
    id: "#ORD-891",
    date: "2026-08-24",
    time: "14:15",
    table: "Table 04",
    amount: 1250000,
    paymentMethod: "cash",
    status: "completed",
    items: [
      {
        id: "beef",
        name: "Beef Steak",
        quantity: 2,
        unitPrice: 400000,
      },
      {
        id: "potato",
        name: "French Fries",
        quantity: 2,
        unitPrice: 100000,
      },
      {
        id: "drink",
        name: "Soft Drink",
        quantity: 2,
        unitPrice: 125000,
      },
    ],
  },
  {
    id: "#ORD-890",
    date: "2026-08-24",
    time: "13:45",
    table: "Takeaway",
    amount: 320000,
    paymentMethod: "e_wallet",
    status: "pending",
    items: [
      {
        id: "burger",
        name: "Cheeseburger",
        quantity: 2,
        unitPrice: 140000,
      },
      {
        id: "fries",
        name: "French Fries",
        quantity: 1,
        unitPrice: 40000,
      },
    ],
  },
  {
    id: "#ORD-889",
    date: "2026-08-23",
    time: "13:10",
    table: "Table 08",
    amount: 450000,
    paymentMethod: "credit_card",
    status: "refunded",
    cardLast4: "7812",
    items: [
      {
        id: "pasta",
        name: "Seafood Pasta",
        quantity: 1,
        unitPrice: 300000,
      },
      {
        id: "water",
        name: "Bottled Water",
        quantity: 2,
        unitPrice: 75000,
      },
    ],
  },
  {
    id: "#ORD-888",
    date: "2026-08-23",
    time: "12:30",
    table: "Table 02",
    amount: 2100000,
    paymentMethod: "cash",
    status: "completed",
    items: [
      {
        id: "ribeye",
        name: "Ribeye Steak",
        quantity: 2,
        unitPrice: 750000,
      },
      {
        id: "salad2",
        name: "Caesar Salad",
        quantity: 2,
        unitPrice: 150000,
      },
      {
        id: "juice",
        name: "Fresh Orange Juice",
        quantity: 2,
        unitPrice: 150000,
      },
    ],
  },
  {
    id: "#ORD-887",
    date: "2026-08-23",
    time: "12:15",
    table: "Table 05",
    amount: 650000,
    paymentMethod: "credit_card",
    status: "completed",
    cardLast4: "3389",
    items: [
      {
        id: "chicken",
        name: "Herb Roasted Chicken",
        quantity: 1,
        unitPrice: 450000,
      },
      {
        id: "cola",
        name: "Coca Cola",
        quantity: 2,
        unitPrice: 100000,
      },
    ],
  },
];

/* =========================================================
 * Small UI Components
 * ======================================================= */

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    completed:
      "bg-emerald-100 text-emerald-700 border border-emerald-200",
    pending:
      "bg-amber-100 text-amber-700 border border-amber-200",
    refunded:
      "bg-rose-100 text-rose-700 border border-rose-200",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function PaymentIcon({
  method,
  size = 18,
}: {
  method: PaymentMethod;
  size?: number;
}) {
  if (method === "credit_card") {
    return <CreditCard size={size} />;
  }

  if (method === "e_wallet") {
    return <Smartphone size={size} />;
  }

  return <Banknote size={size} />;
}

/* =========================================================
 * Top Header
 * ======================================================= */

function TopHeader({
  search,
  setSearch,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) {
  const navigate = useNavigate();

  return (
    <header className="flex h-[76px] shrink-0 items-center border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-7">
        <h1 className="text-[26px] font-black tracking-tight text-slate-800">
          Checkout Express
        </h1>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, table number..."
            className="h-12 w-[390px] rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[15px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw size={19} />
        </button>

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          title="Notifications"
          onClick={() => window.alert("You have no new notifications.")}
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500"
          title="User profile"
          onClick={() => navigate("/cashier/settings")}
        >
          <UserCircle size={25} />
        </button>
      </div>
    </header>
  );
}

/* =========================================================
 * History Table
 * ======================================================= */

function HistoryTable({
  orders,
  selectedId,
  onSelect,
  selectedDate,
  onDateChange,
  onExport,
}: {
  orders: OrderTransaction[];
  selectedId: string;
  onSelect: (order: OrderTransaction) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Panel header */}
      <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">
            Today&apos;s Transactions
          </h2>

          <p className="mt-0.5 text-sm font-medium text-slate-400">
            {orders.length} transaction
            {orders.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600">
            <Filter size={17} />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                onDateChange(event.target.value)
              }
              className="bg-transparent text-sm font-semibold outline-none"
              aria-label="Filter by date"
            />
          </label>

          <button
            type="button"
            onClick={onExport}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <Download size={17} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="h-full overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Order ID
              </th>

              <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Time
              </th>

              <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Table
              </th>

              <th className="px-5 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const selected = selectedId === order.id;

              return (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order)}
                  className={`cursor-pointer border-b border-slate-100 transition ${
                    selected
                      ? "bg-orange-50/80"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-5 py-5">
                    <div
                      className={`text-[17px] font-extrabold ${
                        selected
                          ? "text-orange-700"
                          : "text-slate-800"
                      }`}
                    >
                      {order.id}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="text-[16px] font-semibold text-slate-600">
                      {order.time}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <span className="text-[16px] font-bold text-slate-700">
                      {order.table}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-right">
                    <span className="text-[17px] font-black text-slate-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-600">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          order.paymentMethod === "credit_card"
                            ? "bg-blue-50 text-blue-600"
                            : order.paymentMethod === "cash"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        <PaymentIcon
                          method={order.paymentMethod}
                          size={17}
                        />
                      </span>

                      {PAYMENT_LABEL[order.paymentMethod]}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Search
              size={36}
              className="mb-3 text-slate-300"
            />

            <div className="text-lg font-bold text-slate-500">
              No transactions found
            </div>

            <div className="mt-1 text-sm text-slate-400">
              Try searching with a different order ID or table
              number.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * Receipt Detail
 * ======================================================= */

function ReceiptDetail({
  order,
  onRefund,
  onPrint,
  isPrinting,
}: {
  order: OrderTransaction;
  onRefund: () => void;
  onPrint: () => void;
  isPrinting: boolean;
}) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <section className="flex h-full w-[390px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Receipt size={24} />
          </div>

          <StatusBadge status={order.status} />
        </div>

        <div className="mt-4">
          <div className="text-[30px] font-black tracking-tight text-slate-900">
            {formatCurrency(total)}
          </div>

          <div className="mt-1 text-sm font-semibold text-slate-500">
            Order{" "}
            <span className="font-extrabold text-slate-700">
              {order.id}
            </span>

            <span className="mx-2 text-slate-300">•</span>

            {order.table}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
          Order Items
        </div>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-[15px] font-bold leading-5 text-slate-800">
                  {item.name}
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-400">
                  x{item.quantity}
                </div>
              </div>

              <div className="shrink-0 text-[15px] font-extrabold text-slate-700">
                {formatCurrency(
                  item.unitPrice * item.quantity
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="my-5 border-t border-dashed border-slate-200" />

        <div className="space-y-3 text-[15px]">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">
              Subtotal
            </span>

            <span className="font-bold text-slate-700">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">
              Tax (10%)
            </span>

            <span className="font-bold text-slate-700">
              {formatCurrency(tax)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-black text-slate-900">
              Total
            </span>

            <span className="text-xl font-black text-slate-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Payment Method
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <PaymentIcon
              method={order.paymentMethod}
              size={17}
            />

            {PAYMENT_LABEL[order.paymentMethod]}

            {order.paymentMethod === "credit_card" &&
              order.cardLast4 && (
                <span className="ml-auto text-slate-500">
                  **** {order.cardLast4}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
        <button
          type="button"
          onClick={onPrint}
          disabled={isPrinting}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 transition hover:bg-slate-100"
        >
          <Printer size={18} />
          {isPrinting ? "Preparing Receipt..." : "Print Receipt"}
        </button>

        <button
          type="button"
          disabled={order.status === "refunded"}
          onClick={onRefund}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-black text-white transition ${
            order.status === "refunded"
              ? "cursor-not-allowed bg-slate-300"
              : "bg-red-600 shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.99]"
          }`}
        >
          <ArrowDownLeft size={21} />

          {order.status === "refunded"
            ? "Already Refunded"
            : "Refund Payment"}
        </button>
      </div>
    </section>
  );
}

/* =========================================================
 * Refund Modal
 * ======================================================= */

interface RefundModalProps {
  order: OrderTransaction;
  onClose: () => void;
  onConfirm: (payload: RefundPayload) => void;
}

function RefundModal({
  order,
  onClose,
  onConfirm,
}: RefundModalProps) {
  const [reason, setReason] =
    useState<RefundReason | null>(null);

  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");

  const [refundMethod, setRefundMethod] = useState<
    "cash" | "original"
  >("original");

  const [refundMode, setRefundMode] = useState<
    "full" | "items"
  >("full");

  const [selectedItems, setSelectedItems] = useState<string[]>(
    []
  );

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const total = subtotal + subtotal * TAX_RATE;

  const selectedSubtotal = order.items
    .filter((item) => selectedItems.includes(item.id))
    .reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

  const refundAmount =
    refundMode === "full"
      ? total
      : selectedSubtotal * (1 + TAX_RATE);

  const canSubmit =
    reason !== null &&
    pin.length === 4 &&
    (reason !== "other" || note.trim().length > 0) &&
    refundAmount > 0;

  const toggleItem = (itemId: string) => {
    setSelectedItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  };

  const submit = () => {
    if (!canSubmit || !reason) return;

    onConfirm({
      orderId: order.id,
      amount: refundAmount,
      reason,
      note: reason === "other" ? note.trim() : undefined,
      managerPin: pin,
      refundMethod,
      itemIds:
        refundMode === "items" ? selectedItems : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-64px)] w-[850px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-200 px-7">
          <div>
            <h2 className="text-[22px] font-black text-slate-900">
              Confirm Refund
            </h2>

            <div className="mt-1 text-sm font-semibold text-slate-500">
              Order{" "}
              <span className="font-black text-orange-600">
                {order.id}
              </span>

              <span className="mx-2 text-slate-300">•</span>

              {order.table}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-7">
          {/* Refund Amount */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-wide text-red-500">
                  Refund Amount
                </div>

                <div className="mt-1 text-[32px] font-black text-red-700">
                  {formatCurrency(refundAmount)}
                </div>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                <RotateCcw size={28} />
              </div>
            </div>
          </div>

          {/* Refund Scope */}
          <div className="mt-6">
            <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
              Refund Scope
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundMode("full")}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  refundMode === "full"
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      refundMode === "full"
                        ? "border-red-600"
                        : "border-slate-300"
                    }`}
                  >
                    {refundMode === "full" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    )}
                  </div>

                  <div>
                    <div className="font-black text-slate-800">
                      Full Order Refund
                    </div>

                    <div className="mt-0.5 text-xs font-medium text-slate-500">
                      Refund {formatCurrency(total)}
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRefundMode("items")}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  refundMode === "items"
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      refundMode === "items"
                        ? "border-red-600"
                        : "border-slate-300"
                    }`}
                  >
                    {refundMode === "items" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    )}
                  </div>

                  <div>
                    <div className="font-black text-slate-800">
                      Item Refund
                    </div>

                    <div className="mt-0.5 text-xs font-medium text-slate-500">
                      Select specific items to refund
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Partial Item Selection */}
          {refundMode === "items" && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-black text-slate-700">
                Select Items to Refund
              </div>

              <div className="space-y-2">
                {order.items.map((item) => {
                  const selected = selectedItems.includes(
                    item.id
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                          selected
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check size={15} />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-800">
                          {item.name}
                        </div>

                        <div className="text-xs font-semibold text-slate-400">
                          x{item.quantity}
                        </div>
                      </div>

                      <div className="text-sm font-black text-slate-700">
                        {formatCurrency(
                          item.unitPrice * item.quantity
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Refund Reason */}
          <div className="mt-6">
            <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
              Refund Reason
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REFUND_REASONS.map((item) => {
                const selected = reason === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReason(item.value)}
                    className={`flex min-h-[88px] items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`text-[15px] font-black ${
                          selected
                            ? "text-red-700"
                            : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-400">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {reason === "other" && (
              <div className="mt-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Enter a detailed explanation for the refund..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>
            )}
          </div>

          {/* Bottom Fields */}
          <div className="mt-6 grid grid-cols-2 gap-5">
            {/* PIN */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                <LockKeyhole size={17} />
                Manager Approval PIN
              </label>

              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4)
                    )
                  }
                  placeholder="••••"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition placeholder:text-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>

              <div className="mt-2 text-xs font-semibold text-slate-400">
                Enter the manager&apos;s 4-digit PIN.
              </div>
            </div>

            {/* Refund Method */}
            <div>
              <div className="mb-2 text-sm font-black text-slate-700">
                Refund Method
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod("cash")}
                  className={`flex h-[54px] w-full items-center gap-3 rounded-xl border-2 px-4 text-left ${
                    refundMethod === "cash"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Banknote
                    size={19}
                    className={
                      refundMethod === "cash"
                        ? "text-orange-600"
                        : "text-slate-400"
                    }
                  />

                  <span className="text-sm font-bold text-slate-700">
                    Cash Refund
                  </span>

                  {refundMethod === "cash" && (
                    <Check
                      size={18}
                      className="ml-auto text-orange-600"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRefundMethod("original")
                  }
                  className={`flex h-[54px] w-full items-center gap-3 rounded-xl border-2 px-4 text-left ${
                    refundMethod === "original"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <CreditCard
                    size={19}
                    className={
                      refundMethod === "original"
                        ? "text-orange-600"
                        : "text-slate-400"
                    }
                  />

                  <span className="text-sm font-bold text-slate-700">
                    Refund to Original Payment Method
                  </span>

                  {refundMethod === "original" && (
                    <Check
                      size={18}
                      className="ml-auto text-orange-600"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-7 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Total Refund Amount
            </div>

            <div className="text-xl font-black text-slate-900">
              {formatCurrency(refundAmount)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-13 rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className={`flex h-14 items-center gap-2 rounded-xl px-7 text-base font-black text-white transition ${
                canSubmit
                  ? "bg-red-600 shadow-lg shadow-red-200 hover:bg-red-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              <RotateCcw size={19} />
              Confirm Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main Page
 * ======================================================= */

export default function PosHistoryAndRefundPage() {
  const [searchParams] = useSearchParams();

  const [orders, setOrders] =
    useState<OrderTransaction[]>(INITIAL_ORDERS);

  const [selectedId, setSelectedId] =
    useState<string>(
      searchParams.get("orderId") ?? "#ORD-892"
    );

  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] =
    useState("2026-08-24");

  const [refundOrder, setRefundOrder] =
    useState<OrderTransaction | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const [isPrinting, setIsPrinting] = useState(false);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.id === selectedId) ??
      orders[0],
    [orders, selectedId]
  );

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return orders.filter(
        (order) => order.date === selectedDate
      );
    }

    return orders.filter(
      (order) =>
        order.date === selectedDate &&
        (order.id.toLowerCase().includes(keyword) ||
          order.table.toLowerCase().includes(keyword) ||
          PAYMENT_LABEL[order.paymentMethod]
            .toLowerCase()
            .includes(keyword))
    );
  }, [orders, search, selectedDate]);

  /* =========================================================
   * Export
   * ======================================================= */

  const handleExport = () => {
    const content = [
      `ROMS POS - TRANSACTION HISTORY`,
      `Date: ${selectedDate}`,
      "",
      ...filteredOrders.map(
        (order) =>
          `${order.id}\t${order.time}\t${order.table}\t${formatCurrency(
            order.amount
          )}\t${PAYMENT_LABEL[order.paymentMethod]}\t${STATUS_LABEL[
            order.status
          ]}`
      ),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([content], {
        type: "text/plain;charset=utf-8",
      })
    );

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `roms-history-${selectedDate}.txt`;

    anchor.click();

    URL.revokeObjectURL(url);
  };

  /* =========================================================
   * Select Order
   * ======================================================= */

  const handleSelectOrder = (
    order: OrderTransaction
  ) => {
    setSelectedId(order.id);
  };

  /* =========================================================
   * Print Receipt
   * ======================================================= */

  const handlePrintReceipt = async () => {
    if (!selectedOrder || isPrinting) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setToast("Please allow pop-ups to print the receipt.");
      return;
    }

    setIsPrinting(true);

    try {
      printWindow.document.open();
      printWindow.document.write(
        createPrintableReceipt(selectedOrder)
      );
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch {
      printWindow.close();
      setToast("Unable to prepare the receipt for printing.");
    } finally {
      setIsPrinting(false);
    }
  };

  /* =========================================================
   * Refund
   * ======================================================= */

  const handleRefund = () => {
    if (
      !selectedOrder ||
      selectedOrder.status === "refunded"
    ) {
      return;
    }

    setRefundOrder(selectedOrder);
  };

  const handleConfirmRefund = (
    payload: RefundPayload
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === payload.orderId
          ? {
              ...order,
              status: "refunded",
            }
          : order
      )
    );

    setRefundOrder(null);

    setToast(
      `Refunded ${formatCurrency(
        payload.amount
      )} for order ${payload.orderId}`
    );

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      <div className="flex h-full min-h-0">
        {/* Cashier Sidebar */}
        <CashierSidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <TopHeader
            search={search}
            setSearch={setSearch}
          />

          {/* Workspace */}
          <div className="min-h-0 flex-1 p-5">
            <div className="flex h-full min-h-0 gap-4">
              {/* Transaction History */}
              <HistoryTable
                orders={filteredOrders}
                selectedId={selectedId}
                onSelect={handleSelectOrder}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onExport={handleExport}
              />

              {/* Receipt Detail */}
              {selectedOrder && (
                <ReceiptDetail
                  order={selectedOrder}
                  onRefund={handleRefund}
                  onPrint={handlePrintReceipt}
                  isPrinting={isPrinting}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Refund Modal */}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onConfirm={handleConfirmRefund}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-7 right-7 z-[60] flex min-w-[380px] items-center gap-4 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
            <Check size={22} />
          </div>

          <div>
            <div className="font-black">
              Refund Successful
            </div>

            <div className="mt-0.5 text-sm font-medium text-slate-300">
              {toast}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-slate-400 hover:text-white"
            title="Close notification"
          >
            <X size={19} />
          </button>
        </div>
      )}
    </div>
  );
}