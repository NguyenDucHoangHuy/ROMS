import React, { useMemo, useState } from "react";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Filter,
  HelpCircle,
  History,
  MoreHorizontal,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  WalletCards,
  X,
  Banknote,
  QrCode,
  CircleDollarSign,
} from "lucide-react";

type TimeRange = "Day" | "Week" | "Month";

type TransactionStatus = "Completed" | "Cancelled" | "Refunded";

type PaymentMethod = "Credit Card" | "Cash" | "QR Pay";

interface TransactionRecord {
  id: string;
  date: string;
  time: string;
  status: TransactionStatus;
  payment: PaymentMethod;
  amount: number;
}

interface RevenueKPI {
  label: string;
  value: number;
  comparison: string;
  trend: "up" | "down";
}

interface DailySalesChartData {
  day: string;
  amount: number;
  highlighted?: boolean;
}

interface PaymentMethodShare {
  label: string;
  percentage: number;
  icon: React.ReactNode;
  emphasized?: boolean;
}

const TOTAL_ENTRIES = 128;
const PAGE_SIZE = 5;

const transactions: TransactionRecord[] = [
  {
    id: "#INV-0912",
    date: "15 Oct",
    time: "10:45 AM",
    status: "Completed",
    payment: "Credit Card",
    amount: 850000,
  },
  {
    id: "#INV-0911",
    date: "15 Oct",
    time: "10:30 AM",
    status: "Cancelled",
    payment: "QR Pay",
    amount: 1200000,
  },
  {
    id: "#INV-0910",
    date: "15 Oct",
    time: "09:15 AM",
    status: "Refunded",
    payment: "Cash",
    amount: -450000,
  },
  {
    id: "#INV-0909",
    date: "15 Oct",
    time: "08:50 AM",
    status: "Completed",
    payment: "Credit Card",
    amount: 3400000,
  },
  {
    id: "#INV-0908",
    date: "15 Oct",
    time: "08:15 AM",
    status: "Completed",
    payment: "Cash",
    amount: 150000,
  },
  {
    id: "#INV-0907",
    date: "14 Oct",
    time: "09:40 PM",
    status: "Completed",
    payment: "QR Pay",
    amount: 720000,
  },
  {
    id: "#INV-0906",
    date: "14 Oct",
    time: "08:20 PM",
    status: "Completed",
    payment: "Credit Card",
    amount: 1850000,
  },
  {
    id: "#INV-0905",
    date: "14 Oct",
    time: "07:15 PM",
    status: "Cancelled",
    payment: "Cash",
    amount: 550000,
  },
  {
    id: "#INV-0904",
    date: "14 Oct",
    time: "06:30 PM",
    status: "Completed",
    payment: "Cash",
    amount: 920000,
  },
  {
    id: "#INV-0903",
    date: "14 Oct",
    time: "05:50 PM",
    status: "Refunded",
    payment: "QR Pay",
    amount: -280000,
  },
  {
    id: "#INV-0902",
    date: "14 Oct",
    time: "04:45 PM",
    status: "Completed",
    payment: "Credit Card",
    amount: 1280000,
  },
  {
    id: "#INV-0901",
    date: "14 Oct",
    time: "03:20 PM",
    status: "Completed",
    payment: "QR Pay",
    amount: 650000,
  },
  {
    id: "#INV-0900",
    date: "14 Oct",
    time: "02:10 PM",
    status: "Completed",
    payment: "Cash",
    amount: 420000,
  },
  {
    id: "#INV-0899",
    date: "14 Oct",
    time: "01:05 PM",
    status: "Cancelled",
    payment: "Credit Card",
    amount: 980000,
  },
  {
    id: "#INV-0898",
    date: "14 Oct",
    time: "12:25 PM",
    status: "Completed",
    payment: "Credit Card",
    amount: 2150000,
  },
  {
    id: "#INV-0897",
    date: "14 Oct",
    time: "11:40 AM",
    status: "Completed",
    payment: "QR Pay",
    amount: 390000,
  },
  {
    id: "#INV-0896",
    date: "14 Oct",
    time: "10:50 AM",
    status: "Refunded",
    payment: "Cash",
    amount: -350000,
  },
  {
    id: "#INV-0895",
    date: "14 Oct",
    time: "09:30 AM",
    status: "Completed",
    payment: "Credit Card",
    amount: 1740000,
  },
  {
    id: "#INV-0894",
    date: "14 Oct",
    time: "08:45 AM",
    status: "Completed",
    payment: "Cash",
    amount: 275000,
  },
  {
    id: "#INV-0893",
    date: "13 Oct",
    time: "09:10 PM",
    status: "Completed",
    payment: "QR Pay",
    amount: 880000,
  },
];

const dailySales: DailySalesChartData[] = [
  { day: "Mon", amount: 18 },
  { day: "Tue", amount: 31 },
  { day: "Wed", amount: 14 },
  { day: "Thu", amount: 43, highlighted: true },
  { day: "Fri", amount: 26 },
  { day: "Sat", amount: 20 },
];

const paymentMethods: PaymentMethodShare[] = [
  {
    label: "Credit/Debit Card",
    percentage: 65,
    icon: <CreditCard size={15} strokeWidth={1.8} />,
    emphasized: true,
  },
  {
    label: "Cash",
    percentage: 25,
    icon: <Banknote size={15} strokeWidth={1.8} />,
  },
  {
    label: "QR Payment",
    percentage: 10,
    icon: <QrCode size={15} strokeWidth={1.8} />,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

const getStatusClasses = (status: TransactionStatus) => {
  switch (status) {
    case "Completed":
      return "bg-blue-50 text-slate-500 border-blue-100";

    case "Cancelled":
      return "bg-rose-50 text-rose-500 border-rose-100";

    case "Refunded":
      return "bg-slate-200 text-slate-500 border-slate-300";
  }
};

const getPaymentIcon = (payment: PaymentMethod) => {
  switch (payment) {
    case "Credit Card":
      return <CreditCard size={14} strokeWidth={1.8} />;

    case "Cash":
      return <Banknote size={14} strokeWidth={1.8} />;

    case "QR Pay":
      return <QrCode size={14} strokeWidth={1.8} />;
  }
};

const generateCsv = (rows: TransactionRecord[]) => {
  const header = [
    "Invoice ID",
    "Date",
    "Time",
    "Status",
    "Payment Method",
    "Total Amount",
  ];

  const body = rows.map((row) => [
    row.id,
    row.date,
    row.time,
    row.status,
    row.payment,
    row.amount.toString(),
  ]);

  return [header, ...body]
    .map((row) =>
      row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");
};

const RevenueAndAuditLogPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("Month");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | "All"
  >("All");

  const [showFilter, setShowFilter] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const kpis: RevenueKPI[] = useMemo(() => {
    if (timeRange === "Day") {
      return [
        {
          label: "REVENUE INFLOW",
          value: 4250000,
          comparison: "+8.4% vs yesterday",
          trend: "up",
        },
        {
          label: "OUTFLOW (REFUNDS, EXPENSES)",
          value: 180000,
          comparison: "-4.2% vs yesterday",
          trend: "down",
        },
        {
          label: "TOTAL NET PROFIT",
          value: 4070000,
          comparison: "+10.1% vs yesterday",
          trend: "up",
        },
      ];
    }

    if (timeRange === "Week") {
      return [
        {
          label: "REVENUE INFLOW",
          value: 12950000,
          comparison: "+6.8% vs last week",
          trend: "up",
        },
        {
          label: "OUTFLOW (REFUNDS, EXPENSES)",
          value: 920000,
          comparison: "-1.8% vs last week",
          trend: "down",
        },
        {
          label: "TOTAL NET PROFIT",
          value: 12030000,
          comparison: "+9.3% vs last week",
          trend: "up",
        },
      ];
    }

    return [
      {
        label: "REVENUE INFLOW",
        value: 45200000,
        comparison: "+12.5% vs last month",
        trend: "up",
      },
      {
        label: "OUTFLOW (REFUNDS, EXPENSES)",
        value: 1850000,
        comparison: "-2.1% vs last month",
        trend: "down",
      },
      {
        label: "TOTAL NET PROFIT",
        value: 43350000,
        comparison: "+15.3% vs last month",
        trend: "up",
      },
    ];
  }, [timeRange]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.id.toLowerCase().includes(normalizedSearch) ||
        transaction.payment.toLowerCase().includes(normalizedSearch) ||
        transaction.status.toLowerCase().includes(normalizedSearch) ||
        transaction.date.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(TOTAL_ENTRIES / PAGE_SIZE);

  const visibleTransactions = useMemo(() => {
    if (searchTerm || statusFilter !== "All") {
      return filteredTransactions.slice(0, PAGE_SIZE);
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredTransactions.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [
    currentPage,
    filteredTransactions,
    searchTerm,
    statusFilter,
  ]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (
    status: TransactionStatus | "All"
  ) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setShowFilter(false);
  };

  const handleExport = () => {
    const csv = generateCsv(filteredTransactions);

    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `ROMS-revenue-audit-${timeRange.toLowerCase()}.csv`;

    anchor.click();

    URL.revokeObjectURL(url);
  };

  const goToPage = (page: number) => {
    setCurrentPage(
      Math.min(
        Math.max(page, 1),
        totalPages
      )
    );
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100/90 font-sans text-slate-900">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <CashierSidebar />

        <aside className="hidden">
          <div className="px-7 pb-7 pt-6">
            <div className="text-[34px] font-black leading-[0.95] tracking-tight">
              Bistro
              <br />
              POS
            </div>

            <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Terminal 01
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3">
            <button
              type="button"
              className="group flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-[13px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <ShoppingBag size={17} />
              Sales
            </button>

            <button
              type="button"
              className="group flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-[13px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Receipt size={17} />
              Orders
            </button>

            <button
              type="button"
              className="relative flex h-11 w-full items-center gap-3 rounded-lg bg-slate-700/80 px-4 text-left text-[13px] font-bold text-white shadow-sm"
            >
              <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-orange-600" />

              <History size={17} />

              History
            </button>

            <button
              type="button"
              className="group flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-[13px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw size={17} />
              Refunds
            </button>

            <button
              type="button"
              className="group flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-[13px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Settings size={17} />
              Settings
            </button>
          </nav>

          <div className="mt-auto px-3 pb-5">
            <button
              type="button"
              className="mb-4 h-12 w-full rounded-xl bg-orange-700 px-4 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600 active:scale-[0.99]"
            >
              New Order
            </button>

            <button
              type="button"
              className="flex h-11 w-full items-center gap-3 rounded-lg px-4 text-[13px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <HelpCircle size={17} />
              Support
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-hidden bg-[#f7f8f8]">
          {/* Top Header */}
          <header className="flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchTerm}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Search transactions, receipts..."
                className="h-10 w-96 rounded-full border border-slate-300 bg-white pl-10 pr-10 text-sm font-sans text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                title="Refresh"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-700"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  title="Notifications"
                  onClick={() =>
                    setShowNotifications(
                      (value) => !value
                    )
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-700"
                >
                  <Bell size={17} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-600 ring-2 ring-white" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 font-sans shadow-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">
                        Notifications
                      </p>

                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                        2 new
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        There are 2 transactions that need
                        review.
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        Today's revenue is currently 8.4%
                        higher.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mx-1 h-6 w-px bg-slate-200" />

              <button
                type="button"
                className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-sm"
                title="User profile"
              >
                <span className="text-xs font-black text-slate-600">
                  TL
                </span>
              </button>
            </div>
          </header>

          {/* Scrollable Dashboard */}
          <div className="h-[calc(100vh-68px)] overflow-y-auto px-8 py-5">
            <div className="mx-auto max-w-[1500px]">
              {/* Dashboard Heading */}
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h1 className="text-[27px] font-black leading-tight tracking-tight text-slate-900">
                    Revenue &amp; Invoice Audit Log
                  </h1>

                  <p className="mt-1 font-sans text-xs font-medium text-slate-500">
                    Review your financial performance and
                    detailed transactions.
                  </p>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="flex h-10 items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm">
                    {(
                      ["Day", "Week", "Month"] as TimeRange[]
                    ).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          setTimeRange(range);
                          setCurrentPage(1);
                        }}
                        className={`h-9 min-w-[48px] rounded-md px-3 font-sans text-xs font-bold transition ${
                          timeRange === range
                            ? "bg-slate-200 text-slate-900 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomRange(
                        (value) => !value
                      )
                    }
                    className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 font-sans text-xs font-bold text-slate-700 shadow-sm transition hover:border-orange-400 hover:text-orange-700"
                  >
                    <CalendarDays size={14} />
                    Custom Range
                  </button>

                  {showCustomRange && (
                    <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 font-sans shadow-xl">
                      <div className="mb-3 text-sm font-bold text-slate-900">
                        Custom Date Range
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[11px] font-bold text-slate-500">
                          From

                          <input
                            type="date"
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-orange-500"
                          />
                        </label>

                        <label className="text-[11px] font-bold text-slate-500">
                          To

                          <input
                            type="date"
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-orange-500"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowCustomRange(false)
                        }
                        className="mt-3 h-9 w-full rounded-lg bg-orange-600 text-xs font-bold text-white transition hover:bg-orange-700"
                      >
                        Apply Range
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Cards */}
              <div className="mb-5 grid grid-cols-3 gap-4">
                {kpis.map((kpi, index) => (
                  <div
                    key={kpi.label}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      index === 2
                        ? "border-orange-200"
                        : "border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-sans text-[10px] font-black tracking-wide text-slate-500">
                        {kpi.label}
                      </p>

                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          index === 0
                            ? "bg-orange-100 text-orange-700"
                            : index === 1
                            ? "bg-rose-100 text-rose-500"
                            : "bg-orange-700 text-white"
                        }`}
                      >
                        {index === 0 ? (
                          <WalletCards size={16} />
                        ) : index === 1 ? (
                          <RotateCcw size={16} />
                        ) : (
                          <CircleDollarSign size={17} />
                        )}
                      </div>
                    </div>

                    <div
                      className={`mt-5 text-[28px] font-black tracking-tight ${
                        index === 2
                          ? "text-orange-700"
                          : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(kpi.value)}
                    </div>

                    <div
                      className={`mt-2 font-sans text-[10px] font-semibold ${
                        kpi.trend === "up"
                          ? index === 2
                            ? "text-emerald-600"
                            : "text-orange-600"
                          : "text-rose-500"
                      }`}
                    >
                      {kpi.trend === "up"
                        ? "↗"
                        : "↘"}{" "}
                      {kpi.comparison}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Workspace */}
              <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(310px,0.9fr)] gap-4">
                {/* Transactions */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex h-[62px] items-center justify-between border-b border-slate-100 px-5">
                    <div className="flex items-center gap-2.5">
                      <Receipt
                        size={17}
                        className="text-orange-700"
                      />

                      <h2 className="text-base font-black text-slate-800">
                        Transaction Details
                      </h2>
                    </div>

                    <div className="relative flex items-center gap-1">
                      <button
                        type="button"
                        title="Filter"
                        onClick={() =>
                          setShowFilter(
                            (value) => !value
                          )
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                          statusFilter !== "All"
                            ? "bg-orange-50 text-orange-700"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        <Filter size={16} />
                      </button>

                      <button
                        type="button"
                        title="Export CSV"
                        onClick={handleExport}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Download size={16} />
                      </button>

                      {showFilter && (
                        <div className="absolute right-10 top-11 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 font-sans shadow-xl">
                          <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Status
                          </div>

                          {(
                            [
                              "All",
                              "Completed",
                              "Cancelled",
                              "Refunded",
                            ] as const
                          ).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleStatusFilter(
                                  status
                                )
                              }
                              className={`flex h-9 w-full items-center rounded-lg px-3 text-left text-xs font-semibold transition ${
                                statusFilter === status
                                  ? "bg-orange-50 text-orange-700"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="px-5 py-3 text-left font-sans text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Invoice ID
                          </th>

                          <th className="px-4 py-3 text-left font-sans text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Date &amp; Time
                          </th>

                          <th className="px-4 py-3 text-left font-sans text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-4 py-3 text-left font-sans text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Payment
                          </th>

                          <th className="px-5 py-3 text-right font-sans text-[10px] font-black uppercase tracking-wide text-slate-500">
                            Total Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleTransactions.length > 0 ? (
                          visibleTransactions.map(
                            (transaction) => (
                              <tr
                                key={transaction.id}
                                className="group border-b border-slate-100 transition hover:bg-orange-50/40"
                              >
                                <td className="px-5 py-3.5 font-sans text-[11px] font-bold text-slate-700">
                                  {transaction.id}
                                </td>

                                <td className="px-4 py-3.5 font-sans text-[11px] font-medium text-slate-600">
                                  {transaction.date},{" "}
                                  <span className="text-slate-500">
                                    {transaction.time}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[9px] font-bold ${getStatusClasses(
                                      transaction.status
                                    )}`}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />

                                    {transaction.status}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2 font-sans text-[11px] font-semibold text-slate-600">
                                    {getPaymentIcon(
                                      transaction.payment
                                    )}

                                    {transaction.payment}
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-right font-sans text-[11px]">
                                  {transaction.status ===
                                  "Cancelled" ? (
                                    <span className="font-semibold text-slate-400 line-through">
                                      {formatCurrency(
                                        transaction.amount
                                      )}
                                    </span>
                                  ) : transaction.status ===
                                    "Refunded" ? (
                                    <span className="font-black text-rose-600">
                                      -{" "}
                                      {formatCurrency(
                                        transaction.amount
                                      )}
                                    </span>
                                  ) : (
                                    <span className="font-black text-slate-700">
                                      {formatCurrency(
                                        transaction.amount
                                      )}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-14 text-center"
                            >
                              <div className="flex flex-col items-center">
                                <Search
                                  size={24}
                                  className="mb-2 text-slate-300"
                                />

                                <p className="font-sans text-sm font-bold text-slate-600">
                                  No transactions found
                                </p>

                                <p className="mt-1 font-sans text-xs text-slate-400">
                                  Try changing your search
                                  term or filter.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex h-[58px] items-center justify-between px-5">
                    <p className="font-sans text-[10px] font-medium text-slate-500">
                      {searchTerm ||
                      statusFilter !== "All"
                        ? `Showing ${visibleTransactions.length} filtered entries`
                        : `Showing ${
                            (currentPage - 1) *
                              PAGE_SIZE +
                            1
                          } to ${Math.min(
                            currentPage * PAGE_SIZE,
                            TOTAL_ENTRIES
                          )} of ${TOTAL_ENTRIES} entries`}
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          goToPage(
                            currentPage - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      {getPageNumbers().map(
                        (page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="flex h-8 w-6 items-center justify-center font-sans text-[11px] text-slate-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              type="button"
                              onClick={() =>
                                goToPage(
                                  page as number
                                )
                              }
                              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-sans text-[11px] font-bold transition ${
                                currentPage === page
                                  ? "bg-orange-700 text-white shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {page}
                            </button>
                          )
                      )}

                      <button
                        type="button"
                        disabled={
                          currentPage === totalPages
                        }
                        onClick={() =>
                          goToPage(
                            currentPage + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Analytics */}
                <div className="flex min-w-0 flex-col gap-4">
                  {/* Daily Revenue Chart */}
                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-black text-slate-800">
                        Daily Revenue
                      </h2>

                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>

                    <div className="relative h-[175px]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />

                      <div className="pointer-events-none absolute inset-x-0 top-[33%] border-t border-dashed border-slate-200" />

                      <div className="pointer-events-none absolute inset-x-0 top-[66%] border-t border-dashed border-slate-200" />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-slate-200" />

                      <div className="absolute inset-x-0 bottom-0 top-1 flex items-end justify-between gap-2 px-1">
                        {dailySales.map((item) => {
                          const height = `${
                            (item.amount / 45) * 100
                          }%`;

                          return (
                            <div
                              key={item.day}
                              className="group flex h-full flex-1 flex-col items-center justify-end"
                            >
                              <div className="relative flex w-full flex-1 items-end justify-center">
                                <div
                                  title={`${item.day}: ${item.amount} million VND`}
                                  className={`w-[52%] min-w-[24px] max-w-[42px] rounded-t-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-90 ${
                                    item.highlighted
                                      ? "bg-orange-700 shadow-sm"
                                      : "bg-orange-300 group-hover:bg-orange-400"
                                  }`}
                                  style={{
                                    height,
                                  }}
                                >
                                  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 font-sans text-[8px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                                    {item.amount}M
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`mt-2 font-sans text-[9px] font-semibold ${
                                  item.highlighted
                                    ? "text-orange-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {item.day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* Payment Distribution */}
                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-black text-slate-800">
                        Payment Methods
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {paymentMethods.map(
                        (method) => (
                          <div key={method.label}>
                            <div className="mb-1.5 flex items-center justify-between">
                              <div
                                className={`flex items-center gap-2 font-sans text-[10px] font-semibold ${
                                  method.emphasized
                                    ? "text-slate-700"
                                    : "text-slate-500"
                                }`}
                              >
                                <span
                                  className={
                                    method.emphasized
                                      ? "text-orange-700"
                                      : "text-slate-500"
                                  }
                                >
                                  {method.icon}
                                </span>

                                {method.label}
                              </div>

                              <span className="font-sans text-[10px] font-bold text-slate-600">
                                {method.percentage}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  method.emphasized
                                    ? "bg-orange-700"
                                    : "bg-slate-500"
                                }`}
                                style={{
                                  width: `${method.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* Quick Insight */}
                  <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-700 text-white">
                        <SlidersHorizontal size={16} />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-800">
                          Financial Insight
                        </h3>

                        <p className="mt-1 font-sans text-[10px] leading-5 text-slate-500">
                          Credit card payments account for
                          the largest share, representing 65%
                          of total transactions during this
                          period.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RevenueAndAuditLogPage;