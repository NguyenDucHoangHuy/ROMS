// import {
//     ChevronRight,
//   // Clock3,
//   // Gauge,
//   // Package,
//   Search,
//   // Sparkles,
//   Split,
//   // Users,
//   Utensils,
//   WalletCards,
// } from "lucide-react";

// import PageHeading from "../common/PageHeading";


// export default function OrdersView() {
//   const tables = [
//     ["Table 12", "Server: Marco Polo", "$245.00", "4 GUESTS", "MAINS SERVED"],
//     ["Table 04", "Server: Sarah J.", "$82.50", "2 GUESTS", "APPETIZERS"],
//     ["Table 21", "Server: Marco Polo", "$412.20", "6 GUESTS", "BILL REQUESTED"],
//   ];
//   return (
//     <div style={{ padding: '30px 34px 60px', background: '#f7f5f2' }}>
//       <PageHeading
//         eyebrow="FINANCIAL OPERATIONS"
//         title="Orders & Billing"
//         description="Manage bills, active tables, and payment status."
//       />
//       <div className="billing-kpis">
//         <span>
//           DAILY REVENUE <b>$12,482.50</b>
//         </span>
//         <span>
//           OPEN TABLES <b>14</b>
//         </span>
//         <span>
//           PENDING PAYMENTS <b>$1,120.00</b>
//         </span>
//       </div>
//       <div className="billing-layout">
//         <section className="active-tables">
//           <div className="section-title">
//             <b>Active Tables</b>
//             <span>LIVE</span>
//           </div>
//           <label className="search compact">
//             <Search />
//             <input placeholder="Search table or order..." />
//           </label>
//           {tables.map(([table, server, amount, guest, tag]) => (
//             <article className="active-table" key={table}>
//               <b>{table}</b>
//               <strong>{amount}</strong>
//               <small>{server}</small>
//               <div>
//                 <span>{guest}</span>
//                 <span>{tag}</span>
//               </div>
//             </article>
//           ))}
//         </section>
//         <section className="order-detail panel">
//           <div className="order-icon">
//             <Utensils />
//           </div>
//           <h3>Table 12 Detail</h3>
//           <small>ORDER #88219</small>
//           <div className="order-lines">
//             <p>
//               <b>2x</b> Truffle Ribeye Steak <strong>$130.00</strong>
//               <small>Medium-rare, truffle peppercorn sauce</small>
//             </p>
//             <p>
//               <b>1x</b> Lobster Thermidor <strong>$65.00</strong>
//               <small>Traditional style</small>
//             </p>
//             <p>
//               <b>1x</b> Aged Chardonnay <strong>$50.00</strong>
//               <small>Bottle • 2018 Vintage</small>
//             </p>
//           </div>
//           <div className="totals">
//             <p>
//               Subtotal <b>$245.00</b>
//             </p>
//             <p>
//               Service Charge (10%) <b>$24.50</b>
//             </p>
//             <p>
//               Tax <b>$19.60</b>
//             </p>
//             <hr />
//             <p className="total">
//               TOTAL AMOUNT <b>$289.10</b>
//             </p>
//           </div>
//         </section>
//         <aside className="payment-side">
//           <h3>Payment</h3>
//           <button>
//             <WalletCards />
//             <b>
//               Card Payment<small>Visa, MC, Amex</small>
//             </b>
//             <ChevronRight />
//           </button>
//           <button>
//             <WalletCards />
//             <b>
//               Cash<small>Manual registry entry</small>
//             </b>
//             <ChevronRight />
//           </button>
//           <button>
//             <Split />{" "}
//             <b>
//               Split Bill<small>Divide by guest or items</small>
//             </b>
//             <ChevronRight />
//           </button>
//           <div className="quick-actions">
//             <h3>QUICK ACTIONS</h3>
//             <button>
//               ▣<small>PRINT PRO-FORMA</small>
//             </button>
//             <button>
//               ◇<small>ADD DISCOUNT</small>
//             </button>
//             <button>
//               ⇄<small>TRANSFER ITEM</small>
//             </button>
//             <button className="void">
//               ⊗<small>VOID ORDER</small>
//             </button>
//           </div>
//           <div className="finalize">
//             <small>FINALIZE TRANSACTION</small>
//             <b>$289.10</b>
//             <button>
//               COMPLETE & CLOSE <ChevronRight />
//             </button>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  Search,
  Split,
  Utensils,
  WalletCards,
  Calendar,
  ReceiptText,
} from "lucide-react";

import PageHeading from "../common/PageHeading";

// Khai báo kiểu dữ liệu cho Order/Table
interface TableOrder {
  id: string;
  table: string;
  server: string;
  amount: string;
  guest: string;
  tag: string;
  date: string; // Định dạng YYYY-MM-DD
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    note: string;
  }>;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

// Tạo danh sách 30 ngày gần nhất dạng YYYY-MM-DD
const generateLast30Days = () => {
  const days: { label: string; value: string }[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const value = d.toISOString().split("T")[0];
    
    let label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (i === 0) label = `Today (${label})`;
    else if (i === 1) label = `Yesterday (${label})`;

    days.push({ label, value });
  }
  return days;
};

// Dữ liệu mẫu mở rộng với ngày tháng
const TODAY_STR = new Date().toISOString().split("T")[0];

const MOCK_TABLES_DATA: TableOrder[] = [
  {
    id: "1",
    table: "Table 12",
    server: "Server: Marco Polo",
    amount: "$245.00",
    guest: "4 GUESTS",
    tag: "MAINS SERVED",
    date: TODAY_STR,
    orderNumber: "88219",
    subtotal: 245.0,
    serviceCharge: 24.5,
    tax: 19.6,
    total: 289.1,
    items: [
      {
        name: "Truffle Ribeye Steak",
        quantity: 2,
        price: 130.0,
        note: "Medium-rare, truffle peppercorn sauce",
      },
      {
        name: "Lobster Thermidor",
        quantity: 1,
        price: 65.0,
        note: "Traditional style",
      },
      {
        name: "Aged Chardonnay",
        quantity: 1,
        price: 50.0,
        note: "Bottle • 2018 Vintage",
      },
    ],
  },
  {
    id: "2",
    table: "Table 04",
    server: "Server: Sarah J.",
    amount: "$82.50",
    guest: "2 GUESTS",
    tag: "APPETIZERS",
    date: TODAY_STR,
    orderNumber: "88220",
    subtotal: 82.5,
    serviceCharge: 8.25,
    tax: 6.6,
    total: 97.35,
    items: [
      {
        name: "Caesar Salad",
        quantity: 2,
        price: 32.5,
        note: "Extra parmesan",
      },
      {
        name: "Crispy Calamari",
        quantity: 1,
        price: 50.0,
        note: "Spicy aioli sauce",
      },
    ],
  },
  {
    id: "3",
    table: "Table 21",
    server: "Server: Marco Polo",
    amount: "$412.20",
    guest: "6 GUESTS",
    tag: "BILL REQUESTED",
    date: TODAY_STR,
    orderNumber: "88221",
    subtotal: 412.2,
    serviceCharge: 41.22,
    tax: 32.98,
    total: 486.4,
    items: [
      {
        name: "Seafood Platter",
        quantity: 2,
        price: 260.0,
        note: "Fresh oysters, crab legs, shrimp",
      },
      {
        name: "Pinot Noir",
        quantity: 2,
        price: 152.2,
        note: "Red wine bottle",
      },
    ],
  },
];

export default function OrdersView() {
  const dateOptions = useMemo(() => generateLast30Days(), []);
  
  // State quản lý ngày được chọn, từ khóa tìm kiếm và bàn đang chọn
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].value);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<TableOrder | null>(null);

  // Lọc danh sách theo Ngày và Tìm kiếm
  const filteredTables = useMemo(() => {
    return MOCK_TABLES_DATA.filter((item) => {
      const matchDate = item.date === selectedDate;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.table.toLowerCase().includes(query) ||
        item.server.toLowerCase().includes(query) ||
        item.orderNumber.toLowerCase().includes(query);

      return matchDate && matchQuery;
    });
  }, [selectedDate, searchQuery]);

  return (
    <div style={{ padding: "30px 34px 60px", background: "#f7f5f2" }}>
      <PageHeading
        eyebrow="FINANCIAL OPERATIONS"
        title="Orders & Billing"
        description="Manage bills, active tables, and payment status."
      />

      <div className="billing-kpis">
        <span>
          DAILY REVENUE <b>$12,482.50</b>
        </span>
        <span>
          OPEN TABLES <b>14</b>
        </span>
        <span>
          PENDING PAYMENTS <b>$1,120.00</b>
        </span>
      </div>

      <div className="billing-layout">
        {/* LEFT PANEL: ACTIVE TABLES & FILTERS */}
        <section className="active-tables">
          <div className="section-title">
            <b>Active Tables</b>
            <span>LIVE</span>
          </div>

          {/* Ô Tìm kiếm */}
          <label className="search compact">
            <Search />
            <input
              placeholder="Search table or order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>


          {/* Bộ lọc theo ngày (30 ngày gần nhất) */}
          <div className="date-filter-box" style={{ marginBottom: "12px", marginTop: "13px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", padding: "2px 12px", borderRadius: "8px", border: "1px solid #e2ded8" }}>
              <Calendar size={16} color="#777" />
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTable(null); // Reset detail khi đổi ngày
                }}
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "11px", fontWeight: 600, cursor: "pointer", color: "#878585" }}
              >
                {dateOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          

          {/* Danh sách Bàn */}
          {filteredTables.length > 0 ? (
            filteredTables.map((item) => {
              const isSelected = selectedTable?.id === item.id;
              return (
                <article
                  className={`active-table ${isSelected ? "selected" : ""}`}
                  key={item.id}
                  onClick={() => setSelectedTable(item)}
                  style={{
                    cursor: "pointer",
                    border: isSelected ? "2px solid #e07a5f" : "1px solid transparent",
                    background: isSelected ? "#fff" : undefined,
                  }}
                >
                  <b>{item.table}</b>
                  <strong>{item.amount}</strong>
                  <small>{item.server}</small>
                  <div>
                    <span>{item.guest}</span>
                    <span>{item.tag}</span>
                  </div>
                </article>
              );
            })
          ) : (
            <p style={{ padding: "20px 0", textAlign: "center", color: "#888", fontSize: "13px" }}>
              No tables found for this date.
            </p>
          )}
        </section>

        {/* MIDDLE PANEL: ORDER DETAIL / EMPTY STATE */}
        <section className="order-detail panel">
          {selectedTable ? (
            <>
              <div className="order-icon">
                <Utensils />
              </div>
              <h3>{selectedTable.table} Detail</h3>
              <small>ORDER #{selectedTable.orderNumber}</small>

              <div className="order-lines">
                {selectedTable.items.map((line, idx) => (
                  <p key={idx}>
                    <b>{line.quantity}x</b> {line.name}{" "}
                    <strong>${line.price.toFixed(2)}</strong>
                    <small>{line.note}</small>
                  </p>
                ))}
              </div>

              <div className="totals">
                <p>
                  Subtotal <b>${selectedTable.subtotal.toFixed(2)}</b>
                </p>
                <p>
                  Service Charge (10%){" "}
                  <b>${selectedTable.serviceCharge.toFixed(2)}</b>
                </p>
                <p>
                  Tax <b>${selectedTable.tax.toFixed(2)}</b>
                </p>
                <hr />
                <p className="total">
                  TOTAL AMOUNT <b>${selectedTable.total.toFixed(2)}</b>
                </p>
              </div>
            </>
          ) : (
            /* EMPTY STATE khi chưa chọn bàn */
            <div
              className="empty-state"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: "320px",
                textAlign: "center",
                color: "#999",
              }}
            >
              <ReceiptText size={48} strokeWidth={1.2} style={{ marginBottom: "12px", color: "#ccc" }} />
              <h4 style={{ margin: "0 0 6px", color: "#555" }}>No Table Selected</h4>
              <p style={{ margin: 0, fontSize: "13px", maxWidth: "220px" }}>
                Select an active table from the list on the left to view order details & billing options.
              </p>
            </div>
          )}
        </section>

        {/* RIGHT PANEL: PAYMENT */}
        <aside className="payment-side">
          <h3>Payment</h3>
          <button disabled={!selectedTable} style={{ opacity: selectedTable ? 1 : 0.5 }}>
            <WalletCards />
            <b>
              Card Payment<small>Visa, MC, Amex</small>
            </b>
            <ChevronRight />
          </button>
          <button disabled={!selectedTable} style={{ opacity: selectedTable ? 1 : 0.5 }}>
            <WalletCards />
            <b>
              Cash<small>Manual registry entry</small>
            </b>
            <ChevronRight />
          </button>
          <button disabled={!selectedTable} style={{ opacity: selectedTable ? 1 : 0.5 }}>
            <Split />{" "}
            <b>
              Split Bill<small>Divide by guest or items</small>
            </b>
            <ChevronRight />
          </button>

          <div className="quick-actions">
            <h3>QUICK ACTIONS</h3>
            <button disabled={!selectedTable}>
              ▣<small>PRINT PRO-FORMA</small>
            </button>
            <button disabled={!selectedTable}>
              ◇<small>ADD DISCOUNT</small>
            </button>
            <button disabled={!selectedTable}>
              ⇄<small>TRANSFER ITEM</small>
            </button>
            <button className="void" disabled={!selectedTable}>
              ⊗<small>VOID ORDER</small>
            </button>
          </div>

          <div className="finalize">
            <small>FINALIZE TRANSACTION</small>
            <b>{selectedTable ? `$${selectedTable.total.toFixed(2)}` : "$0.00"}</b>
            <button disabled={!selectedTable} style={{ opacity: selectedTable ? 1 : 0.5 }}>
              COMPLETE & CLOSE <ChevronRight />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}