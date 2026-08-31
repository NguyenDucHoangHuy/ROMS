import {
  Clock3,
  Gauge,
  Package,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

export default function OverviewView()  {
  return (
    <div style={{ padding: '30px 34px 60px', background: '#f7f5f2' }}>
      <PageHeading
        eyebrow="INTELLIGENT OPERATIONS"
        title="Tổng quan vận hành"
        description="Theo dõi nhịp vận hành nhà hàng và dự báo cho ca trưa."
        actions={
          <button className="button primary">
            <Sparkles /> Xem phân tích AI
          </button>
        }
      />
      <div className="kpi-grid four">
        <KPI
          icon={WalletCards}
          label="Doanh thu hôm nay"
          value="$14,280.50"
          detail="+12% so với hôm qua"
        />
        <KPI
          icon={Users}
          label="Khách trong ngày"
          value="342"
          detail="86% công suất đạt được"
        />
        <KPI
          icon={Clock3}
          label="Đơn đang chờ"
          value="18"
          detail="Thời gian xử lý TB: 14m"
          variant="gold-card"
        />
        <KPI
          icon={Package}
          label="Sức khỏe kho"
          value="4"
          detail="Mặt hàng sắp hết"
          variant="soft-red"
        />
      </div>
      <div className="content-grid overview-layout">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Hiệu suất doanh thu</h2>
              <p>Doanh thu trong 7 ngày gần nhất</p>
            </div>
            <div className="segmented">
              <button className="selected">7 ngày</button>
              <button>30 ngày</button>
            </div>
          </div>
          <div className="chart">
            <div className="chart-grid" />
            <svg
              viewBox="0 0 640 220"
              preserveAspectRatio="none"
              aria-label="Biểu đồ doanh thu"
            >
              <path
                d="M0 185 L90 108 L160 155 L220 45 L290 92 L350 35 L420 82 L480 5 L560 62 L640 20 L640 220 L0 220Z"
                fill="url(#chartFill)"
              />
              <path
                d="M0 185 L90 108 L160 155 L220 45 L290 92 L350 35 L420 82 L480 5 L560 62 L640 20"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="3"
              />
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--brand)" stopOpacity=".25" />
                  <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="chart-labels">
            <span>THỨ 2</span>
            <span>THỨ 3</span>
            <span>THỨ 4</span>
            <span>THỨ 5</span>
            <span>THỨ 6</span>
            <span>THỨ 7</span>
            <span>CN</span>
          </div>
        </section>
        <section className="insight-card">
          <div className="insight-title">
            <Sparkles /> AI Smart Insights
          </div>
          <p>
            <b>LABOR OPTIMIZATION</b>Expected 20% spike in orders at 7:00 PM.
            Suggested deploying 2 extra floor staff from 6:30 PM.
          </p>
          <p>
            <b>MENU PERFORMANCE</b>“Truffle Risotto” is trending 48% higher than
            last Thursday. Ensure kitchen prep for +15 units.
          </p>
          <button className="button gold">Automate Schedule Adjustments</button>
        </section>
      </div>
      <section className="live-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">LIVE OPERATIONS</p>
            <h2>Đơn hàng đang xử lý</h2>
          </div>
          <span className="live-pill">
            <i /> LIVE
          </span>
        </div>
        <div className="order-grid">
          <div className="order-card">
            <span>
              Order #8821 <b>12:45</b>
            </span>
            <p>
              2x Wagyu Slices
              <br />
              1x Truffle Fries
            </p>
            <button className="button gold">Đẩy bếp</button>
          </div>
          <div className="order-card featured">
            <span>
              Order #8825 <b>14:12</b>
            </span>
            <p>
              4x Sea Bass Crudo
              <br />
              Ref: Allergen Shellfish
            </p>
            <button className="button gold">Đẩy bếp</button>
          </div>
          <div className="harmony-card">
            <Gauge />
            <b>Operational Harmony</b>
            <span>
              ROMS system synchronizes front-of-house pacing with kitchen
              capacity in real-time.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}