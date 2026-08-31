import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import {
  AlertCircle,
  Bell,
  Broom,
  Check,
  Clock3,
  CreditCard,
  History,
  HelpCircle,
  MoreVertical,
  Plus,
  RefreshCw,
  Receipt,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Timer,
  User,
  Users,
  X,
  UtensilsCrossed,
  ShieldCheck,
  FileText,
  CircleDollarSign,
  Eye,
  LogOut,
} from "lucide-react";

/* =========================================================
   Types
========================================================= */

type TableStatus = "empty" | "occupied" | "reserved" | "dirty";
type FloorId = "floor-1" | "floor-2" | "terrace";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  refundable: boolean;
}

interface Table {
  id: string;
  name: string;
  floor: FloorId;
  status: TableStatus;
  guests: number;
  total: number;
  timer?: string;
  reservationTime?: string;
  customerName?: string;
  orderId?: string;
  orderItems?: OrderItem[];
}

interface RefundReasonItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface RefundFormData {
  refundType: "full" | "partial";
  selectedItems: string[];
  reason: string;
  note: string;
  managerPin: string;
}

/* =========================================================
   Constants
========================================================= */

const REFUND_REASONS: RefundReasonItem[] = [
  {
    id: "late-service",
    label: "Service took too long / Late order",
    description:
      "The customer waited beyond the expected service time and could not complete the meal.",
    icon: <Timer size={22} />,
  },
  {
    id: "food-quality",
    label: "Food quality issue",
    description:
      "The food was cold, incorrectly cooked, had the wrong flavor, or contained a foreign object.",
    icon: <UtensilsCrossed size={22} />,
  },
  {
    id: "wrong-order",
    label: "Wrong order / Wrong table",
    description:
      "The food served did not match the customer's order or was assigned to the wrong table.",
    icon: <FileText size={22} />,
  },
  {
    id: "payment-error",
    label: "Payment error / Incorrect amount",
    description:
      "Duplicate card charge, incorrect promotion, or incorrect bill amount.",
    icon: <CreditCard size={22} />,
  },
  {
    id: "customer-change",
    label: "Customer changed mind / Emergency cancellation",
    description:
      "The customer had an unexpected situation and left before the food was served.",
    icon: <LogOut size={22} />,
  },
  {
    id: "other",
    label: "Other reason",
    description:
      "Enter detailed notes so the manager can review the case.",
    icon: <MoreVertical size={22} />,
  },
];

const INITIAL_TABLES: Table[] = [
  {
    id: "1",
    name: "T101",
    floor: "floor-1",
    status: "occupied",
    guests: 4,
    total: 124.5,
    timer: "45m",
    orderId: "ORD-101",
    orderItems: [
      {
        id: "steak",
        name: "Grilled Ribeye Steak",
        quantity: 1,
        price: 58,
        refundable: true,
      },
      {
        id: "salmon",
        name: "Salmon Salad",
        quantity: 1,
        price: 32.5,
        refundable: true,
      },
      {
        id: "drinks",
        name: "Soft Drinks",
        quantity: 3,
        price: 34,
        refundable: true,
      },
    ],
  },
  {
    id: "2",
    name: "T102",
    floor: "floor-1",
    status: "empty",
    guests: 0,
    total: 0,
  },
  {
    id: "3",
    name: "T103",
    floor: "floor-1",
    status: "occupied",
    guests: 2,
    total: 45,
    timer: "1h 45m",
    orderId: "ORD-103",
    orderItems: [
      {
        id: "pasta",
        name: "Seafood Pasta",
        quantity: 1,
        price: 28,
        refundable: true,
      },
      {
        id: "juice",
        name: "Fresh Orange Juice",
        quantity: 2,
        price: 17,
        refundable: true,
      },
    ],
  },
  {
    id: "4",
    name: "T104",
    floor: "floor-1",
    status: "reserved",
    guests: 6,
    total: 0,
    reservationTime: "19:30",
    customerName: "John Doe",
  },
  {
    id: "5",
    name: "T105",
    floor: "floor-1",
    status: "dirty",
    guests: 0,
    total: 0,
  },
  {
    id: "6",
    name: "T106",
    floor: "floor-1",
    status: "empty",
    guests: 0,
    total: 0,
  },

  {
    id: "7",
    name: "T201",
    floor: "floor-2",
    status: "occupied",
    guests: 3,
    total: 82.5,
    timer: "32m",
    orderId: "ORD-201",
    orderItems: [
      {
        id: "burger",
        name: "Classic Bistro Burger",
        quantity: 2,
        price: 42,
        refundable: true,
      },
      {
        id: "coffee",
        name: "Iced Coffee",
        quantity: 2,
        price: 40.5,
        refundable: true,
      },
    ],
  },
  {
    id: "8",
    name: "T202",
    floor: "floor-2",
    status: "empty",
    guests: 0,
    total: 0,
  },
  {
    id: "9",
    name: "T203",
    floor: "floor-2",
    status: "reserved",
    guests: 4,
    total: 0,
    reservationTime: "20:00",
    customerName: "Emma Wilson",
  },
  {
    id: "10",
    name: "T204",
    floor: "floor-2",
    status: "dirty",
    guests: 0,
    total: 0,
  },

  {
    id: "11",
    name: "T301",
    floor: "terrace",
    status: "occupied",
    guests: 5,
    total: 156,
    timer: "1h 10m",
    orderId: "ORD-301",
    orderItems: [
      {
        id: "steak-terrace",
        name: "Bistro Signature Steak",
        quantity: 2,
        price: 92,
        refundable: true,
      },
      {
        id: "wine",
        name: "Sparkling Water",
        quantity: 2,
        price: 64,
        refundable: true,
      },
    ],
  },
  {
    id: "12",
    name: "T302",
    floor: "terrace",
    status: "empty",
    guests: 0,
    total: 0,
  },
  {
    id: "13",
    name: "T303",
    floor: "terrace",
    status: "reserved",
    guests: 2,
    total: 0,
    reservationTime: "21:00",
    customerName: "Michael Chen",
  },
];

/* =========================================================
   Helpers
========================================================= */

const currency = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* =========================================================
   Main Component
========================================================= */

const PosTableStatusPage: React.FC = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedFloor, setSelectedFloor] = useState<FloorId>("floor-1");
  const [activeFilter, setActiveFilter] = useState<TableStatus | "all">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [openActionTableId, setOpenActionTableId] = useState<string | null>(
    null,
  );

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [showNewOrderToast, setShowNewOrderToast] = useState(false);

  const [refundData, setRefundData] = useState<RefundFormData>({
    refundType: "full",
    selectedItems: [],
    reason: "",
    note: "",
    managerPin: "",
  });

  const [refundSuccess, setRefundSuccess] = useState(false);
  const [pinError, setPinError] = useState("");

  /* -------------------------------------------------------
     Counters
  ------------------------------------------------------- */

  const counters = useMemo(() => {
    return {
      empty: tables.filter((t) => t.status === "empty").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      dirty: tables.filter((t) => t.status === "dirty").length,
    };
  }, [tables]);

  /* -------------------------------------------------------
     Filtered tables
  ------------------------------------------------------- */

  const visibleTables = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesFloor = table.floor === selectedFloor;

      const matchesStatus =
        activeFilter === "all" || table.status === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        table.name.toLowerCase().includes(normalizedSearch) ||
        table.orderId?.toLowerCase().includes(normalizedSearch) ||
        table.customerName?.toLowerCase().includes(normalizedSearch);

      return matchesFloor && matchesStatus && matchesSearch;
    });
  }, [tables, selectedFloor, activeFilter, searchTerm]);

  /* -------------------------------------------------------
     Table actions
  ------------------------------------------------------- */

  const handleMarkClean = (tableId: string) => {
    setTables((current) =>
      current.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: "empty",
              guests: 0,
              total: 0,
              timer: undefined,
            }
          : table,
      ),
    );

    setOpenActionTableId(null);
  };

  const handleCreateOrder = (table: Table) => {
    setShowNewOrderToast(true);
    setTimeout(() => setShowNewOrderToast(false), 2500);

    setTables((current) =>
      current.map((item) =>
        item.id === table.id
          ? {
              ...item,
              status: "occupied",
              guests: 1,
              total: 0,
              timer: "0m",
              orderId: `ORD-${table.name.replace("T", "")}`,
              orderItems: [],
            }
          : item,
      ),
    );
  };

  const handleOpenOrder = (table: Table) => {
    setSelectedTable(table);
    setShowOrderDrawer(true);
    setOpenActionTableId(null);
  };

  const handleOpenRefund = (table: Table) => {
    setSelectedTable(table);
    setRefundData({
      refundType: "full",
      selectedItems: [],
      reason: "",
      note: "",
      managerPin: "",
    });
    setPinError("");
    setRefundSuccess(false);
    setShowRefundModal(true);
    setOpenActionTableId(null);
  };

  /* -------------------------------------------------------
     Refund
  ------------------------------------------------------- */

  const selectedRefundTotal = useMemo(() => {
    if (!selectedTable) return 0;

    if (refundData.refundType === "full") {
      return selectedTable.total;
    }

    return (
      selectedTable.orderItems
        ?.filter((item) => refundData.selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
    );
  }, [refundData.refundType, refundData.selectedItems, selectedTable]);

  const toggleRefundItem = (itemId: string) => {
    setRefundData((current) => ({
      ...current,
      selectedItems: current.selectedItems.includes(itemId)
        ? current.selectedItems.filter((id) => id !== itemId)
        : [...current.selectedItems, itemId],
    }));
  };

  const submitRefund = () => {
    if (!selectedTable) return;

    if (!refundData.reason) {
      setPinError("Please select a refund reason.");
      return;
    }

    if (refundData.reason === "other" && !refundData.note.trim()) {
      setPinError("Please enter details for the selected reason.");
      return;
    }

    if (refundData.refundType === "partial" && selectedRefundTotal <= 0) {
      setPinError("Please select at least one item to refund.");
      return;
    }

    if (!/^\d{4}$/.test(refundData.managerPin)) {
      setPinError("Manager PIN must contain exactly 4 digits.");
      return;
    }

    setPinError("");
    setRefundSuccess(true);

    setTimeout(() => {
      setTables((current) =>
        current.map((table) =>
          table.id === selectedTable.id
            ? {
                ...table,
                status: "empty",
                guests: 0,
                total: 0,
                timer: undefined,
                orderId: undefined,
                orderItems: [],
              }
            : table,
        ),
      );

      setRefundSuccess(false);
      setShowRefundModal(false);
      setSelectedTable(null);
    }, 1800);
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full w-full">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <CashierSidebar />

        <aside className="hidden">
          {/* Brand */}
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-slate-700">
              <User size={25} />
            </div>

            <div>
              <h1 className="text-[25px] font-extrabold leading-7 tracking-tight">
                Bistro
                <br />
                POS
              </h1>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Terminal 01
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">
            <SidebarItem
              icon={<ShoppingBag size={18} />}
              label="Sales"
            />

            <SidebarItem
              icon={<Receipt size={18} />}
              label="Orders"
              active
            />

            <SidebarItem
              icon={<History size={18} />}
              label="History"
            />

            <SidebarItem
              icon={<RotateCcw size={18} />}
              label="Refunds"
            />

            <SidebarItem
              icon={<Settings size={18} />}
              label="Settings"
            />
          </nav>

          {/* Bottom */}
          <div className="space-y-4 px-3 pb-5">
            <button
              type="button"
              onClick={() => {
                const firstEmpty = tables.find(
                  (table) =>
                    table.floor === selectedFloor &&
                    table.status === "empty",
                );

                if (firstEmpty) {
                  handleCreateOrder(firstEmpty);
                }
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c2410c] text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#ea580c] active:scale-[0.98]"
            >
              <Plus size={18} strokeWidth={3} />
              New Order
            </button>

            <div className="border-t border-white/10 pt-4">
              <button
                type="button"
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <HelpCircle size={18} />
                Support
              </button>
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* =================================================
              TOP HEADER
          ================================================= */}

          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7">
            <div className="flex items-center gap-7">
              <h2 className="text-[23px] font-bold tracking-tight text-slate-800">
                Checkout Express
              </h2>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search tables or orders..."
                  className="h-10 w-96 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HeaderIconButton onClick={() => window.alert("You have no new notifications.")}>
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </HeaderIconButton>

              <HeaderIconButton onClick={() => window.location.reload()}>
                <RefreshCw size={17} />
              </HeaderIconButton>

              <button
                type="button"
                onClick={() => navigate("/cashier/settings")}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white"
              >
                <User size={18} />
              </button>
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="flex-1 overflow-hidden bg-[#f8fafc] px-7 py-6">
            {/* Section Header */}

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-[30px] font-extrabold leading-9 tracking-tight text-slate-900">
                  Table Status
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Manage dining areas and live orders.
                </p>

                {/* Status Filters */}

                <div className="mt-5 flex items-center gap-2">
                  <StatusFilter
                    active={activeFilter === "empty"}
                    color="green"
                    label={`Empty (${counters.empty})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "empty" ? "all" : "empty",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "occupied"}
                    color="orange"
                    label={`Occupied (${counters.occupied})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "occupied" ? "all" : "occupied",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "reserved"}
                    color="blue"
                    label={`Reserved (${counters.reserved})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "reserved" ? "all" : "reserved",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "dirty"}
                    color="gray"
                    label={`Needs Cleaning (${counters.dirty})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "dirty" ? "all" : "dirty",
                      )
                    }
                  />
                </div>
              </div>

              {/* Floors */}

              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm">
                <FloorTab
                  active={selectedFloor === "floor-1"}
                  onClick={() => setSelectedFloor("floor-1")}
                >
                  Floor 1
                </FloorTab>

                <FloorTab
                  active={selectedFloor === "floor-2"}
                  onClick={() => setSelectedFloor("floor-2")}
                >
                  Floor 2
                </FloorTab>

                <FloorTab
                  active={selectedFloor === "terrace"}
                  onClick={() => setSelectedFloor("terrace")}
                >
                  Terrace
                </FloorTab>
              </div>
            </div>

            {/* Table Grid */}

            <div className="h-[calc(100%-122px)] overflow-y-auto pr-2">
              {visibleTables.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 xl:grid-cols-5">
                  {visibleTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      actionOpen={openActionTableId === table.id}
                      onToggleActions={() =>
                        setOpenActionTableId((current) =>
                          current === table.id ? null : table.id,
                        )
                      }
                      onCreateOrder={() => handleCreateOrder(table)}
                      onMarkClean={() => handleMarkClean(table.id)}
                      onViewOrder={() => handleOpenOrder(table)}
                      onRefund={() => handleOpenRefund(table)}
                      onSeatGuests={() => {
                        setTables((current) =>
                          current.map((item) =>
                            item.id === table.id
                              ? {
                                  ...item,
                                  status: "occupied",
                                  timer: "0m",
                                  total: 0,
                                  orderId: `ORD-${table.name.replace(
                                    "T",
                                    "",
                                  )}`,
                                  orderItems: [],
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  onClear={() => {
                    setActiveFilter("all");
                    setSearchTerm("");
                  }}
                />
              )}
            </div>
          </section>
        </main>
      </div>

      {/* =====================================================
          ORDER DRAWER
      ===================================================== */}

      {showOrderDrawer && selectedTable && (
        <OrderDrawer
          table={selectedTable}
          onClose={() => {
            setShowOrderDrawer(false);
            setSelectedTable(null);
          }}
          onRefund={() => {
            setShowOrderDrawer(false);
            handleOpenRefund(selectedTable);
          }}
        />
      )}

      {/* =====================================================
          REFUND MODAL
      ===================================================== */}

      {showRefundModal && selectedTable && (
        <RefundModal
          table={selectedTable}
          data={refundData}
          total={selectedRefundTotal}
          pinError={pinError}
          success={refundSuccess}
          onChange={setRefundData}
          onToggleItem={toggleRefundItem}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedTable(null);
          }}
          onSubmit={submitRefund}
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {showNewOrderToast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-2xl">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
            <Check size={16} />
          </div>

          New order created successfully.
        </div>
      )}
    </div>
  );
};

/* =========================================================
   Sidebar Item
========================================================= */

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
}) => {
  return (
    <button
      type="button"
      className={[
        "relative mb-1 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-orange-600" />
      )}

      <span className={active ? "text-orange-400" : ""}>{icon}</span>

      {label}
    </button>
  );
};

/* =========================================================
   Header Icon
========================================================= */

const HeaderIconButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {children}
    </button>
  );
};

/* =========================================================
   Floor Tab
========================================================= */

const FloorTab: React.FC<{
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ active, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 min-w-[72px] rounded-md px-3 text-xs font-bold transition",
        active
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
          : "text-slate-500 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

/* =========================================================
   Status Filter
========================================================= */

interface StatusFilterProps {
  label: string;
  active: boolean;
  color: "green" | "orange" | "blue" | "gray";
  onClick: () => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  label,
  active,
  color,
  onClick,
}) => {
  const colors = {
    green: {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      border: "border-emerald-200",
      background: "bg-emerald-50",
    },
    orange: {
      dot: "bg-orange-500",
      text: "text-orange-700",
      border: "border-orange-200",
      background: "bg-orange-50",
    },
    blue: {
      dot: "bg-sky-500",
      text: "text-sky-700",
      border: "border-sky-200",
      background: "bg-sky-50",
    },
    gray: {
      dot: "bg-slate-500",
      text: "text-slate-600",
      border: "border-slate-300",
      background: "bg-slate-100",
    },
  };

  const theme = colors[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-bold transition",
        theme.border,
        theme.text,
        active
          ? `${theme.background} shadow-sm ring-2 ring-current/10`
          : "bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
      {label}
    </button>
  );
};

/* =========================================================
   Table Card
========================================================= */

interface TableCardProps {
  table: Table;
  actionOpen: boolean;
  onToggleActions: () => void;
  onCreateOrder: () => void;
  onMarkClean: () => void;
  onViewOrder: () => void;
  onRefund: () => void;
  onSeatGuests: () => void;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  actionOpen,
  onToggleActions,
  onCreateOrder,
  onMarkClean,
  onViewOrder,
  onRefund,
  onSeatGuests,
}) => {
  const isOccupied = table.status === "occupied";
  const isEmpty = table.status === "empty";
  const isReserved = table.status === "reserved";
  const isDirty = table.status === "dirty";

  const cardClass = [
    "relative min-h-[190px] overflow-visible rounded-xl border bg-white shadow-sm transition-all duration-200",
    "hover:-translate-y-0.5 hover:shadow-md",
    isOccupied && "border-t-4 border-orange-500",
    isEmpty && "border-t-4 border-emerald-500",
    isReserved && "border-t-4 border-sky-500",
    isDirty && "border-slate-300 bg-slate-100",
    table.name === "T103" &&
      isOccupied &&
      "border border-amber-200 border-t-4 border-t-amber-400 bg-amber-50",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <div className="flex h-full flex-col p-4">
        {/* Header */}

        <div className="flex items-start justify-between">
          <div>
            <h4
              className={[
                "text-[22px] font-extrabold tracking-tight",
                isDirty ? "text-slate-500" : "text-slate-900",
              ].join(" ")}
            >
              {table.name}
            </h4>
          </div>

          {isOccupied && (
            <span className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
              <Clock3 size={11} />
              {table.timer}
            </span>
          )}

          {isEmpty && (
            <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
              Empty
            </span>
          )}

          {isReserved && (
            <span className="rounded-md bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">
              {table.reservationTime}
            </span>
          )}

          {isDirty && (
            <span className="rounded-md bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500">
              Dirty
            </span>
          )}
        </div>

        {/* Body */}

        <div className="mt-4 flex-1">
          {!isDirty ? (
            <>
              <div
                className={[
                  "flex items-center gap-1.5 text-xs font-medium",
                  isEmpty ? "text-slate-400" : "text-slate-600",
                ].join(" ")}
              >
                <Users size={13} />

                {isEmpty ? "-- Guests" : `${table.guests} Guests`}
              </div>

              {isReserved && table.customerName && (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {table.customerName}
                </p>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-[62px] items-center justify-center">
              <Broom size={28} className="text-slate-300" />
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="mt-3 border-t border-slate-100 pt-3">
          {isOccupied && (
            <div className="flex items-center justify-between">
              <span className="text-[18px] font-black tracking-tight text-slate-800">
                {currency(table.total)}
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={onToggleActions}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <MoreVertical size={18} />
                </button>

                {actionOpen && (
                  <TableActionMenu
                    onViewOrder={onViewOrder}
                    onRefund={onRefund}
                  />
                )}
              </div>
            </div>
          )}

          {isEmpty && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">
                $0.00
              </span>

              <button
                type="button"
                onClick={onCreateOrder}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Plus size={19} />
              </button>
            </div>
          )}

          {isReserved && (
            <button
              type="button"
              onClick={onSeatGuests}
              className="h-9 w-full rounded-lg border border-sky-200 bg-sky-50 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
            >
              Seat Guests
            </button>
          )}

          {isDirty && (
            <button
              type="button"
              onClick={onMarkClean}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Mark Clean
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Table Action Menu
========================================================= */

const TableActionMenu: React.FC<{
  onViewOrder: () => void;
  onRefund: () => void;
}> = ({ onViewOrder, onRefund }) => {
  return (
    <div className="absolute bottom-9 right-0 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      <button
        type="button"
        onClick={onViewOrder}
        className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Eye size={15} />
        View Order
      </button>

      <button
        type="button"
        onClick={onRefund}
        className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        <RotateCcw size={15} />
        Refund / Cancel
      </button>
    </div>
  );
};

/* =========================================================
   Empty State
========================================================= */

const EmptyState: React.FC<{
  onClear: () => void;
}> = ({ onClear }) => {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Search size={28} />
        </div>

        <h4 className="mt-4 text-lg font-extrabold text-slate-800">
          No tables found
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          Try another floor, status filter, or search term.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-4 h-10 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white hover:bg-orange-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Order Drawer
========================================================= */

interface OrderDrawerProps {
  table: Table;
  onClose: () => void;
  onRefund: () => void;
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({
  table,
  onClose,
  onRefund,
}) => {
  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close order drawer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-[470px] flex-col bg-white shadow-2xl">
        <div className="flex h-[82px] items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Live Order
            </p>

            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              {table.name} · {table.orderId}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            <InfoBox
              label="Guests"
              value={`${table.guests}`}
              icon={<Users size={18} />}
            />

            <InfoBox
              label="Dining Time"
              value={table.timer ?? "--"}
              icon={<Clock3 size={18} />}
            />
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900">
                Order Items
              </h4>

              <span className="text-xs font-semibold text-slate-400">
                {table.orderItems?.length ?? 0} items
              </span>
            </div>

            <div className="space-y-2">
              {table.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <span className="text-sm font-extrabold text-slate-800">
                    {currency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Order Total
              </span>

              <span className="text-2xl font-black text-slate-900">
                {currency(table.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onRefund}
              className="h-12 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700"
            >
              Refund / Cancel
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   Info Box
========================================================= */

const InfoBox: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
};

/* =========================================================
   Refund Modal
========================================================= */

interface RefundModalProps {
  table: Table;
  data: RefundFormData;
  total: number;
  pinError: string;
  success: boolean;
  onChange: React.Dispatch<React.SetStateAction<RefundFormData>>;
  onToggleItem: (itemId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
  table,
  data,
  total,
  pinError,
  success,
  onChange,
  onToggleItem,
  onClose,
  onSubmit,
}) => {
  if (success) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-6 backdrop-blur-sm">
        <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={38} strokeWidth={3} />
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-900">
            Refund Successful
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {currency(total)} has been recorded and table {table.name} has
            been returned to an empty status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-7 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                Refund / Cancel
              </span>

              <span className="text-xs font-bold text-slate-400">
                {table.orderId}
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Refund / Cancel Request - Table {table.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT */}

            <div className="col-span-7">
              {/* Refund Type */}

              <section>
                <SectionLabel
                  number="01"
                  title="Refund Type"
                />

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <RefundTypeCard
                    active={data.refundType === "full"}
                    title="Full Refund"
                    description="Refund the entire bill"
                    amount={currency(table.total)}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        refundType: "full",
                        selectedItems: [],
                      }))
                    }
                  />

                  <RefundTypeCard
                    active={data.refundType === "partial"}
                    title="Partial Refund"
                    description="Select specific items"
                    amount="Select items"
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        refundType: "partial",
                      }))
                    }
                  />
                </div>
              </section>

              {/* Items */}

              {data.refundType === "partial" && (
                <section className="mt-6">
                  <SectionLabel
                    number="02"
                    title="Select Items to Refund"
                  />

                  <div className="mt-3 space-y-2">
                    {table.orderItems?.map((item) => {
                      const checked = data.selectedItems.includes(item.id);

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => onToggleItem(item.id)}
                          className={[
                            "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition",
                            checked
                              ? "border-red-300 bg-red-50"
                              : "border-slate-200 bg-white hover:border-slate-300",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                              checked
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-slate-300 bg-white",
                            ].join(" ")}
                          >
                            {checked && (
                              <Check size={13} strokeWidth={3} />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800">
                              {item.name}
                            </span>

                            <span className="mt-1 block text-xs font-medium text-slate-400">
                              Qty {item.quantity}
                            </span>
                          </span>

                          <span className="text-sm font-black text-slate-800">
                            {currency(item.price * item.quantity)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Reason */}

              <section className="mt-6">
                <SectionLabel
                  number={data.refundType === "partial" ? "03" : "02"}
                  title="Refund Reason"
                />

                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {REFUND_REASONS.map((reason) => {
                    const active = data.reason === reason.id;

                    return (
                      <button
                        type="button"
                        key={reason.id}
                        onClick={() =>
                          onChange((current) => ({
                            ...current,
                            reason: reason.id,
                          }))
                        }
                        className={[
                          "flex min-h-[84px] items-start gap-3 rounded-xl border p-3.5 text-left transition",
                          active
                            ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            active
                              ? "bg-orange-600 text-white"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {reason.icon}
                        </span>

                        <span className="min-w-0">
                          <span className="block text-xs font-extrabold leading-4 text-slate-800">
                            {reason.label}
                          </span>

                          <span className="mt-1 block text-[10px] font-medium leading-4 text-slate-400">
                            {reason.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {data.reason === "other" && (
                  <textarea
                    value={data.note}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Enter detailed refund reason..."
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                )}
              </section>
            </div>

            {/* RIGHT */}

            <div className="col-span-5">
              <div className="sticky top-0 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={20}
                    className="text-orange-600"
                  />

                  <h3 className="text-sm font-extrabold text-slate-900">
                    Manager Approval
                  </h3>
                </div>

                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  A manager PIN is required to authorize the refund
                  transaction.
                </p>

                <div className="mt-5">
                  <label className="text-xs font-bold text-slate-700">
                    Manager Approval PIN
                  </label>

                  <input
                    value={data.managerPin}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      onChange((current) => ({
                        ...current,
                        managerPin: value,
                      }));
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    className="mt-2 h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                {pinError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{pinError}</span>
                  </div>
                )}

                {/* Summary */}

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Table
                    </span>

                    <span className="text-sm font-extrabold text-slate-900">
                      {table.name}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Refund Type
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      {data.refundType === "full"
                        ? "Full Refund"
                        : "Partial Refund"}
                    </span>
                  </div>

                  <div className="my-4 border-t border-dashed border-slate-200" />

                  <div className="flex items-end justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Refund Amount
                    </span>

                    <span className="text-3xl font-black tracking-tight text-red-600">
                      {currency(total)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] font-medium leading-4 text-amber-700">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  The refund transaction will be recorded in transaction
                  history and the audit log.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-7 py-5">
          <div>
            <p className="text-xs font-semibold text-slate-400">
              Amount to Refund
            </p>

            <p className="text-xl font-black text-slate-900">
              {currency(total)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Close / Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="flex h-12 items-center gap-2 rounded-xl bg-red-600 px-7 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.98]"
            >
              <RotateCcw size={17} />

              Confirm Refund ({currency(total)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Refund Type Card
========================================================= */

const RefundTypeCard: React.FC<{
  active: boolean;
  title: string;
  description: string;
  amount: string;
  onClick: () => void;
}> = ({ active, title, description, amount, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-4 text-left transition",
        active
          ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
          : "border-slate-200 bg-white hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full border",
            active
              ? "border-orange-600 bg-orange-600"
              : "border-slate-300",
          ].join(" ")}
        >
          {active && (
            <span className="h-2 w-2 rounded-full bg-white" />
          )}
        </span>

        <CircleDollarSign
          size={19}
          className={
            active ? "text-orange-600" : "text-slate-300"
          }
        />
      </div>

      <p className="mt-4 text-sm font-extrabold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-medium text-slate-400">
        {description}
      </p>

      <p
        className={[
          "mt-3 text-lg font-black",
          active ? "text-orange-700" : "text-slate-700",
        ].join(" ")}
      >
        {amount}
      </p>
    </button>
  );
};

/* =========================================================
   Section Label
========================================================= */

const SectionLabel: React.FC<{
  number: string;
  title: string;
}> = ({ number, title }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[10px] font-black text-white">
        {number}
      </span>

      <h3 className="text-sm font-extrabold text-slate-900">
        {title}
      </h3>
    </div>
  );
};

export default PosTableStatusPage;