import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  MoreVertical,
  Search,
  Users,
  UtensilsCrossed,
  Broom,
  Receipt,
  X,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

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

/* =========================================================
   Mock Data
========================================================= */

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
        id: "water",
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

const FloorMapView: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);

  const [selectedFloor, setSelectedFloor] =
    useState<FloorId>("floor-1");

  const [activeFilter, setActiveFilter] =
    useState<TableStatus | "all">("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTable, setSelectedTable] =
    useState<Table | null>(null);

  /* =======================================================
     Counters
  ======================================================= */

  const counters = useMemo(() => {
    return {
      empty: tables.filter((table) => table.status === "empty").length,

      occupied: tables.filter(
        (table) => table.status === "occupied",
      ).length,

      reserved: tables.filter(
        (table) => table.status === "reserved",
      ).length,

      dirty: tables.filter(
        (table) => table.status === "dirty",
      ).length,
    };
  }, [tables]);

  /* =======================================================
     Visible Tables
  ======================================================= */

  const visibleTables = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesFloor =
        table.floor === selectedFloor;

      const matchesStatus =
        activeFilter === "all" ||
        table.status === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        table.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        table.orderId
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        table.customerName
          ?.toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesFloor &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    tables,
    selectedFloor,
    activeFilter,
    searchTerm,
  ]);

  /* =======================================================
     Floor Statistics
  ======================================================= */

  const floorStatistics = useMemo(() => {
    const floorTables = tables.filter(
      (table) => table.floor === selectedFloor,
    );

    const occupiedTables = floorTables.filter(
      (table) => table.status === "occupied",
    );

    const totalRevenue = occupiedTables.reduce(
      (sum, table) => sum + table.total,
      0,
    );

    const totalGuests = occupiedTables.reduce(
      (sum, table) => sum + table.guests,
      0,
    );

    return {
      totalTables: floorTables.length,
      occupiedTables: occupiedTables.length,
      totalRevenue,
      totalGuests,
    };
  }, [tables, selectedFloor]);

  /* =======================================================
     Actions
  ======================================================= */

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
              orderId: undefined,
              orderItems: [],
            }
          : table,
      ),
    );

    setSelectedTable(null);
  };

  const handleSeatGuests = (tableId: string) => {
    setTables((current) =>
      current.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: "occupied",
              guests: table.guests || 1,
              total: 0,
              timer: "0m",
              orderId: `ORD-${table.name.replace("T", "")}`,
              orderItems: [],
            }
          : table,
      ),
    );
  };

  const handleCreateOrder = (tableId: string) => {
    setTables((current) =>
      current.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: "occupied",
              guests: 1,
              total: 0,
              timer: "0m",
              orderId: `ORD-${table.name.replace("T", "")}`,
              orderItems: [],
            }
          : table,
      ),
    );
  };

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="floor-map-view min-h-screen w-full bg-slate-100 font-sans text-slate-900">
      <style>{`
        .floor-map-view {
          font-size: 14px;
          line-height: 1.45;
        }

        .floor-map-view .page-heading h1 {
          font-family: var(--font-sans);
          font-size: 32px;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .floor-map-view .page-heading .description {
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
      <div className="flex min-h-screen w-full">
        {/* =================================================
            MAIN
        ================================================= */}

        <main className="flex min-w-0 flex-1 flex-col">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-[#f8fafc] px-7 pt-6">
            <PageHeading
              eyebrow="FLOOR OPERATIONS"
              title="Dining Room Map"
              description="Monitor table status and coordinate dining room operations."
              actions={
                <>
                  <button
                    type="button"
                    className="button secondary"
                  >
                    Main Hall
                  </button>

                  <button
                    type="button"
                    className="button primary"
                  >
                    + New Reservation
                  </button>
                </>
              }
            />
          </div>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="bg-[#f8fafc] px-7 pt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KPI
                icon={Users}
                label="TOTAL CAPACITY"
                value={`${floorStatistics.totalGuests} GUESTS`}
                detail={`${floorStatistics.occupiedTables} occupied tables`}
              />

              <KPI
                icon={Clock3}
                label="AVG. TURNOVER"
                value="54 MIN"
                detail="+8% vs. Tuesday"
              />

              <KPI
                icon={UtensilsCrossed}
                label="ACTIVE TABLES"
                value={`${floorStatistics.occupiedTables} OF ${floorStatistics.totalTables}`}
                detail={`${counters.reserved} reserved`}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <small className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  CURRENT REVENUE
                </small>

                <b className="mt-2 block text-2xl font-black tracking-tight text-slate-900">
                  {currency(floorStatistics.totalRevenue)}
                </b>

                <span className="mt-1 block text-xs font-medium text-slate-400">
                  Current floor
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="flex-1 bg-[#f8fafc] px-7 py-6">
            {/* =================================================
                TOP CONTROLS
            ================================================= */}

            <div className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-extrabold leading-8 tracking-tight text-slate-900">
                      Table Map
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      View and manage tables by dining area.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STATUS FILTERS
                ================================================= */}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <StatusFilter
                    active={activeFilter === "all"}
                    color="slate"
                    label={`All (${tables.filter(
                      (table) =>
                        table.floor === selectedFloor,
                    ).length})`}
                    onClick={() =>
                      setActiveFilter("all")
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "empty"}
                    color="green"
                    label={`Empty (${counters.empty})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "empty"
                          ? "all"
                          : "empty",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "occupied"}
                    color="orange"
                    label={`Occupied (${counters.occupied})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "occupied"
                          ? "all"
                          : "occupied",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "reserved"}
                    color="blue"
                    label={`Reserved (${counters.reserved})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "reserved"
                          ? "all"
                          : "reserved",
                      )
                    }
                  />

                  <StatusFilter
                    active={activeFilter === "dirty"}
                    color="gray"
                    label={`Needs Cleaning (${counters.dirty})`}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === "dirty"
                          ? "all"
                          : "dirty",
                      )
                    }
                  />
                </div>
              </div>

              {/* =================================================
                  FLOOR + SEARCH
              ================================================= */}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search tables..."
                    className="h-10 w-[220px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm">
                  <FloorTab
                    active={
                      selectedFloor === "floor-1"
                    }
                    onClick={() =>
                      setSelectedFloor("floor-1")
                    }
                  >
                    Floor 1
                  </FloorTab>

                  <FloorTab
                    active={
                      selectedFloor === "floor-2"
                    }
                    onClick={() =>
                      setSelectedFloor("floor-2")
                    }
                  >
                    Floor 2
                  </FloorTab>

                  <FloorTab
                    active={
                      selectedFloor === "terrace"
                    }
                    onClick={() =>
                      setSelectedFloor("terrace")
                    }
                  >
                    Terrace
                  </FloorTab>
                </div>
              </div>
            </div>

            {/* =================================================
                FLOOR MAP
            ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {/* Map Header */}

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <UtensilsCrossed size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {selectedFloor === "floor-1"
                        ? "Floor 1 Dining Area"
                        : selectedFloor === "floor-2"
                          ? "Floor 2 Dining Area"
                          : "Terrace Dining Area"}
                    </h3>

                    <p className="text-[11px] font-medium text-slate-400">
                      {visibleTables.length} tables displayed
                    </p>
                  </div>
                </div>

                {/* Legend */}

                <div className="flex flex-wrap items-center gap-4">
                  <LegendItem
                    color="bg-emerald-500"
                    label="Empty"
                  />

                  <LegendItem
                    color="bg-orange-500"
                    label="Occupied"
                  />

                  <LegendItem
                    color="bg-sky-500"
                    label="Reserved"
                  />

                  <LegendItem
                    color="bg-slate-400"
                    label="Needs Cleaning"
                  />
                </div>
              </div>

              {/* =================================================
                  TABLE GRID
              ================================================= */}

              {visibleTables.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {visibleTables.map((table) => (
                    <FloorTableCard
                      key={table.id}
                      table={table}
                      onSelect={() =>
                        setSelectedTable(table)
                      }
                      onCreateOrder={() =>
                        handleCreateOrder(table.id)
                      }
                      onMarkClean={() =>
                        handleMarkClean(table.id)
                      }
                      onSeatGuests={() =>
                        handleSeatGuests(table.id)
                      }
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
          TABLE DETAIL DRAWER
      ===================================================== */}

      {selectedTable && (
        <TableDetailDrawer
          table={selectedTable}
          onClose={() =>
            setSelectedTable(null)
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   Floor Table Card
========================================================= */

interface FloorTableCardProps {
  table: Table;
  onSelect: () => void;
  onCreateOrder: () => void;
  onMarkClean: () => void;
  onSeatGuests: () => void;
}

const FloorTableCard: React.FC<FloorTableCardProps> = ({
  table,
  onSelect,
  onCreateOrder,
  onMarkClean,
  onSeatGuests,
}) => {
  const isOccupied = table.status === "occupied";
  const isEmpty = table.status === "empty";
  const isReserved = table.status === "reserved";
  const isDirty = table.status === "dirty";

  const cardClass = [
    "relative min-h-[190px] cursor-pointer overflow-visible rounded-xl border bg-white shadow-sm transition-all duration-200",
    "hover:-translate-y-0.5 hover:shadow-md",
    isOccupied && "border-t-4 border-orange-500",
    isEmpty && "border-t-4 border-emerald-500",
    isReserved && "border-t-4 border-sky-500",
    isDirty && "border-slate-300 bg-slate-100",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClass}
      onClick={onSelect}
    >
      <div className="flex h-full flex-col p-4">
        {/* Header */}

        <div className="flex items-start justify-between">
          <div>
            <h4
              className={[
                "text-xl font-extrabold tracking-tight",
                isDirty
                  ? "text-slate-500"
                  : "text-slate-900",
              ].join(" ")}
            >
              {table.name}
            </h4>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {table.floor === "floor-1"
                ? "Floor 1"
                : table.floor === "floor-2"
                  ? "Floor 2"
                  : "Terrace"}
            </p>
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
                  isEmpty
                    ? "text-slate-400"
                    : "text-slate-600",
                ].join(" ")}
              >
                <Users size={13} />

                {isEmpty
                  ? "-- Guests"
                  : `${table.guests} Guests`}
              </div>

              {isReserved &&
                table.customerName && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {table.customerName}
                  </p>
                )}

              {isOccupied &&
                table.orderId && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Receipt size={12} />
                    {table.orderId}
                  </p>
                )}
            </>
          ) : (
            <div className="flex h-full min-h-[62px] items-center justify-center">
              <Broom
                size={28}
                className="text-slate-300"
              />
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="mt-3 border-t border-slate-100 pt-3">
          {isOccupied && (
            <div className="flex items-center justify-between">
              <span className="text-base font-black tracking-tight text-slate-800">
                {currency(table.total)}
              </span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">
                $0.00
              </span>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCreateOrder();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
              >
                +
              </button>
            </div>
          )}

          {isReserved && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSeatGuests();
              }}
              className="h-9 w-full rounded-lg border border-sky-200 bg-sky-50 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
            >
              Seat Guests
            </button>
          )}

          {isDirty && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMarkClean();
              }}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Check size={14} />
              Mark Clean
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Status Filter
========================================================= */

interface StatusFilterProps {
  label: string;
  active: boolean;
  color:
    | "green"
    | "orange"
    | "blue"
    | "gray"
    | "slate";
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

    slate: {
      dot: "bg-slate-700",
      text: "text-slate-700",
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
      <span
        className={`h-2 w-2 rounded-full ${theme.dot}`}
      />

      {label}
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
}> = ({
  active,
  children,
  onClick,
}) => {
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
   Legend
========================================================= */

const LegendItem: React.FC<{
  color: string;
  label: string;
}> = ({ color, label }) => {
  return (
    <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
      <i
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      {label}
    </span>
  );
};

/* =========================================================
   Empty State
========================================================= */

const EmptyState: React.FC<{
  onClear: () => void;
}> = ({ onClear }) => {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
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
          className="mt-4 h-10 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Table Detail Drawer
========================================================= */

const TableDetailDrawer: React.FC<{
  table: Table;
  onClose: () => void;
}> = ({ table, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close table details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        {/* Header */}

        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Table Details
            </p>

            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              {table.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* Status */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </p>

                <p className="mt-2 text-xl font-black capitalize text-slate-900">
                  {table.status}
                </p>
              </div>

              <StatusIcon status={table.status} />
            </div>
          </div>

          {/* Information */}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DetailBox
              label="Guests"
              value={`${table.guests}`}
              icon={<Users size={18} />}
            />

            <DetailBox
              label="Dining Time"
              value={table.timer ?? "--"}
              icon={<Clock3 size={18} />}
            />

            <DetailBox
              label="Order"
              value={table.orderId ?? "--"}
              icon={<Receipt size={18} />}
            />

            <DetailBox
              label="Total"
              value={currency(table.total)}
              icon={<UtensilsCrossed size={18} />}
            />
          </div>

          {/* Reservation */}

          {table.status === "reserved" && (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={20}
                  className="mt-0.5 text-sky-600"
                />

                <div>
                  <p className="text-sm font-extrabold text-sky-900">
                    Reservation
                  </p>

                  <p className="mt-1 text-xs font-medium text-sky-700">
                    {table.customerName ?? "Guest"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-sky-600">
                    {table.reservationTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order */}

          {table.orderItems &&
            table.orderItems.length > 0 && (
              <section className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Order Items
                  </h4>

                  <span className="text-xs font-semibold text-slate-400">
                    {table.orderItems.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {table.orderItems.map((item) => (
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
                        {currency(
                          item.price * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Revenue */}

          {table.status === "occupied" && (
            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  Current Total
                </span>

                <span className="text-2xl font-black text-slate-900">
                  {currency(table.total)}
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}

          {table.status === "empty" && (
            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-extrabold text-emerald-900">
                    Table Available
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-emerald-700">
                    This table is currently available for
                    new guests and orders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dirty */}

          {table.status === "dirty" && (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-100 p-5">
              <div className="flex items-start gap-3">
                <Broom
                  size={20}
                  className="mt-0.5 text-slate-500"
                />

                <div>
                  <p className="text-sm font-extrabold text-slate-700">
                    Cleaning Required
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                    The table needs to be cleaned before it
                    can be assigned to another guest.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="shrink-0 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   Detail Box
========================================================= */

const DetailBox: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-lg font-black text-slate-900">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   Status Icon
========================================================= */

const StatusIcon: React.FC<{
  status: TableStatus;
}> = ({ status }) => {
  if (status === "occupied") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
        <Users size={22} />
      </div>
    );
  }

  if (status === "reserved") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <CalendarDays size={22} />
      </div>
    );
  }

  if (status === "dirty") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
        <Broom size={22} />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
      <Check size={22} />
    </div>
  );
};

export default FloorMapView;