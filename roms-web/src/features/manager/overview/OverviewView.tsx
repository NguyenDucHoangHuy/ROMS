import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  DollarSign,
  Gauge,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  UtensilsCrossed,
  WalletCards,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/modules/analyticsService";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";
import { ROUTES } from "@/constants/routes";

// Format tiền tệ USD chuẩn
const formatMoney = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

export default function OverviewView() {
  const { isEn, t } = useManagerLocale();
  const navigate = useNavigate();

  // State cho bộ lọc thời gian biểu đồ (7 ngày vs 30 ngày)
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D">("7D");
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; value: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch real analytics data from Backend API (refetchInterval: 15s)
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: analyticsService.getOverview,
    refetchInterval: 15000,
  });

  // Calculate SVG curve path for Revenue Chart
  const chartDetails = useMemo(() => {
    if (!stats?.chart) return { pathD: "", linePathD: "", points: [], maxVal: 1, totalRev: 0 };

    const { data: rawData, labels } = stats.chart;
    // If 30D is clicked, simulate or project scaled points based on current trend
    const chartData = chartPeriod === "7D" ? rawData : rawData.map((v) => Number((v * 1.05).toFixed(1)));
    const maxVal = Math.max(...chartData, 10);
    const totalRev = chartData.reduce((acc, v) => acc + v, 0);

    const points = chartData.map((val, i) => {
      const x = (i / Math.max(chartData.length - 1, 1)) * 640;
      const y = 200 - (val / maxVal) * 160;
      return { x, y, val, label: labels[i] || `D${i + 1}` };
    });

    const linePointsStr = points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L");
    const linePathD = `M${linePointsStr}`;
    const pathD = `M0 220 L${linePointsStr} L640 220 Z`;

    return { pathD, linePathD, points, maxVal, totalRev };
  }, [stats?.chart, chartPeriod]);

  // Loading state
  if (isLoading) {
    return (
      <div className="ov-loading-screen">
        <Loader2 size={36} className="ov-spin" />
        <p>{t("Đang kết nối trung tâm vận hành và tải dữ liệu...", "Connecting to Operations Command Center...")}</p>
      </div>
    );
  }

  // Error state
  if (isError || !stats) {
    return (
      <div className="ov-error-screen">
        <AlertCircle size={36} color="#dc2626" />
        <h3>{t("Không thể tải dữ liệu vận hành", "Failed to Load Operations Data")}</h3>
        <p>{t("Vui lòng kiểm tra lại kết nối backend hoặc thử tải lại.", "Please verify backend server status or click retry.")}</p>
        <button className="ov-btn ov-btn-primary" onClick={() => refetch()}>
          <RefreshCw size={14} /> {t("Tải lại", "Retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════════
           OverviewView — Operations Command Center (Warm Stone)
           ═══════════════════════════════════════════════════════ */
        .ov-view {
          padding: 30px 34px 60px;
          background: #f7f5f2;
          color: #1a1714;
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Header ── */
        .ov-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }
        .ov-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #ea580c;
          text-transform: uppercase;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ov-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1714;
        }
        .ov-header p {
          margin: 6px 0 0;
          font-size: 14px;
          color: #78716c;
          line-height: 1.5;
        }
        .ov-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* ── Buttons ── */
        .ov-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          font-family: inherit;
          text-decoration: none;
        }
        .ov-btn-primary {
          background: #ea580c;
          color: #ffffff;
          border: none;
        }
        .ov-btn-primary:hover { background: #c2410c; }
        .ov-btn-secondary {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          color: #44403c;
        }
        .ov-btn-secondary:hover { border-color: #d6d3d1; background: #fafaf9; }

        /* ── Command Center KPI Grid ── */
        .ov-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .ov-kpi-card {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .ov-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: #ea580c;
        }
        .ov-kpi-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ov-kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ov-kpi-jump-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #a8a29e;
          transition: color 0.15s;
        }
        .ov-kpi-card:hover .ov-kpi-jump-badge {
          color: #ea580c;
        }
        .ov-kpi-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #78716c;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .ov-kpi-value {
          font-size: 27px;
          font-weight: 800;
          color: #1a1714;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .ov-kpi-detail {
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ov-trend-up { color: #16a34a; }
        .ov-trend-down { color: #dc2626; }
        .ov-trend-neutral { color: #78716c; }

        /* ── Main Layout: Chart & AI Insights ── */
        .ov-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          margin-bottom: 24px;
        }

        /* ── Chart Panel ── */
        .ov-chart-panel {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ov-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .ov-chart-header h2 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 700;
          color: #1a1714;
        }
        .ov-chart-header p {
          margin: 0;
          font-size: 12.5px;
          color: #78716c;
        }
        .ov-chart-toggle {
          display: flex;
          gap: 4px;
          background: #fafaf9;
          border: 1px solid #e7e2dc;
          padding: 3px;
          border-radius: 8px;
        }
        .ov-chart-toggle button {
          border: none;
          background: none;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 6px;
          color: #78716c;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ov-chart-toggle button.active {
          background: #ffffff;
          color: #ea580c;
          box-shadow: 0 2px 5px rgba(0,0,0,0.06);
        }

        /* SVG Chart */
        .ov-svg-wrap {
          position: relative;
          width: 100%;
          height: 220px;
          margin-top: 10px;
        }
        .ov-svg-chart {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .ov-chart-dot {
          cursor: pointer;
          transition: r 0.15s, fill 0.15s;
        }
        .ov-chart-dot:hover {
          r: 7;
          fill: #ea580c;
        }
        .ov-chart-tooltip {
          position: absolute;
          top: 10px;
          right: 20px;
          background: #1c1917;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .ov-chart-labels {
          display: flex;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #f5f5f4;
          margin-top: 8px;
          color: #78716c;
          font-size: 12px;
          font-weight: 500;
        }

        /* ── AI Smart Insights Card ── */
        .ov-insight-card {
          background: linear-gradient(145deg, #1c1917 0%, #292524 100%);
          border-radius: 12px;
          padding: 22px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        .ov-insight-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #fb923c;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .ov-insight-block {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 12px;
        }
        .ov-insight-block b {
          display: block;
          font-size: 12px;
          color: #f97316;
          margin-bottom: 4px;
          letter-spacing: 0.03em;
        }
        .ov-insight-block p {
          margin: 0;
          font-size: 12.5px;
          color: #e7e5e4;
          line-height: 1.45;
        }
        .ov-insight-btn {
          width: 100%;
          height: 38px;
          background: #ea580c;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.15s;
          margin-top: 8px;
          font-family: inherit;
        }
        .ov-insight-btn:hover { background: #c2410c; }

        /* ── Live Orders Section ── */
        .ov-live-section {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          padding: 22px 24px;
        }
        .ov-live-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .ov-live-header h2 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 700;
          color: #1a1714;
        }
        .ov-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 20px;
          color: #047857;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .ov-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          animation: ovPulse 1.5s infinite;
        }
        @keyframes ovPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Order Cards Grid */
        .ov-order-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr) 280px;
          gap: 16px;
        }
        .ov-order-card {
          background: #fafaf9;
          border: 1px solid #e7e2dc;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ov-order-card:hover {
          border-color: #ea580c;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ov-order-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ov-order-code {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1714;
        }
        .ov-order-time {
          font-size: 11.5px;
          font-weight: 600;
          color: #ea580c;
          background: #fff7ed;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .ov-order-table {
          font-size: 12px;
          font-weight: 700;
          color: #ea580c;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ov-order-items {
          font-size: 12.5px;
          color: #57534e;
          line-height: 1.5;
          margin: 0 0 14px;
          max-height: 80px;
          overflow-y: auto;
        }
        .ov-order-items span {
          display: block;
        }
        .ov-order-btn {
          width: 100%;
          height: 32px;
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #1c1917;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ov-order-btn:hover {
          border-color: #ea580c;
          color: #ea580c;
          background: #fff7ed;
        }

        /* Harmony Card */
        .ov-harmony-card {
          background: #fff7ed;
          border: 1px dashed #fed7aa;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
        }
        .ov-harmony-card svg {
          color: #ea580c;
        }
        .ov-harmony-card b {
          font-size: 13.5px;
          color: #9a3412;
        }
        .ov-harmony-card span {
          font-size: 12px;
          color: #7c2d12;
          line-height: 1.45;
        }

        /* ── Loading / Error Screens ── */
        .ov-loading-screen,
        .ov-error-screen {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #78716c;
          gap: 12px;
          text-align: center;
        }
        .ov-spin { animation: ovSpin 1s linear infinite; }
        @keyframes ovSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Toast ── */
        .ov-toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 100;
          background: #16a34a;
          color: #ffffff;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .ov-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .ov-main-grid { grid-template-columns: 1fr; }
          .ov-order-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .ov-header { flex-direction: column; }
          .ov-order-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ov-view">
        {/* ── Top Header ── */}
        <div className="ov-header">
          <div>
            <div className="ov-eyebrow">
              <Zap size={14} /> {t("VẬN HÀNH THÔNG MINH THỜI GIAN THỰC", "INTELLIGENT RESTAURANT OPERATIONS")}
            </div>
            <h1>{t("Tổng quan vận hành", "Operations Command Center")}</h1>
            <p>
              {t(
                "Theo dõi nhịp vận hành thời gian thực, quản lý đơn hàng bàn đang mở và tối ưu năng suất làm việc.",
                "Real-time operational pulse, active dining sessions, inventory health alerts, and kitchen queue monitoring."
              )}
            </p>
          </div>
          <div className="ov-header-actions">
            <button
              className="ov-btn ov-btn-secondary"
              onClick={() => {
                refetch();
                showToast(t("Đã làm mới dữ liệu vận hành!", "Operations data refreshed!"));
              }}
              title={t("Làm mới dữ liệu", "Refresh Data")}
            >
              <RefreshCw size={14} className={isFetching ? "ov-spin" : ""} /> {t("Làm mới", "Refresh")}
            </button>
            <button
              className="ov-btn ov-btn-secondary"
              onClick={() => navigate(ROUTES.MANAGER.FLOOR_MAP)}
            >
              <Layers size={14} /> {t("Sơ đồ bàn", "Floor Map")}
            </button>
            <button
              className="ov-btn ov-btn-primary"
              onClick={() => navigate(ROUTES.MANAGER.ANALYTICS)}
            >
              <Sparkles size={14} /> {t("Phân tích AI", "AI Insights & Forecast")}
            </button>
          </div>
        </div>

        {/* ── 4 Interactive Command Center KPI Cards ── */}
        <div className="ov-kpi-grid">
          {/* 1. Doanh thu hôm nay */}
          <div className="ov-kpi-card" onClick={() => navigate(ROUTES.MANAGER.ORDERS)}>
            <div>
              <div className="ov-kpi-top">
                <div className="ov-kpi-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
                  <WalletCards size={22} />
                </div>
                <span className="ov-kpi-jump-badge">
                  {t("Đơn hàng", "Billing")} <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="ov-kpi-label">{t("DOANH THU HÔM NAY", "TODAY'S REVENUE")}</div>
              <div className="ov-kpi-value">{formatMoney(stats.kpi.revenue.value)}</div>
            </div>
            <div className={`ov-kpi-detail ${stats.kpi.revenue.growth >= 0 ? "ov-trend-up" : "ov-trend-down"}`}>
              {stats.kpi.revenue.growth >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {stats.kpi.revenue.growth >= 0 ? `+${stats.kpi.revenue.growth.toFixed(1)}%` : `${stats.kpi.revenue.growth.toFixed(1)}%`}{" "}
              <span style={{ color: "#78716c", fontWeight: 400 }}>{t("so với hôm qua", "vs yesterday")}</span>
            </div>
          </div>

          {/* 2. Khách trong ngày */}
          <div className="ov-kpi-card" onClick={() => navigate(ROUTES.MANAGER.FLOOR_MAP)}>
            <div>
              <div className="ov-kpi-top">
                <div className="ov-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                  <Users size={22} />
                </div>
                <span className="ov-kpi-jump-badge">
                  {t("Sơ đồ bàn", "Floor")} <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="ov-kpi-label">{t("LƯỢNG KHÁCH TRONG NGÀY", "GUEST HEADCOUNT")}</div>
              <div className="ov-kpi-value">
                {stats.kpi.guests.value} <span style={{ fontSize: 16, color: "#a8a29e", fontWeight: 400 }}>{t("khách", "guests")}</span>
              </div>
            </div>
            <div className="ov-kpi-detail ov-trend-neutral">
              <Activity size={15} style={{ color: "#059669" }} />
              {stats.kpi.guests.capacity}% {t("công suất sàn bàn đang dùng", "capacity utilized")}
            </div>
          </div>

          {/* 3. Đơn đang chờ chế biến */}
          <div className="ov-kpi-card" onClick={() => navigate(ROUTES.MANAGER.ORDERS)}>
            <div>
              <div className="ov-kpi-top">
                <div className="ov-kpi-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
                  <Clock3 size={22} />
                </div>
                <span className="ov-kpi-jump-badge">
                  {t("Hàng đợi", "Queue")} <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="ov-kpi-label">{t("ĐƠN CHỜ BẾP", "PENDING ORDERS")}</div>
              <div className="ov-kpi-value">
                {stats.kpi.pendingOrders.value} <span style={{ fontSize: 16, color: "#a8a29e", fontWeight: 400 }}>{t("đơn", "orders")}</span>
              </div>
            </div>
            <div className="ov-kpi-detail ov-trend-neutral">
              <Clock size={15} style={{ color: "#b45309" }} />
              {t("Thời gian xử lý TB:", "Avg prep time:")} <b>{stats.kpi.pendingOrders.avgTime}</b>
            </div>
          </div>

          {/* 4. Sức khỏe kho nguyên liệu */}
          <div className="ov-kpi-card" onClick={() => navigate(ROUTES.MANAGER.INVENTORY)}>
            <div>
              <div className="ov-kpi-top">
                <div className="ov-kpi-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
                  <Package size={22} />
                </div>
                <span className="ov-kpi-jump-badge">
                  {t("Kho", "Stock")} <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="ov-kpi-label">{t("CẢNH BÁO TỒN KHO", "INVENTORY HEALTH")}</div>
              <div className="ov-kpi-value" style={{ color: stats.kpi.inventory.lowStock > 0 ? "#dc2626" : "#1a1714" }}>
                {stats.kpi.inventory.lowStock}{" "}
                <span style={{ fontSize: 16, color: "#a8a29e", fontWeight: 400 }}>{t("mặt hàng", "items")}</span>
              </div>
            </div>
            <div className="ov-kpi-detail" style={{ color: stats.kpi.inventory.lowStock > 0 ? "#dc2626" : "#16a34a" }}>
              <AlertCircle size={15} />
              {stats.kpi.inventory.lowStock > 0
                ? t("Cần bổ sung nhập hàng gấp", "Urgent restock needed")
                : t("Tất cả mức tồn ổn định", "All inventory safe")}
            </div>
          </div>
        </div>

        {/* ── Main Layout: Chart & AI Insights ── */}
        <div className="ov-main-grid">
          {/* Revenue Performance Chart */}
          <section className="ov-chart-panel">
            <div className="ov-chart-header">
              <div>
                <h2>{t("Hiệu suất doanh thu", "Revenue Performance")}</h2>
                <p>
                  {chartPeriod === "7D"
                    ? t("Tổng hợp doanh thu 7 ngày gần nhất", "Revenue over past 7 days")
                    : t("Dự báo & tổng hợp 30 ngày", "30-day revenue projection")}
                </p>
              </div>
              <div className="ov-chart-toggle">
                <button
                  className={chartPeriod === "7D" ? "active" : ""}
                  onClick={() => setChartPeriod("7D")}
                >
                  {t("7 ngày", "7 Days")}
                </button>
                <button
                  className={chartPeriod === "30D" ? "active" : ""}
                  onClick={() => setChartPeriod("30D")}
                >
                  {t("30 ngày", "30 Days")}
                </button>
              </div>
            </div>

            <div className="ov-svg-wrap">
              {hoveredPoint && (
                <div className="ov-chart-tooltip">
                  {hoveredPoint.label}: {formatMoney(hoveredPoint.value)}
                </div>
              )}
              <svg viewBox="0 0 640 220" preserveAspectRatio="none" className="ov-svg-chart">
                <defs>
                  <linearGradient id="ovGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={chartDetails.pathD} fill="url(#ovGradient)" />
                <path
                  d={chartDetails.linePathD}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartDetails.points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.index === idx ? 7 : 4.5}
                    fill={hoveredPoint?.index === idx ? "#ea580c" : "#ffffff"}
                    stroke="#ea580c"
                    strokeWidth="2.5"
                    className="ov-chart-dot"
                    onMouseEnter={() => setHoveredPoint({ index: idx, label: pt.label, value: pt.val })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>

            <div className="ov-chart-labels">
              {stats.chart.labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </section>

          {/* AI Smart Insights Card */}
          <section className="ov-insight-card">
            <div>
              <div className="ov-insight-header">
                <Sparkles size={16} /> {t("DỰ BÁO TRÍ TUỆ AI", "AI SMART INSIGHTS")}
              </div>
              <div className="ov-insight-block">
                <b>{t("TỐI ƯU NHÂN SỰ GIỜ CAO ĐIỂM", "LABOR OPTIMIZATION")}</b>
                <p>
                  {t(
                    "Dự báo lượng đơn hàng sẽ tăng vọt 20% vào khung giờ 19:00 - 20:30 tối nay. Đề xuất điều động thêm 2 nhân viên phục vụ từ 18:30.",
                    "Expected 20% spike in orders at 7:00 PM tonight. Suggested deploying 2 extra floor staff from 6:30 PM."
                  )}
                </p>
              </div>
              <div className="ov-insight-block">
                <b>{t("MÓN ĂN XU HƯỚNG CAO", "MENU TRENDING")}</b>
                <p>
                  {t(
                    "Món 'Mushroom Truffle Risotto' và 'Cá hồi Na Uy' đang có lượt gọi tăng 48% so với tuần trước. Đảm bảo Bếp chuẩn bị thêm +15 suất.",
                    "“Mushroom Truffle Risotto” is trending 48% higher than last Thursday. Ensure kitchen prep for +15 units."
                  )}
                </p>
              </div>
            </div>

            <button
              className="ov-insight-btn"
              onClick={() => {
                navigate(ROUTES.MANAGER.SCHEDULING);
                showToast(t("Chuyển sang điều chỉnh lịch phân ca!", "Navigating to Shift Scheduling!"));
              }}
            >
              <Calendar size={14} /> {t("Tự động cân bằng phân ca", "Automate Schedule Balancing")}
            </button>
          </section>
        </div>

        {/* ── Live Orders Section (Real Orders from DB) ── */}
        <section className="ov-live-section">
          <div className="ov-live-header">
            <div>
              <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {t("Đơn hàng đang xử lý thời gian thực", "Live Order Queue")}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#78716c" }}>
                {t(
                  "Theo dõi tiến độ ra món của các bàn ăn đang dùng bữa trực tiếp tại nhà hàng",
                  "Real-time dining session tickets currently active across tables"
                )}
              </p>
            </div>
            <span className="ov-live-pill">
              <span className="ov-live-dot" /> LIVE • {stats.liveOrders.length} {t("đơn", "active")}
            </span>
          </div>

          <div className="ov-order-grid">
            {stats.liveOrders.length === 0 ? (
              <div style={{ gridColumn: "1 / -2", padding: "30px", textAlign: "center", color: "#a8a29e" }}>
                <CheckCircle2 size={32} style={{ margin: "0 auto 8px", color: "#16a34a" }} />
                <p style={{ margin: 0 }}>{t("Hiện không có đơn hàng nào đang chờ xử lý.", "No active orders waiting in queue.")}</p>
              </div>
            ) : (
              stats.liveOrders.map((order) => (
                <div key={order.id} className="ov-order-card">
                  <div>
                    <div className="ov-order-top">
                      <span className="ov-order-code">Order #{order.code.slice(-4)}</span>
                      <span className="ov-order-time">{order.time}</span>
                    </div>
                    <div className="ov-order-table">
                      <UtensilsCrossed size={13} /> {order.table}
                    </div>
                    <div className="ov-order-items">
                      {order.items.map((item, idx) => (
                        <span key={idx}>• {item}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="ov-order-btn"
                    onClick={() => navigate(ROUTES.MANAGER.ORDERS)}
                  >
                    {order.status === "CREATED"
                      ? t("Chuyển Bếp nấu", "Send to Kitchen")
                      : t("Xem chi tiết đơn", "View Order")}
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))
            )}

            {/* Operational Harmony card */}
            <div className="ov-harmony-card">
              <Gauge size={28} />
              <b>{t("Nhịp điệu vận hành", "Operational Harmony")}</b>
              <span>
                {t(
                  "Hệ thống ROMS tự động đồng bộ nhịp độ phục vụ của sảnh với công suất của bếp theo thời gian thực.",
                  "ROMS synchronizes front-of-house pacing with kitchen capacity in real-time."
                )}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="ov-toast">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
    </>
  );
}