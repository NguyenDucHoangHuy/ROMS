import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  GitMerge,
  ReceiptText,
  Search,
  Users,
  X,
  CreditCard,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

/* =========================================================
 * Types
 * ======================================================= */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  amount: number;
  note?: string;
}

export interface TableOrder {
  id: string;
  tableCode: string;
  guestCount: number;
  total: number;
  openedAt: string;
  items: OrderItem[];
}

export interface MergedBillSummary {
  tableIds: string[];
  tableCodes: string[];
  items: OrderItem[];
  total: number;
}

interface MergeBillModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMerge?: (summary: MergedBillSummary) => void;
  onMergeAndPay?: (summary: MergedBillSummary) => void;
}

/* =========================================================
 * Mock Data
 * ======================================================= */

const MOCK_TABLES: TableOrder[] = [
  {
    id: "table-05",
    tableCode: "Table 05",
    guestCount: 4,
    total: 315000,
    openedAt: "07:15",
    items: [
      {
        id: "05-pho",
        name: "Special Beef Pho",
        quantity: 2,
        amount: 170000,
      },
      {
        id: "05-coffee",
        name: "Vietnamese Iced Milk Coffee",
        quantity: 3,
        amount: 145000,
      },
    ],
  },
  {
    id: "table-12",
    tableCode: "Table 12",
    guestCount: 5,
    total: 1240000,
    openedAt: "07:22",
    items: [
      {
        id: "12-hotpot",
        name: "Thai Seafood Hot Pot",
        quantity: 1,
        amount: 650000,
      },
      {
        id: "12-salad",
        name: "Lotus Stem & Shrimp Salad",
        quantity: 1,
        amount: 250000,
      },
      {
        id: "12-beer",
        name: "Heineken Beer (Can)",
        quantity: 10,
        amount: 340000,
      },
    ],
  },
  {
    id: "table-08",
    tableCode: "Table 08",
    guestCount: 3,
    total: 850000,
    openedAt: "07:31",
    items: [
      {
        id: "08-steak",
        name: "Pepper Sauce Beef Steak",
        quantity: 2,
        amount: 460000,
      },
      {
        id: "08-pasta",
        name: "Seafood Pasta",
        quantity: 1,
        amount: 220000,
      },
      {
        id: "08-juice",
        name: "Fresh Orange Juice",
        quantity: 3,
        amount: 170000,
      },
    ],
  },
  {
    id: "table-09",
    tableCode: "Table 09",
    guestCount: 2,
    total: 420000,
    openedAt: "07:42",
    items: [
      {
        id: "09-rice",
        name: "Seafood Fried Rice",
        quantity: 1,
        amount: 180000,
      },
      {
        id: "09-chicken",
        name: "Fish Sauce Fried Chicken",
        quantity: 1,
        amount: 160000,
      },
      {
        id: "09-tea",
        name: "Peach Orange Lemongrass Tea",
        quantity: 2,
        amount: 80000,
      },
    ],
  },
];

/* =========================================================
 * Helpers
 * ======================================================= */

const formatCompactCurrency = (amount: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VND`;
};

/* =========================================================
 * Main Component
 * ======================================================= */

export default function MergeBillModal({
  isOpen = true,
  onClose,
  onMerge,
  onMergeAndPay,
}: MergeBillModalProps) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([
    "table-05",
    "table-12",
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  /* =========================================================
   * Filter Tables
   * ======================================================= */

  const filteredTables = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return MOCK_TABLES;
    }

    return MOCK_TABLES.filter((table) => {
      return (
        table.tableCode.toLowerCase().includes(query) ||
        table.guestCount.toString().includes(query) ||
        formatCompactCurrency(table.total)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [searchQuery]);

  /* =========================================================
   * Selected Tables
   * ======================================================= */

  const selectedTables = useMemo(() => {
    return MOCK_TABLES.filter((table) =>
      selectedTableIds.includes(table.id),
    );
  }, [selectedTableIds]);

  /* =========================================================
   * Merged Items
   * ======================================================= */

  const mergedItems = useMemo(() => {
    return selectedTables.flatMap((table) =>
      table.items.map((item) => ({
        ...item,
        id: `${table.id}-${item.id}`,
        sourceTableId: table.id,
        sourceTableCode: table.tableCode,
      })),
    );
  }, [selectedTables]);

  /* =========================================================
   * Merged Total
   * ======================================================= */

  const mergedTotal = useMemo(() => {
    return selectedTables.reduce(
      (sum, table) => sum + table.total,
      0,
    );
  }, [selectedTables]);

  /* =========================================================
   * Guest Count
   * ======================================================= */

  const selectedGuestCount = useMemo(() => {
    return selectedTables.reduce(
      (sum, table) => sum + table.guestCount,
      0,
    );
  }, [selectedTables]);

  /* =========================================================
   * Summary
   * ======================================================= */

  const summary: MergedBillSummary = useMemo(
    () => ({
      tableIds: selectedTables.map((table) => table.id),
      tableCodes: selectedTables.map((table) => table.tableCode),
      items: mergedItems,
      total: mergedTotal,
    }),
    [selectedTables, mergedItems, mergedTotal],
  );

  /* =========================================================
   * Toggle Table
   * ======================================================= */

  const toggleTable = (tableId: string) => {
    setSelectedTableIds((current) => {
      if (current.includes(tableId)) {
        return current.filter((id) => id !== tableId);
      }

      return [...current, tableId];
    });
  };

  /* =========================================================
   * Merge Only
   * ======================================================= */

  const handleMerge = () => {
    if (selectedTables.length < 2 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      onMerge?.(summary);
    } finally {
      window.setTimeout(() => {
        setIsProcessing(false);
      }, 350);
    }
  };

  /* =========================================================
   * Merge & Pay
   * ======================================================= */

  const handleMergeAndPay = () => {
    if (selectedTables.length < 2 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      onMergeAndPay?.(summary);
    } finally {
      window.setTimeout(() => {
        setIsProcessing(false);
      }, 350);
    }
  };

  /* =========================================================
   * Close
   * ======================================================= */

  if (!isOpen) {
    return null;
  }

  const canMerge = selectedTables.length >= 2;

  /* =========================================================
   * Render
   * ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex h-screen items-center justify-center overflow-hidden bg-slate-900/60 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-bill-title"
        className="flex h-full max-h-[1000px] w-full max-w-[1700px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* ================================================================
            HEADER
        ================================================================= */}

        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <GitMerge size={24} strokeWidth={2.4} />
            </div>

            <div>
              <h1
                id="merge-bill-title"
                className="text-2xl font-bold tracking-tight text-slate-800"
              >
                Merge Bills
              </h1>

              <p className="mt-0.5 text-sm font-medium text-slate-500">
                Select tables to combine into a single bill
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose ?? (() => navigate(-1))}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          >
            <X size={25} />
          </button>
        </header>

        {/* ================================================================
            MAIN CONTENT
        ================================================================= */}

        <main className="grid min-h-0 flex-1 grid-cols-2">
          {/* ==============================================================
              LEFT - TABLE SELECTION
          ============================================================== */}

          <section className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/60">
            {/* Section heading */}

            <div className="shrink-0 px-7 pb-5 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Open Tables
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Select at least 2 tables to merge bills
                  </p>
                </div>

                <div className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700">
                  {selectedTables.length} selected
                </div>
              </div>

              {/* Search */}

              <div className="relative">
                <Search
                  size={21}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search tables..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-base font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* Table cards */}

            <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7">
              {filteredTables.length === 0 ? (
                <div className="flex h-full min-h-[260px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Search size={25} />
                    </div>

                    <p className="text-base font-bold text-slate-700">
                      No tables found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try searching with a different table number
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredTables.map((table) => {
                    const isSelected = selectedTableIds.includes(
                      table.id,
                    );

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => toggleTable(table.id)}
                        aria-pressed={isSelected}
                        className={[
                          "group relative min-h-[155px] rounded-2xl p-5 text-left transition-all duration-150",
                          "focus:outline-none focus:ring-4 focus:ring-orange-100",
                          isSelected
                            ? "border-2 border-orange-500 bg-orange-100/70 shadow-sm"
                            : "border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
                        ].join(" ")}
                      >
                        {/* Selection indicator */}

                        <div
                          className={[
                            "absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-all",
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "border-2 border-slate-200 bg-white text-transparent group-hover:border-slate-300",
                          ].join(" ")}
                        >
                          <Check size={17} strokeWidth={3} />
                        </div>

                        {/* Table information */}

                        <div className="pr-10">
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                "text-2xl font-extrabold tracking-tight",
                                isSelected
                                  ? "text-orange-950"
                                  : "text-slate-900",
                              ].join(" ")}
                            >
                              {table.tableCode}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                            <Users
                              size={17}
                              className={
                                isSelected
                                  ? "text-orange-700"
                                  : "text-slate-500"
                              }
                            />

                            <span
                              className={
                                isSelected
                                  ? "text-orange-800"
                                  : "text-slate-600"
                              }
                            >
                              {table.guestCount} guests
                            </span>

                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                <Check
                                  size={11}
                                  strokeWidth={3}
                                />
                                Selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount */}

                        <div className="mt-7 flex items-end justify-between border-t border-slate-200/70 pt-3">
                          <div>
                            <p className="text-[10px] font-bold tracking-[0.08em] text-slate-500">
                              TOTAL
                            </p>

                            <p
                              className={[
                                "mt-0.5 text-xl font-extrabold",
                                isSelected
                                  ? "text-orange-600"
                                  : "text-slate-800",
                              ].join(" ")}
                            >
                              {formatCompactCurrency(table.total)}
                            </p>
                          </div>

                          <span className="text-xs font-medium text-slate-400">
                            Opened {table.openedAt}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ==============================================================
              RIGHT - MERGED BILL PREVIEW
          ============================================================== */}

          <section className="flex min-h-0 flex-col bg-white">
            {/* Preview header */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-7 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <ReceiptText size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-orange-950">
                    Merged Bill Preview
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {selectedGuestCount} guests •{" "}
                    {mergedItems.length} items
                  </p>
                </div>
              </div>

              <div className="max-w-[300px] rounded-full bg-slate-100 px-3 py-1.5 text-right text-xs font-semibold text-slate-600">
                {selectedTables.length > 0
                  ? selectedTables
                      .map((table) => table.tableCode)
                      .join(" + ")
                  : "No tables selected"}
              </div>
            </div>

            {/* Items */}

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
              {selectedTables.length === 0 ? (
                <div className="flex h-full min-h-[350px] items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <GitMerge size={30} />
                    </div>

                    <h3 className="text-lg font-bold text-slate-700">
                      No tables selected
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Select tables from the left section to preview
                      the merged bill.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {/* Column headers */}

                  <div className="grid grid-cols-[minmax(0,1fr)_80px_150px] items-center border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-extrabold tracking-wider text-slate-500">
                      ITEM
                    </span>

                    <span className="text-center text-xs font-extrabold tracking-wider text-slate-500">
                      QTY
                    </span>

                    <span className="text-right text-xs font-extrabold tracking-wider text-slate-500">
                      AMOUNT
                    </span>
                  </div>

                  {/* Groups */}

                  <div className="divide-y divide-slate-100">
                    {selectedTables.map((table, tableIndex) => (
                      <div key={table.id}>
                        {/* Source indicator */}

                        <div className="bg-blue-50 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <ArrowRight
                              size={14}
                              className="text-blue-600"
                            />

                            <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700">
                              {tableIndex === 0
                                ? `ORIGINAL BILL - ${table.tableCode}`
                                : `MERGED FROM ${table.tableCode}`}
                            </span>

                            <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              {table.items.length} items
                            </span>
                          </div>
                        </div>

                        {/* Items */}

                        {table.items.map((item) => (
                          <div
                            key={`${table.id}-${item.id}`}
                            className="grid grid-cols-[minmax(0,1fr)_80px_150px] items-center px-4 py-4 transition-colors hover:bg-slate-50"
                          >
                            <div className="min-w-0 pr-4">
                              <div className="flex items-start gap-2">
                                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />

                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-bold text-slate-800">
                                    {item.name}
                                  </p>

                                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                                    <span>📍</span>
                                    Source: {table.tableCode}
                                  </p>

                                  {item.note && (
                                    <p className="mt-1 text-xs text-slate-400">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-center">
                              <span className="inline-flex min-w-[34px] items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700">
                                {item.quantity}
                              </span>
                            </div>

                            <div className="text-right">
                              <p className="text-[15px] font-extrabold text-slate-800">
                                {formatCompactCurrency(item.amount)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Table subtotal */}

                        <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Subtotal {table.tableCode}
                          </span>

                          <span className="text-sm font-extrabold text-slate-700">
                            {formatCompactCurrency(table.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================
                FOOTER
            ============================================================= */}

            <div className="shrink-0 border-t border-slate-200 bg-white px-7 py-5">
              {!canMerge && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  <AlertCircle size={18} />
                  Please select at least 2 tables to merge bills.
                </div>
              )}

              <div className="flex items-end justify-between gap-6">
                {/* Total */}

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    New Bill Total
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-orange-600">
                      {formatCompactCurrency(mergedTotal)}
                    </span>

                    {selectedTables.length > 0 && (
                      <span className="text-sm font-medium text-slate-400">
                        ({selectedTables.length} bills)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!canMerge || isProcessing}
                    onClick={handleMerge}
                    className={[
                      "flex h-[52px] items-center justify-center gap-2 rounded-xl border px-6 text-base font-bold transition-all",
                      canMerge && !isProcessing
                        ? "border-slate-300 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-[0.98]"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    <GitMerge size={19} />
                    Merge Bills Only
                  </button>

                  <button
                    type="button"
                    disabled={!canMerge || isProcessing}
                    onClick={handleMergeAndPay}
                    className={[
                      "flex h-[52px] items-center justify-center gap-2 rounded-xl px-7 text-base font-extrabold shadow-md transition-all",
                      canMerge && !isProcessing
                        ? "bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700 hover:shadow-lg active:scale-[0.98]"
                        : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none",
                    ].join(" ")}
                  >
                    <CreditCard size={19} />

                    {isProcessing
                      ? "Processing..."
                      : "Confirm Merge & Pay"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}