import {
    ChevronRight,
  // Clock3,
  // Gauge,
  // Package,
  Search,
  // Sparkles,
  Split,
  // Users,
  Utensils,
  WalletCards,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
// import KPI from "../common/KPI";


export default function OrdersView() {
  const tables = [
    ["Table 12", "Server: Marco Polo", "$245.00", "4 GUESTS", "MAINS SERVED"],
    ["Table 04", "Server: Sarah J.", "$82.50", "2 GUESTS", "APPETIZERS"],
    ["Table 21", "Server: Marco Polo", "$412.20", "6 GUESTS", "BILL REQUESTED"],
  ];
  return (
    <div style={{ padding: '30px 34px 60px', background: '#f7f5f2' }}>
      <PageHeading
        eyebrow="FINANCIAL OPERATIONS"
        title="Orders & Billing"
        description="Quản lý hóa đơn, bàn đang phục vụ và trạng thái thanh toán."
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
        <section className="active-tables">
          <div className="section-title">
            <b>Active Tables</b>
            <span>LIVE</span>
          </div>
          <label className="search compact">
            <Search />
            <input placeholder="Search table or order..." />
          </label>
          {tables.map(([table, server, amount, guest, tag]) => (
            <article className="active-table" key={table}>
              <b>{table}</b>
              <strong>{amount}</strong>
              <small>{server}</small>
              <div>
                <span>{guest}</span>
                <span>{tag}</span>
              </div>
            </article>
          ))}
        </section>
        <section className="order-detail panel">
          <div className="order-icon">
            <Utensils />
          </div>
          <h3>Table 12 Detail</h3>
          <small>ORDER #88219</small>
          <div className="order-lines">
            <p>
              <b>2x</b> Truffle Ribeye Steak <strong>$130.00</strong>
              <small>Medium-rare, truffle peppercorn sauce</small>
            </p>
            <p>
              <b>1x</b> Lobster Thermidor <strong>$65.00</strong>
              <small>Traditional style</small>
            </p>
            <p>
              <b>1x</b> Aged Chardonnay <strong>$50.00</strong>
              <small>Bottle • 2018 Vintage</small>
            </p>
          </div>
          <div className="totals">
            <p>
              Subtotal <b>$245.00</b>
            </p>
            <p>
              Service Charge (10%) <b>$24.50</b>
            </p>
            <p>
              Tax <b>$19.60</b>
            </p>
            <hr />
            <p className="total">
              TOTAL AMOUNT <b>$289.10</b>
            </p>
          </div>
        </section>
        <aside className="payment-side">
          <h3>Payment</h3>
          <button>
            <WalletCards />
            <b>
              Card Payment<small>Visa, MC, Amex</small>
            </b>
            <ChevronRight />
          </button>
          <button>
            <WalletCards />
            <b>
              Cash<small>Manual registry entry</small>
            </b>
            <ChevronRight />
          </button>
          <button>
            <Split />{" "}
            <b>
              Split Bill<small>Divide by guest or items</small>
            </b>
            <ChevronRight />
          </button>
          <div className="quick-actions">
            <h3>QUICK ACTIONS</h3>
            <button>
              ▣<small>PRINT PRO-FORMA</small>
            </button>
            <button>
              ◇<small>ADD DISCOUNT</small>
            </button>
            <button>
              ⇄<small>TRANSFER ITEM</small>
            </button>
            <button className="void">
              ⊗<small>VOID ORDER</small>
            </button>
          </div>
          <div className="finalize">
            <small>FINALIZE TRANSACTION</small>
            <b>$289.10</b>
            <button>
              COMPLETE & CLOSE <ChevronRight />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}