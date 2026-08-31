import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
  X,
  Check,
  Receipt,
  Split,
  ShoppingBag,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SubBill {
  id: string;
  name: string;
  items: BillItem[];
}

export interface SplitState {
  unassignedItems: BillItem[];
  subBills: SubBill[];
  selectedSubBillId: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const ORIGINAL_TOTAL = 315000;

const INITIAL_UNASSIGNED_ITEMS: BillItem[] = [
  {
    id: "pho-bo",
    name: "Special Beef Pho",
    quantity: 2,
    unitPrice: 65000,
  },
  {
    id: "coffee",
    name: "Vietnamese Iced Milk Coffee",
    quantity: 1,
    unitPrice: 30000,
  },
  {
    id: "cha-gio",
    name: "Shrimp & Pork Spring Rolls",
    quantity: 1,
    unitPrice: 45000,
  },
  {
    id: "tra-da",
    name: "Iced Tea",
    quantity: 4,
    unitPrice: 5000,
  },
];

const INITIAL_SUB_BILLS: SubBill[] = [
  {
    id: "bill-1",
    name: "Bill 1",
    items: [
      {
        id: "coffee-assigned",
        name: "Vietnamese Iced Milk Coffee",
        quantity: 2,
        unitPrice: 30000,
      },
    ],
  },
  {
    id: "bill-2",
    name: "Bill 2",
    items: [],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value: number) => {
  return `${value.toLocaleString("vi-VN")} VND`;
};

const getItemTotal = (item: BillItem) => {
  return item.quantity * item.unitPrice;
};

const getBillTotal = (bill: SubBill) => {
  return bill.items.reduce(
    (total, item) => total + getItemTotal(item),
    0,
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const SplitBillModal: React.FC = () => {
  const navigate = useNavigate();

  const [unassignedItems, setUnassignedItems] = useState<BillItem[]>(
    INITIAL_UNASSIGNED_ITEMS,
  );

  const [subBills, setSubBills] =
    useState<SubBill[]>(INITIAL_SUB_BILLS);

  const [selectedSubBillId, setSelectedSubBillId] =
    useState<string>("bill-1");

  const [quickSplitCount, setQuickSplitCount] =
    useState<number>(2);

  const [draggedItem, setDraggedItem] = useState<{
    item: BillItem;
    source: "unassigned" | "bill";
    sourceBillId?: string;
  } | null>(null);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const splitTotal = useMemo(() => {
    return subBills.reduce(
      (total, bill) => total + getBillTotal(bill),
      0,
    );
  }, [subBills]);

  const remainingTotal = useMemo(() => {
    return Math.max(ORIGINAL_TOTAL - splitTotal, 0);
  }, [splitTotal]);

  const progress = useMemo(() => {
    if (!ORIGINAL_TOTAL) return 0;

    return Math.min(
      Math.round((splitTotal / ORIGINAL_TOTAL) * 100),
      100,
    );
  }, [splitTotal]);

  /* =========================================================
     ADD SUB BILL
  ========================================================= */

  const handleAddSubBill = () => {
    const nextNumber = subBills.length + 1;

    const newBill: SubBill = {
      id: `bill-${Date.now()}`,
      name: `Bill ${nextNumber}`,
      items: [],
    };

    setSubBills((prev) => [...prev, newBill]);
    setSelectedSubBillId(newBill.id);
  };

  /* =========================================================
     DELETE SUB BILL
  ========================================================= */

  const handleDeleteSubBill = (billId: string) => {
    const targetBill = subBills.find(
      (bill) => bill.id === billId,
    );

    if (!targetBill) return;

    if (targetBill.items.length > 0) {
      setUnassignedItems((prev) => [
        ...prev,
        ...targetBill.items,
      ]);
    }

    const remainingBills = subBills.filter(
      (bill) => bill.id !== billId,
    );

    if (remainingBills.length === 0) {
      const fallbackBill: SubBill = {
        id: "bill-1",
        name: "Bill 1",
        items: [],
      };

      setSubBills([fallbackBill]);
      setSelectedSubBillId(fallbackBill.id);
      return;
    }

    setSubBills(remainingBills);

    if (selectedSubBillId === billId) {
      setSelectedSubBillId(remainingBills[0].id);
    }
  };

  /* =========================================================
     MOVE ITEM TO BILL
  ========================================================= */

  const handleMoveToBill = (
    item: BillItem,
    targetBillId: string,
  ) => {
    setUnassignedItems((prev) =>
      prev.filter(
        (currentItem) => currentItem.id !== item.id,
      ),
    );

    setSubBills((prevBills) =>
      prevBills.map((bill) => {
        if (bill.id !== targetBillId) return bill;

        const existingItem = bill.items.find(
          (currentItem) =>
            currentItem.name === item.name &&
            currentItem.unitPrice === item.unitPrice,
        );

        if (existingItem) {
          return {
            ...bill,
            items: bill.items.map((currentItem) =>
              currentItem.id === existingItem.id
                ? {
                    ...currentItem,
                    quantity:
                      currentItem.quantity +
                      item.quantity,
                  }
                : currentItem,
            ),
          };
        }

        return {
          ...bill,
          items: [
            ...bill.items,
            {
              ...item,
              id: `${item.id}-${targetBillId}-${Date.now()}`,
            },
          ],
        };
      }),
    );

    setSelectedSubBillId(targetBillId);
  };

  /* =========================================================
     MOVE ITEM BACK TO UNASSIGNED
  ========================================================= */

  const handleMoveBackToUnassigned = (
    item: BillItem,
    billId: string,
  ) => {
    setSubBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              items: bill.items.filter(
                (currentItem) =>
                  currentItem.id !== item.id,
              ),
            }
          : bill,
      ),
    );

    setUnassignedItems((prev) => [
      ...prev,
      {
        ...item,
        id: `${item.id}-unassigned-${Date.now()}`,
      },
    ]);
  };

  /* =========================================================
     DRAG START
  ========================================================= */

  const handleDragStart = (
    item: BillItem,
    source: "unassigned" | "bill",
    sourceBillId?: string,
  ) => {
    setDraggedItem({
      item,
      source,
      sourceBillId,
    });
  };

  /* =========================================================
     DROP ON BILL
  ========================================================= */

  const handleDropOnBill = (
    targetBillId: string,
  ) => {
    if (!draggedItem) return;

    const {
      item,
      source,
      sourceBillId,
    } = draggedItem;

    if (
      source === "bill" &&
      sourceBillId === targetBillId
    ) {
      setDraggedItem(null);
      return;
    }

    if (source === "unassigned") {
      handleMoveToBill(item, targetBillId);
    }

    if (
      source === "bill" &&
      sourceBillId
    ) {
      setSubBills((prevBills) =>
        prevBills.map((bill) => {
          if (bill.id === sourceBillId) {
            return {
              ...bill,
              items: bill.items.filter(
                (currentItem) =>
                  currentItem.id !== item.id,
              ),
            };
          }

          if (bill.id === targetBillId) {
            const existingItem =
              bill.items.find(
                (currentItem) =>
                  currentItem.name === item.name &&
                  currentItem.unitPrice ===
                    item.unitPrice,
              );

            if (existingItem) {
              return {
                ...bill,
                items: bill.items.map(
                  (currentItem) =>
                    currentItem.id ===
                    existingItem.id
                      ? {
                          ...currentItem,
                          quantity:
                            currentItem.quantity +
                            item.quantity,
                        }
                      : currentItem,
                ),
              };
            }

            return {
              ...bill,
              items: [
                ...bill.items,
                {
                  ...item,
                  id: `${item.id}-${targetBillId}-${Date.now()}`,
                },
              ],
            };
          }

          return bill;
        }),
      );

      setSelectedSubBillId(targetBillId);
    }

    setDraggedItem(null);
  };

  /* =========================================================
     DROP ON UNASSIGNED
  ========================================================= */

  const handleDropOnUnassigned = () => {
    if (!draggedItem) return;

    const {
      item,
      source,
      sourceBillId,
    } = draggedItem;

    if (
      source === "bill" &&
      sourceBillId
    ) {
      handleMoveBackToUnassigned(
        item,
        sourceBillId,
      );
    }

    setDraggedItem(null);
  };

  /* =========================================================
     QUICK SPLIT
  ========================================================= */

  const handleQuickSplit = () => {
    if (quickSplitCount < 2) return;

    const allItems: BillItem[] = [
      ...unassignedItems,
      ...subBills.flatMap(
        (bill) => bill.items,
      ),
    ];

    if (allItems.length === 0) return;

    const newBills: SubBill[] =
      Array.from(
        { length: quickSplitCount },
        (_, index) => ({
          id: `quick-bill-${index + 1}-${Date.now()}`,
          name: `Bill ${index + 1}`,
          items: [],
        }),
      );

    allItems.forEach((item, index) => {
      const targetIndex =
        index % quickSplitCount;

      newBills[targetIndex].items.push({
        ...item,
        id: `${item.id}-quick-${index}-${Date.now()}`,
      });
    });

    setSubBills(newBills);
    setUnassignedItems([]);
    setSelectedSubBillId(
      newBills[0].id,
    );
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    setUnassignedItems(
      INITIAL_UNASSIGNED_ITEMS,
    );
    setSubBills(INITIAL_SUB_BILLS);
    setSelectedSubBillId("bill-1");
    setQuickSplitCount(2);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {
    const payload: SplitState = {
      unassignedItems,
      subBills,
      selectedSubBillId,
    };

    console.log(
      "Split bill configuration:",
      payload,
    );

    alert(
      "Bill split configuration has been saved.",
    );
  };

  /* =========================================================
     RENDER ITEM
  ========================================================= */

  const renderUnassignedItem = (
    item: BillItem,
  ) => {
    return (
      <div
        key={item.id}
        draggable
        onDragStart={() =>
          handleDragStart(
            item,
            "unassigned",
          )
        }
        className="
          group
          flex
          min-h-[76px]
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3
          py-3
          shadow-sm
          transition
          hover:border-orange-300
          hover:bg-orange-50/40
          active:scale-[0.99]
          cursor-grab
        "
      >
        <div className="flex shrink-0 items-center text-slate-300">
          <GripVertical size={22} />
        </div>

        <div
          className="
            flex
            h-9
            min-w-10
            items-center
            justify-center
            rounded-lg
            bg-slate-100
            px-2
            text-sm
            font-bold
            text-slate-600
          "
        >
          x{item.quantity}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-slate-800">
            {item.name}
          </div>

          <div className="mt-1 text-sm font-medium text-slate-400">
            {formatCurrency(
              item.unitPrice,
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleMoveToBill(
              item,
              selectedSubBillId,
            )
          }
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-orange-600
            transition
            hover:bg-orange-100
            active:scale-95
          "
          aria-label={`Move ${item.name}`}
        >
          <ArrowRight
            size={23}
            strokeWidth={2.5}
          />
        </button>
      </div>
    );
  };

  /* =========================================================
     RENDER SUB BILL
  ========================================================= */

  const renderSubBill = (
    bill: SubBill,
  ) => {
    const isSelected =
      bill.id ===
      selectedSubBillId;

    const billTotal =
      getBillTotal(bill);

    return (
      <div
        key={bill.id}
        onClick={() =>
          setSelectedSubBillId(
            bill.id,
          )
        }
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={() =>
          handleDropOnBill(
            bill.id,
          )
        }
        className={`
          relative
          flex
          min-h-[390px]
          min-w-[320px]
          flex-1
          flex-col
          rounded-2xl
          border
          bg-white
          shadow-sm
          transition-all
          ${
            isSelected
              ? "border-orange-500 ring-2 ring-orange-100 shadow-md"
              : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        {isSelected && (
          <div
            className="
              absolute
              -top-0
              right-1
              z-10
              flex
              items-center
              gap-1.5
              rounded-full
              bg-orange-600
              px-3
              py-1
              text-xs
              font-bold
              text-white
              shadow-sm
            "
          >
            <Check
              size={13}
              strokeWidth={3}
            />
            Selected
          </div>
        )}

        {/* Bill Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                ${
                  isSelected
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              <Receipt size={21} />
            </div>

            <div>
              <div className="text-base font-bold text-slate-800">
                {bill.name}
              </div>

              <div className="text-xs font-medium text-slate-400">
                {bill.items.length} items
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteSubBill(
                bill.id,
              );
            }}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-red-50
              hover:text-red-500
            "
            aria-label={`Delete ${bill.name}`}
          >
            <Trash2 size={19} />
          </button>
        </div>

        {/* Bill Content */}

        <div className="flex-1 px-4 py-4">
          {bill.items.length === 0 ? (
            <div
              className="
                flex
                h-[205px]
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-slate-200
                px-5
                text-center
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-300
                "
              >
                <ShoppingBag size={25} />
              </div>

              <div className="text-sm font-semibold text-slate-500">
                Drag items here
              </div>

              <div className="mt-1 max-w-[210px] text-xs leading-5 text-slate-400">
                or use the arrow on the left
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {bill.items.map(
                (item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(
                      event,
                    ) => {
                      event.stopPropagation();

                      handleDragStart(
                        item,
                        "bill",
                        bill.id,
                      );
                    }}
                    className="
                      flex
                      min-h-[70px]
                      cursor-grab
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-100
                      bg-slate-50
                      px-3
                      py-3
                      transition
                      hover:border-orange-200
                      hover:bg-orange-50/50
                    "
                  >
                    <GripVertical
                      size={19}
                      className="shrink-0 text-slate-300"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
                          x{item.quantity}
                        </span>

                        <span className="truncate text-sm font-bold text-slate-700">
                          {item.name}
                        </span>
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-400">
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-sm font-extrabold text-slate-800">
                      {formatCurrency(
                        getItemTotal(item),
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        handleMoveBackToUnassigned(
                          item,
                          bill.id,
                        );
                      }}
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-400
                        transition
                        hover:bg-red-50
                        hover:text-red-500
                      "
                      aria-label="Remove item from bill"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Bill Footer */}

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Subtotal:
            </span>

            <span className="text-lg font-extrabold text-slate-800">
              {formatCurrency(
                billTotal,
              )}
            </span>
          </div>

          <button
            type="button"
            disabled={billTotal === 0}
            onClick={(event) => {
              event.stopPropagation();

              if (billTotal === 0) return;

              console.log(
                `Pay ${bill.name}`,
                bill,
              );
            }}
            className={`
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              text-sm
              font-bold
              transition
              ${
                billTotal > 0
                  ? "bg-orange-700 text-white shadow-sm hover:bg-orange-800 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-100 text-slate-300"
              }
            `}
          >
            <CreditCard size={18} />
            Pay Now
          </button>
        </div>
      </div>
    );
  };

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div
      className="
        flex
        h-screen
        w-full
        flex-col
        overflow-hidden
        bg-slate-50
        text-slate-900
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          flex
          h-[88px]
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          bg-white
          px-7
        "
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              text-slate-600
              transition
              hover:bg-slate-100
              active:scale-95
            "
            aria-label="Close"
          >
            <X size={27} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Split Bill
              </h1>

              <span
                className="
                  rounded-full
                  bg-orange-100
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-orange-700
                "
              >
                In Service
              </span>
            </div>

            <div className="mt-1 text-sm font-medium text-slate-400">
              Table 12{" "}
              <span className="mx-1">
                •
              </span>{" "}
              Order #8821
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-400">
            Original Bill Total
          </span>

          <span className="mt-0.5 text-3xl font-extrabold tracking-tight text-orange-600">
            {formatCurrency(
              ORIGINAL_TOTAL,
            )}
          </span>
        </div>
      </header>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="
          flex
          h-[70px]
          shrink-0
          items-center
          gap-4
          border-b
          border-slate-200
          bg-white
          px-7
        "
      >
        <button
          type="button"
          className="
            flex
            h-11
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-slate-100
            px-5
            text-sm
            font-bold
            text-slate-700
            shadow-sm
          "
        >
          <Split
            size={18}
            className="text-slate-600"
          />

          Split by Items
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div
          className="
            flex
            h-11
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            px-3
          "
        >
          <span className="text-sm font-semibold text-slate-500">
            Quick Equal Split:
          </span>

          <button
            type="button"
            disabled={
              quickSplitCount <= 2
            }
            onClick={() =>
              setQuickSplitCount(
                (value) =>
                  Math.max(
                    value - 1,
                    2,
                  ),
              )
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-white
              text-slate-500
              shadow-sm
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
            aria-label="Decrease split count"
          >
            <ChevronLeft
              size={17}
            />
          </button>

          <span className="min-w-7 text-center text-base font-extrabold text-slate-800">
            {quickSplitCount}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuickSplitCount(
                (value) =>
                  Math.min(
                    value + 1,
                    10,
                  ),
              )
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-white
              text-slate-500
              shadow-sm
              transition
              hover:bg-slate-100
            "
            aria-label="Increase split count"
          >
            <ChevronRight
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={
              handleQuickSplit
            }
            className="
              ml-1
              flex
              h-9
              items-center
              rounded-lg
              bg-orange-100
              px-4
              text-sm
              font-bold
              text-orange-700
              transition
              hover:bg-orange-200
              active:scale-95
            "
          >
            Apply
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          min-h-0
          flex-1
          overflow-hidden
          px-7
          py-5
        "
      >
        <div
          className="
            grid
            h-full
            min-h-0
            grid-cols-[330px_minmax(0,1fr)]
            gap-6
          "
        >
          {/* =================================================
              LEFT - UNASSIGNED
          ================================================= */}

          <section
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={
              handleDropOnUnassigned
            }
            className="
              flex
              min-h-0
              flex-col
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <div className="shrink-0 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Unassigned Items
                </h2>

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  {unassignedItems.length} items
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Drag and drop or select an item to move it
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {unassignedItems.length ===
              0 ? (
                <div
                  className="
                    flex
                    h-full
                    min-h-[300px]
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border-2
                    border-dashed
                    border-slate-200
                    px-5
                    text-center
                  "
                >
                  <div
                    className="
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-green-50
                      text-green-500
                    "
                  >
                    <Check size={26} />
                  </div>

                  <div className="text-base font-bold text-slate-600">
                    All Items Assigned
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    All items have been assigned
                  </div>
                </div>
              ) : (
                unassignedItems.map(
                  renderUnassignedItem,
                )
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-400">
                  Unassigned Value
                </span>

                <span className="font-extrabold text-slate-700">
                  {formatCurrency(
                    unassignedItems.reduce(
                      (
                        sum,
                        item,
                      ) =>
                        sum +
                        getItemTotal(
                          item,
                        ),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT - BILLS
          ================================================= */}

          <section className="min-h-0 overflow-x-auto">
            <div className="flex h-full min-w-max gap-4 pb-2">
              {subBills.map(
                renderSubBill,
              )}

              {/* ADD BILL */}

              <button
                type="button"
                onClick={
                  handleAddSubBill
                }
                className="
                  flex
                  min-h-[390px]
                  min-w-[270px]
                  flex-1
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-slate-300
                  bg-white/50
                  text-slate-500
                  transition-all
                  hover:border-orange-400
                  hover:bg-orange-50/40
                  hover:text-orange-600
                  active:scale-[0.99]
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    transition
                  "
                >
                  <Plus size={27} />
                </div>

                <span className="mt-4 text-base font-bold">
                  Add Another Bill
                </span>

                <span className="mt-1 text-xs font-medium text-slate-400">
                  Create an additional bill
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          STICKY FOOTER
      ===================================================== */}

      <footer
        className="
          flex
          h-[96px]
          shrink-0
          items-center
          justify-between
          border-t
          border-slate-200
          bg-white
          px-7
          shadow-[0_-4px_16px_rgba(15,23,42,0.04)]
        "
      >
        {/* LEFT */}

        <div className="w-[420px]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">
              Remaining Unassigned:
              <span className="ml-2 text-lg font-extrabold text-slate-800">
                {formatCurrency(
                  remainingTotal,
                )}
              </span>
            </div>

            <span className="text-xs font-bold text-slate-400">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="
                h-full
                rounded-full
                bg-orange-600
                transition-all
                duration-300
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-1.5 text-xs font-medium text-slate-400">
            {formatCurrency(
              splitTotal,
            )}{" "}
            /{" "}
            {formatCurrency(
              ORIGINAL_TOTAL,
            )}
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={
              handleReset
            }
            className="
              flex
              h-12
              items-center
              gap-2
              rounded-xl
              px-5
              text-sm
              font-bold
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <RotateCcw
              size={18}
            />
            Reset
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            className="
              flex
              h-13
              items-center
              gap-2
              rounded-xl
              bg-orange-700
              px-7
              text-base
              font-extrabold
              text-white
              shadow-sm
              transition
              hover:bg-orange-800
              active:scale-[0.98]
            "
          >
            <Check
              size={20}
              strokeWidth={2.5}
            />
            Save Split Configuration
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SplitBillModal;