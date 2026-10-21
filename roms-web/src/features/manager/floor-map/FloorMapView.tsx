import {
  CalendarDays,
  Clock3,
  Utensils,
  Users,
  Plus,
  RotateCw,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "@/services/modules/tableService";
import type { Table, TableStatus } from "@/types/table.types";
import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

const STATUS_CONFIG: Record<TableStatus, { vi: string; en: string; color: string; bg: string; border: string }> = {
  AVAILABLE: {
    vi: "Bàn trống",
    en: "Available",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#86efac",
  },
  OCCUPIED: {
    vi: "Đang phục vụ",
    en: "Occupied",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
  RESERVED: {
    vi: "Đã đặt trước",
    en: "Reserved",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  CLEANING: {
    vi: "Đang dọn dẹp",
    en: "Cleaning",
    color: "#4b5563",
    bg: "#f3f4f6",
    border: "#d1d5db",
  },
};

export default function FloorMapView() {
  const { isEn, t } = useManagerLocale();
  const queryClient = useQueryClient();

  const getStatusLabel = (status: TableStatus) => {
    return isEn ? STATUS_CONFIG[status]?.en : STATUS_CONFIG[status]?.vi;
  };

  // Selected table on map
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Filter floor / status
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TableStatus | "ALL">("ALL");

  // Add Table Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableData, setNewTableData] = useState({
    tableNumber: "",
    floor: 1,
    capacity: 4,
  });
  const [modalError, setModalError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch tables from backend
  const { data: tables = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: tableService.getAll,
  });

  // Keep selectedTable updated with latest query data
  const currentSelectedTable = useMemo(() => {
    if (!selectedTable) return null;
    return tables.find((t) => t.id === selectedTable.id) || selectedTable;
  }, [tables, selectedTable]);

  // Mutation: Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateStatus(id, status),
    onSuccess: (updatedTable) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setSelectedTable((prev) => (prev ? { ...prev, status: updatedTable.status } : null));
      showToast(
        t(
          `Đã chuyển trạng thái sang "${getStatusLabel(updatedTable.status)}"`,
          `Updated table status to "${getStatusLabel(updatedTable.status)}"`
        ),
        "success"
      );
    },
    onError: () => {
      showToast(t("Không thể cập nhật trạng thái bàn.", "Failed to update table status."), "error");
    },
  });

  // Mutation: Create table
  const createTableMutation = useMutation({
    mutationFn: (payload: { tableNumber: string; floor: number; capacity: number }) =>
      tableService.create(payload),
    onSuccess: (newTable) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsAddModalOpen(false);
      setNewTableData({ tableNumber: "", floor: 1, capacity: 4 });
      setModalError(null);
      setSelectedTable(newTable);
      showToast(
        t(
          `Đã tạo bàn "${newTable.name || newTable.tableNumber}" thành công!`,
          `Table "${newTable.name || newTable.tableNumber}" created successfully!`
        ),
        "success"
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể tạo bàn mới.", "Could not create new table.");
      setModalError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  // Mutation: Delete table
  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => tableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setSelectedTable(null);
      showToast(t("Đã xóa bàn thành công!", "Table deleted successfully!"), "success");
    },
    onError: () => {
      showToast(t("Không thể xóa bàn này.", "Failed to delete table."), "error");
    },
  });

  // Dynamic KPI stats
  const totalCapacity = useMemo(() => {
    return tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
  }, [tables]);

  const occupiedCount = useMemo(() => {
    return tables.filter((t) => t.status === "OCCUPIED").length;
  }, [tables]);

  const availableCount = useMemo(() => {
    return tables.filter((t) => t.status === "AVAILABLE").length;
  }, [tables]);

  const reservedCount = useMemo(() => {
    return tables.filter((t) => t.status === "RESERVED").length;
  }, [tables]);

  const cleaningCount = useMemo(() => {
    return tables.filter((t) => t.status === "CLEANING").length;
  }, [tables]);

  const utilizationRate = useMemo(() => {
    if (tables.length === 0) return 0;
    return Math.round((occupiedCount / tables.length) * 100);
  }, [tables, occupiedCount]);

  // Floors list
  const floors = useMemo(() => {
    const list = [...new Set(tables.map((t) => t.floor || 1))];
    return list.sort((a, b) => a - b);
  }, [tables]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchFloor = selectedFloor === "ALL" || (t.floor || 1) === selectedFloor;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchFloor && matchStatus;
    });
  }, [tables, selectedFloor, statusFilter]);

  // Submit create table
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableData.tableNumber.trim()) {
      setModalError(t("Vui lòng nhập tên/số hiệu bàn.", "Please enter a table name/number."));
      return;
    }
    createTableMutation.mutate({
      tableNumber: newTableData.tableNumber.trim(),
      floor: Number(newTableData.floor),
      capacity: Number(newTableData.capacity),
    });
  };

  return (
    <>
      <style>{`
        .floor-map-container {
          padding: 30px 34px 60px;
          background: #f7f5f2;
          min-height: 100%;
          color: #1f2937;
        }

        .floor-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .floor-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 18px;
          align-items: start;
        }

        .floor-canvas.panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .floor-tabs-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 14px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .floor-tabs {
          display: flex;
          gap: 6px;
        }

        .floor-tab-btn {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          padding: 6px 14px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .floor-tab-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .floor-tab-btn.selected {
          background: #1e293b;
          border-color: #1e293b;
          color: #ffffff;
          font-weight: 600;
        }

        .floor-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 6px 0 16px;
          font-size: 12px;
          color: #64748b;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        /* TABLE GRID */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 14px;
          min-height: 380px;
          padding: 18px;
          background: #fafaf9;
          border: 1.5px dashed #e2e8f0;
          border-radius: 12px;
        }

        .table-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 10px;
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          user-select: none;
        }

        .table-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
        }

        .table-card.active-selected {
          border-color: #b42318 !important;
          box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.18), 0 8px 16px -4px rgba(180, 35, 24, 0.15) !important;
        }

        .table-card-number {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          text-align: center;
        }

        .table-card-capacity {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .table-status-pill {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          text-align: center;
          white-space: nowrap;
        }

        .table-floor-tag {
          position: absolute;
          top: 6px;
          left: 8px;
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }

        /* SIDE PANEL */
        .floor-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .side-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .side-card h3 {
          margin: 0 0 14px;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .detail-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 36px 16px;
          color: #94a3b8;
          text-align: center;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-header-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #edf2f7;
        }

        .detail-header-title {
          font-size: 17px;
          font-weight: 750;
          color: #0f172a;
        }

        .detail-meta-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12.5px;
        }

        .detail-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #64748b;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-meta-row strong {
          color: #1e293b;
        }

        /* STATUS CONTROLS */
        .status-buttons-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          margin-bottom: 8px;
        }

        .status-button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .btn-status-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          border-radius: 7px;
          font-size: 11.5px;
          font-weight: 600;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-status-switch.available {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }
        .btn-status-switch.available:hover {
          background: #dcfce7;
        }

        .btn-status-switch.occupied {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }
        .btn-status-switch.occupied:hover {
          background: #fee2e2;
        }

        .btn-status-switch.reserved {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .btn-status-switch.reserved:hover {
          background: #fef3c7;
        }

        .btn-status-switch.cleaning {
          background: #f3f4f6;
          border-color: #e5e7eb;
          color: #374151;
        }
        .btn-status-switch.cleaning:hover {
          background: #e5e7eb;
        }

        .btn-status-switch.current-status {
          border-color: currentColor;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }

        .btn-delete-table {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          background: #fff;
          border: 1px solid #fee2e2;
          color: #dc2626;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 4px;
          transition: all 0.15s ease;
        }

        .btn-delete-table:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 12px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: modalIn 0.15s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .modal-close {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }

        .modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .form-group input,
        .form-group select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          font-size: 13px;
          color: #1f2937;
          outline: none;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #b42318;
          box-shadow: 0 0 0 2px rgba(180, 35, 24, 0.1);
        }

        .modal-footer {
          padding: 14px 20px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-secondary {
          height: 36px;
          padding: 0 14px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary {
          height: 36px;
          padding: 0 16px;
          border: none;
          border-radius: 7px;
          background: #b42318;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary:hover {
          background: #981b10;
        }

        /* Toast */
        .toast-popup {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          z-index: 200;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
        }
        .toast-popup.success {
          background: #15803d;
          color: #ffffff;
        }
        .toast-popup.error {
          background: #dc2626;
          color: #ffffff;
        }
      `}</style>

      <div className="floor-map-container">
        {/* ================= PAGE HEADING ================= */}
        <PageHeading
          title={t("Sơ đồ bàn & Khu vực phục vụ", "Floor Map & Dining Areas")}
          description={t(
            "Theo dõi trạng thái thời gian thực từ Database, cập nhật bàn trống/đang dùng và điều phối sảnh ăn.",
            "Real-time table status from database, dining room capacity, and active floor routing."
          )}
          actions={
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="button secondary"
                onClick={() => refetch()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RotateCw size={14} /> {t("Tải lại", "Reload")}
              </button>
              <button
                className="button primary"
                onClick={() => setIsAddModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={16} /> {t("Thêm bàn mới", "Add Table")}
              </button>
            </div>
          }
        />

        {/* ================= KPIS ================= */}
        <div className="floor-kpis">
          <KPI
            icon={Users}
            label={t("TỔNG SỨC CHỨA", "TOTAL CAPACITY")}
            value={`${totalCapacity} ${t("chỗ", "seats")}`}
            detail={`${tables.length} ${t("bàn ăn đã thiết lập", "tables configured")}`}
          />
          <KPI
            icon={Utensils}
            label={t("ĐANG PHỤC VỤ", "OCCUPIED")}
            value={`${occupiedCount} / ${tables.length}`}
            detail={`${utilizationRate}% ${t("công suất sảnh", "hall occupancy")}`}
            variant="danger"
          />
          <KPI
            icon={Clock3}
            label={t("BÀN TRỐNG SẴN SÀNG", "AVAILABLE TABLES")}
            value={`${availableCount} ${t("bàn", "tables")}`}
            detail={t("Sẵn sàng đón khách mới", "Ready for seating guests")}
          />
          <div className="revenue-tile" style={{ background: "#1e293b" }}>
            <small>{t("ĐẶT TRƯỚC & DỌN DẸP", "RESERVED & CLEANING")}</small>
            <b>{reservedCount + cleaningCount}</b>
            <span>
              {reservedCount} {t("bàn hẹn trước", "reserved")} • {cleaningCount} {t("đang dọn", "cleaning")}
            </span>
          </div>
        </div>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="floor-layout">
          {/* LEFT: CANVAS */}
          <section className="floor-canvas panel">
            {/* TABS BAR */}
            <div className="floor-tabs-bar">
              <div className="floor-tabs">
                <button
                  className={`floor-tab-btn ${selectedFloor === "ALL" ? "selected" : ""}`}
                  onClick={() => setSelectedFloor("ALL")}
                >
                  {t("Tất cả các tầng", "All Floors")}
                </button>
                {floors.map((floorNum) => (
                  <button
                    key={floorNum}
                    className={`floor-tab-btn ${selectedFloor === floorNum ? "selected" : ""}`}
                    onClick={() => setSelectedFloor(floorNum)}
                  >
                    {t("Tầng", "Floor")} {floorNum}
                  </button>
                ))}
              </div>

              {/* Status filter dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                <span>{t("Lọc:", "Filter:")}</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12,
                    background: "#fff",
                    color: "#334155",
                    outline: "none",
                  }}
                >
                  <option value="ALL">{t("Tất cả trạng thái", "All Statuses")}</option>
                  <option value="AVAILABLE">{t("Chỉ bàn trống", "Available Only")}</option>
                  <option value="OCCUPIED">{t("Chỉ bàn đang dùng", "Occupied Only")}</option>
                  <option value="RESERVED">{t("Chỉ bàn đã đặt", "Reserved Only")}</option>
                  <option value="CLEANING">{t("Chỉ bàn đang dọn", "Cleaning Only")}</option>
                </select>
              </div>
            </div>

            {/* LEGEND */}
            <div className="floor-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#22c55e" }} /> {isEn ? "Available" : "Bàn trống (Available)"}
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#ef4444" }} /> {isEn ? "Occupied" : "Đang phục vụ (Occupied)"}
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#f59e0b" }} /> {isEn ? "Reserved" : "Đã đặt trước (Reserved)"}
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#9ca3af" }} /> {isEn ? "Cleaning" : "Đang dọn dẹp (Cleaning)"}
              </span>
            </div>

            {/* TABLES GRID */}
            <div className="tables-grid">
              {isLoading ? (
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 10, color: "#64748b" }}>
                  <Loader2 size={20} className="animate-spin" />
                  {t("Đang tải danh sách bàn ăn từ Backend...", "Loading tables from backend...")}
                </div>
              ) : isError ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#dc2626" }}>
                  {t("Không thể kết nối đến máy chủ tables.", "Could not connect to table service.")}
                </div>
              ) : filteredTables.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "#94a3b8" }}>
                  {t("Không tìm thấy bàn nào phù hợp với bộ lọc tầng / trạng thái.", "No tables match current floor / status filters.")}
                </div>
              ) : (
                filteredTables.map((table) => {
                  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.AVAILABLE;
                  const label = getStatusLabel(table.status);
                  const isSelected = currentSelectedTable?.id === table.id;

                  return (
                    <div
                      key={table.id}
                      className={`table-card ${isSelected ? "active-selected" : ""}`}
                      onClick={() => setSelectedTable(table)}
                      style={{
                        background: statusConfig.bg,
                        borderColor: isSelected ? "#b42318" : statusConfig.border,
                      }}
                    >
                      <span className="table-floor-tag">{isEn ? "FL" : "T"}.{table.floor || 1}</span>

                      <div className="table-card-number">
                        {table.name || table.tableNumber}
                      </div>

                      <div className="table-card-capacity">
                        <Users size={12} /> {table.capacity} {t("chỗ", "seats")}
                      </div>

                      <span
                        className="table-status-pill"
                        style={{
                          background: "#ffffff",
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.border}`,
                        }}
                      >
                        ● {label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT: SIDEBAR DETAILS */}
          <aside className="floor-side">
            <section className="side-card">
              <h3>
                <span>{t("Chi tiết bàn", "Table Details")}</span>
                {currentSelectedTable && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>
                    ID: {currentSelectedTable.id.substring(0, 8)}
                  </span>
                )}
              </h3>

              {!currentSelectedTable ? (
                <div className="detail-empty">
                  <Utensils size={32} color="#cbd5e1" />
                  <span>
                    {t(
                      "Chọn một bàn trên sơ đồ để quản lý trạng thái, phiên phục vụ và chi tiết đặt bàn.",
                      "Select a table on the floor map to manage status, dining sessions, and reservations."
                    )}
                  </span>
                </div>
              ) : (
                <div className="detail-content">
                  {/* HEADER CARD */}
                  <div className="detail-header-badge">
                    <div>
                      <div className="detail-header-title">
                        {currentSelectedTable.name || currentSelectedTable.tableNumber}
                      </div>
                      <small style={{ color: "#64748b" }}>
                        {t("Khu vực Tầng", "Floor Area")} {currentSelectedTable.floor || 1}
                      </small>
                    </div>

                    <span
                      className="table-status-pill"
                      style={{
                        background: STATUS_CONFIG[currentSelectedTable.status]?.bg,
                        color: STATUS_CONFIG[currentSelectedTable.status]?.color,
                        border: `1px solid ${STATUS_CONFIG[currentSelectedTable.status]?.border}`,
                        fontSize: 11,
                        padding: "4px 10px",
                      }}
                    >
                      ● {getStatusLabel(currentSelectedTable.status)}
                    </span>
                  </div>

                  {/* META LIST */}
                  <div className="detail-meta-list">
                    <div className="detail-meta-row">
                      <span>{t("Sức chứa:", "Capacity:")}</span>
                      <strong>{currentSelectedTable.capacity} {t("khách", "guests")}</strong>
                    </div>

                    <div className="detail-meta-row">
                      <span>{t("Tầng:", "Floor:")}</span>
                      <strong>{t("Tầng", "Floor")} {currentSelectedTable.floor || 1}</strong>
                    </div>

                    {currentSelectedTable.qrCodeToken && (
                      <div className="detail-meta-row">
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <QrCode size={13} /> QR Token:
                        </span>
                        <strong style={{ fontSize: 11, color: "#64748b" }}>
                          {currentSelectedTable.qrCodeToken}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* QUICK STATUS SWITCH BUTTONS */}
                  <div>
                    <div className="status-buttons-title">{t("Đổi trạng thái nhanh", "Quick Status Change")}</div>
                    <div className="status-button-grid">
                      <button
                        className={`btn-status-switch available ${currentSelectedTable.status === "AVAILABLE" ? "current-status" : ""
                          }`}
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: currentSelectedTable.id,
                            status: "AVAILABLE",
                          })
                        }
                      >
                        ● {isEn ? "Available" : "Bàn trống"}
                      </button>

                      <button
                        className={`btn-status-switch occupied ${currentSelectedTable.status === "OCCUPIED" ? "current-status" : ""
                          }`}
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: currentSelectedTable.id,
                            status: "OCCUPIED",
                          })
                        }
                      >
                        ● {isEn ? "Occupied" : "Đang phục vụ"}
                      </button>

                      <button
                        className={`btn-status-switch reserved ${currentSelectedTable.status === "RESERVED" ? "current-status" : ""
                          }`}
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: currentSelectedTable.id,
                            status: "RESERVED",
                          })
                        }
                      >
                        ● {isEn ? "Reserved" : "Đặt trước"}
                      </button>

                      <button
                        className={`btn-status-switch cleaning ${currentSelectedTable.status === "CLEANING" ? "current-status" : ""
                          }`}
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: currentSelectedTable.id,
                            status: "CLEANING",
                          })
                        }
                      >
                        ● {isEn ? "Cleaning" : "Đang dọn dẹp"}
                      </button>
                    </div>
                  </div>

                  {/* DELETE TABLE BUTTON */}
                  <button
                    className="btn-delete-table"
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            `Bạn có chắc chắn muốn xóa bàn "${currentSelectedTable.name || currentSelectedTable.tableNumber
                            }" khỏi sơ đồ không?`,
                            `Are you sure you want to delete table "${currentSelectedTable.name || currentSelectedTable.tableNumber
                            }" from the floor plan?`
                          )
                        )
                      ) {
                        deleteTableMutation.mutate(currentSelectedTable.id);
                      }
                    }}
                  >
                    <Trash2 size={14} /> {t("Xóa bàn này khỏi sơ đồ", "Delete Table from Floor")}
                  </button>
                </div>
              )}
            </section>

            {/* LIVE UPDATES PANEL */}
            <section className="side-card">
              <h3>
                <span>{t("HOẠT ĐỘNG THỜI GIAN THỰC", "REAL-TIME OPERATIONS")}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Sparkles size={15} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <b>{t("Đồng bộ dữ liệu:", "Data Sync:")}</b>{" "}
                    {t(
                      "Toàn bộ trạng thái bàn được kết nối trực tiếp với Database ROMS.",
                      "All table statuses are directly synchronized with ROMS database."
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <CalendarDays size={15} color="#2563eb" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <b>{t("Mã QR khách hàng:", "Guest QR Token:")}</b>{" "}
                    {t(
                      "Mỗi bàn tích hợp một mã định danh riêng phục vụ tính năng quét mã gọi món.",
                      "Each table features a unique token powering digital QR contactless ordering."
                    )}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* ================= MODAL: THÊM BÀN MỚI ================= */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("Thêm bàn ăn mới", "Add New Dining Table")}</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div style={{ padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#b91c1c", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={15} />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("Tên / Số hiệu bàn *", "Table Name / Number *")}</label>
                  <input
                    type="text"
                    placeholder={t("VD: Bàn 01, TABLE 15, VIP-02...", "e.g. Table 01, T-15, VIP-02...")}
                    value={newTableData.tableNumber}
                    onChange={(e) => setNewTableData({ ...newTableData, tableNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Khu vực / Tầng *", "Floor / Area *")}</label>
                  <select
                    value={newTableData.floor}
                    onChange={(e) => setNewTableData({ ...newTableData, floor: Number(e.target.value) })}
                  >
                    <option value={1}>{t("Tầng 1 (Sảnh chính)", "Floor 1 (Main Dining Hall)")}</option>
                    <option value={2}>{t("Tầng 2 (Lầu)", "Floor 2 (Second Floor)")}</option>
                    <option value={3}>{t("Tầng 3 (Sân thượng / VIP)", "Floor 3 (Rooftop / VIP)")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("Sức chứa (Số chỗ ngồi) *", "Seating Capacity *")}</label>
                  <select
                    value={newTableData.capacity}
                    onChange={(e) => setNewTableData({ ...newTableData, capacity: Number(e.target.value) })}
                  >
                    <option value={2}>{t("Bàn 2 người (2 chỗ)", "2 Persons (2 seats)")}</option>
                    <option value={4}>{t("Bàn 4 người (4 chỗ)", "4 Persons (4 seats)")}</option>
                    <option value={6}>{t("Bàn 6 người (6 chỗ)", "6 Persons (6 seats)")}</option>
                    <option value={8}>{t("Bàn 8 người (8 chỗ)", "8 Persons (8 seats)")}</option>
                    <option value={10}>{t("Bàn 10 người (10 chỗ)", "10 Persons (10 seats)")}</option>
                    <option value={12}>{t("Bàn lớn (12 chỗ)", "Large Table (12 seats)")}</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {t("Hủy", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createTableMutation.isPending}
                >
                  {createTableMutation.isPending
                    ? t("Đang tạo...", "Creating...")
                    : t("Lưu bàn", "Save Table")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`toast-popup ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}