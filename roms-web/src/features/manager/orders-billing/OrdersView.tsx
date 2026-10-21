import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  CreditCard,
  DollarSign,
  Edit2,
  FileText,
  Filter,
  Layers,
  Loader2,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  ScanLine,
  Search,
  ShieldAlert,
  Sparkles,
  Split,
  Table as TableIcon,
  User,
  UserCheck,
  Users,
  Utensils,
  UtensilsCrossed,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/modules/orderService";
import { reservationService } from "@/services/modules/reservationService";
import { tableService } from "@/services/modules/tableService";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";
import { ROUTES } from "@/constants/routes";

// Format tiền tệ USD
const formatMoney = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

export default function OrdersView() {
  const { isEn, t } = useManagerLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tab chính: "ACTIVE_DINING" (Bàn đang phục vụ & Hóa đơn) | "RESERVATIONS" (Đặt bàn trước qua Web)
  const [activeTab, setActiveTab] = useState<"ACTIVE_DINING" | "RESERVATIONS">("ACTIVE_DINING");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [resStatusFilter, setResStatusFilter] = useState<string>("ALL");
  const [tableFloorFilter, setTableFloorFilter] = useState<number | "ALL">("ALL");

  // Modals state
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any | null>(null);
  const [selectedResForAssign, setSelectedResForAssign] = useState<any | null>(null);
  const [assignedTableId, setAssignedTableId] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Scan QR Check-in modal
  const [isScanCheckInOpen, setIsScanCheckInOpen] = useState(false);
  const [scanInputCode, setScanInputCode] = useState("");
  const [scannedReservation, setScannedReservation] = useState<any | null>(null);
  const [scanQuickTableId, setScanQuickTableId] = useState("");
  const [isSearchingScan, setIsSearchingScan] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tra cứu đơn đặt bàn bằng mã QR / ID
  const handleSearchReservationByScan = async (codeToSearch?: string) => {
    const raw = (codeToSearch ?? scanInputCode).trim();
    if (!raw) return;

    const cleanCode = raw.replace(/^#/, "");
    setIsSearchingScan(true);

    try {
      // 1. Tìm trong danh sách reservations đã fetch
      let found: any = reservations.find(
        (r: any) =>
          r.id.toLowerCase() === cleanCode.toLowerCase() ||
          r.id.slice(0, 8).toLowerCase() === cleanCode.toLowerCase() ||
          r.guestPhone === cleanCode
      );

      // 2. Nếu chưa có trong cache, gọi API
      if (!found) {
        try {
          found = await reservationService.getById(cleanCode);
        } catch {
          try {
            found = await reservationService.getByConfirmationCode(cleanCode);
          } catch {
            found = undefined;
          }
        }
      }

      if (found) {
        setScannedReservation(found);
        setScanQuickTableId(found.tableId || "");
        showToast(t("Đã tìm thấy đơn đặt bàn!", "Reservation found!"), "success");
      } else {
        setScannedReservation(null);
        showToast(
          t("Không tìm thấy đơn đặt bàn khớp với mã này.", "No reservation found with this code."),
          "error"
        );
      }
    } catch {
      showToast(t("Lỗi khi tìm kiếm đơn đặt bàn.", "Error searching reservation."), "error");
    } finally {
      setIsSearchingScan(false);
    }
  };

  // Xác nhận check-in từ modal Scan QR
  const handleConfirmScanCheckIn = async () => {
    if (!scannedReservation) return;

    try {
      const tableToAssign = scanQuickTableId || scannedReservation.tableId;
      if (!tableToAssign) {
        showToast(t("Vui lòng chọn bàn ăn trước khi Check-in!", "Please select a table before Check-in!"), "error");
        return;
      }

      // Nếu bàn được chọn khác với bàn đã gán ban đầu (hoặc trước đó chưa có bàn)
      if (tableToAssign !== scannedReservation.tableId) {
        await assignTableMutation.mutateAsync({
          id: scannedReservation.id,
          tableId: tableToAssign,
        });
      }

      // Thực hiện Check-in mở phiên ăn
      await checkInMutation.mutateAsync(scannedReservation.id);
      setIsScanCheckInOpen(false);
      setScannedReservation(null);
      setScanInputCode("");
    } catch (err: any) {
      showToast(err.response?.data?.message || t("Lỗi khi check-in", "Check-in failed"), "error");
    }
  };

  /* ──────────────────────────────────────────────────────────
     1. FETCH DỮ LIỆU TỪ BACKEND
     ────────────────────────────────────────────────────────── */

  // A. Đơn hàng đang phục vụ (Pending payment / In-progress)
  const {
    data: pendingOrders = [],
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", "pending-payment"],
    queryFn: orderService.getPendingPayment,
    refetchInterval: 12000,
  });

  // B. Danh sách đặt bàn trước từ Web
  const {
    data: reservations = [],
    isLoading: isLoadingReservations,
    refetch: refetchReservations,
  } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationService.getAll(),
    refetchInterval: 15000,
  });

  // C. Danh sách tất cả bàn ăn (phục vụ việc gán bàn)
  const { data: allTables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: tableService.getAll,
  });

  // Danh sách bàn được sắp xếp thông minh theo sở thích và số khách của đơn đặt
  const recommendedTables = useMemo(() => {
    if (!selectedResForAssign) return allTables;

    const partySize = selectedResForAssign.partySize || 2;
    const req = selectedResForAssign.specialRequest || "";

    let preferredFloor: number | null = null;
    if (req.includes("Tầng 2") || req.includes("Floor 2")) preferredFloor = 2;
    else if (req.includes("Tầng 3") || req.includes("Floor 3")) preferredFloor = 3;
    else if (req.includes("Tầng 1") || req.includes("Floor 1")) preferredFloor = 1;

    return [...allTables].sort((a: any, b: any) => {
      // 1. Ưu tiên bàn trống
      if (a.status === "AVAILABLE" && b.status !== "AVAILABLE") return -1;
      if (a.status !== "AVAILABLE" && b.status === "AVAILABLE") return 1;

      // 2. Ưu tiên đúng tầng khách chọn
      if (preferredFloor) {
        if (a.floor === preferredFloor && b.floor !== preferredFloor) return -1;
        if (a.floor !== preferredFloor && b.floor === preferredFloor) return 1;
      }

      // 3. Ưu tiên bàn vừa vặn sức chứa
      const aFit = a.capacity >= partySize;
      const bFit = b.capacity >= partySize;
      if (aFit && !bFit) return -1;
      if (!aFit && bFit) return 1;

      return a.capacity - b.capacity;
    });
  }, [allTables, selectedResForAssign]);

  /* ──────────────────────────────────────────────────────────
     2. MUTATIONS CHO ĐẶT BÀN TRƯỚC (RESERVATIONS)
     ────────────────────────────────────────────────────────── */

  // Xác nhận đặt bàn (Confirm)
  const confirmMutation = useMutation({
    mutationFn: (id: string) => reservationService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      showToast(t("Đã duyệt xác nhận đơn đặt bàn thành công!", "Reservation confirmed successfully!"), "success");
    },
    onError: () => {
      showToast(t("Không thể xác nhận đặt bàn. Vui lòng thử lại.", "Failed to confirm reservation."), "error");
    },
  });

  // Hủy đặt bàn (Cancel)
  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationService.cancel(id, "Cancelled by manager"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      showToast(t("Đã hủy đơn đặt bàn", "Reservation cancelled"), "success");
    },
    onError: () => {
      showToast(t("Lỗi hủy đặt bàn.", "Failed to cancel reservation."), "error");
    },
  });

  // Gán bàn (Assign Table)
  const assignTableMutation = useMutation({
    mutationFn: ({ id, tableId }: { id: string; tableId: string }) =>
      reservationService.assignTable(id, tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setSelectedResForAssign(null);
      showToast(t("Đã gán bàn thành công!", "Table assigned successfully!"), "success");
    },
    onError: () => {
      showToast(t("Lỗi gán bàn. Vui lòng thử lại.", "Failed to assign table."), "error");
    },
  });

  // Check-in nhận khách vào bàn
  const checkInMutation = useMutation({
    mutationFn: (id: string) => reservationService.checkIn({ id } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      showToast(t("Đã nhận khách vào bàn (Check-in thành công)!", "Guest checked in to table!"), "success");
    },
    onError: () => {
      showToast(t("Lỗi check-in. Vui lòng kiểm tra lại bàn.", "Check-in failed."), "error");
    },
  });

  /* ──────────────────────────────────────────────────────────
     3. THỐNG KÊ TỔNG HỢP (KPIS)
     ────────────────────────────────────────────────────────── */
  const metrics = useMemo(() => {
    const totalPendingAmount = pendingOrders.reduce(
      (sum: number, o: any) => sum + Number(o.totalAmount || 0),
      0
    );
    const activeTablesCount = pendingOrders.length;
    const pendingReservationsCount = reservations.filter(
      (r: any) => r.status === "PENDING"
    ).length;
    const totalReservationsCount = reservations.length;

    return {
      totalPendingAmount,
      activeTablesCount,
      pendingReservationsCount,
      totalReservationsCount,
    };
  }, [pendingOrders, reservations]);

  /* ──────────────────────────────────────────────────────────
     4. BỘ LỌC DỮ LIỆU
     ────────────────────────────────────────────────────────── */

  // Lọc Bàn đang phục vụ
  const filteredActiveOrders = useMemo(() => {
    return pendingOrders.filter((order: any) => {
      const q = searchTerm.trim().toLowerCase();
      const tableName = order.session?.table?.tableNumber || "";
      const orderCode = order.orderCode || "";
      const matchSearch =
        !q ||
        tableName.toLowerCase().includes(q) ||
        orderCode.toLowerCase().includes(q);

      const matchFloor =
        tableFloorFilter === "ALL" ||
        order.session?.table?.floor === tableFloorFilter;

      return matchSearch && matchFloor;
    });
  }, [pendingOrders, searchTerm, tableFloorFilter]);

  // Lọc Đặt bàn trước
  const filteredReservations = useMemo(() => {
    return reservations.filter((res: any) => {
      const q = searchTerm.trim().toLowerCase();
      const guestName = res.guestName || "";
      const phone = res.guestPhone || "";
      const code = res.id || "";
      const matchSearch =
        !q ||
        guestName.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q);

      const matchStatus =
        resStatusFilter === "ALL" || res.status === resStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [reservations, searchTerm, resStatusFilter]);

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════════
           Orders & Billing & Reservations (Warm Stone Theme)
           ═══════════════════════════════════════════════════════ */
        .ob-view {
          padding: 30px 34px 60px;
          background: #f7f5f2;
          color: #1a1714;
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Header ── */
        .ob-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }
        .ob-eyebrow {
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
        .ob-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1714;
        }
        .ob-header p {
          margin: 6px 0 0;
          font-size: 14px;
          color: #78716c;
          line-height: 1.5;
        }
        .ob-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* ── Buttons ── */
        .ob-btn {
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
        }
        .ob-btn-primary {
          background: #ea580c;
          color: #ffffff;
          border: none;
        }
        .ob-btn-primary:hover { background: #c2410c; }
        .ob-btn-secondary {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          color: #44403c;
        }
        .ob-btn-secondary:hover { border-color: #d6d3d1; background: #fafaf9; }
        .ob-btn-success {
          background: #16a34a;
          color: #ffffff;
          border: none;
        }
        .ob-btn-success:hover { background: #15803d; }
        .ob-btn-danger {
          background: #dc2626;
          color: #ffffff;
          border: none;
        }
        .ob-btn-danger:hover { background: #b91c1c; }

        /* ── Top KPIs ── */
        .ob-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .ob-kpi-card {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .ob-kpi-card:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }
        .ob-kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ob-kpi-meta span {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #78716c;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .ob-kpi-meta strong {
          display: block;
          font-size: 24px;
          font-weight: 800;
          color: #1a1714;
          line-height: 1.2;
          margin-top: 2px;
        }
        .ob-kpi-meta small {
          font-size: 12px;
          color: #a8a29e;
          font-weight: 500;
        }

        /* ── Navigation Tabs ── */
        .ob-tabs-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #e7e2dc;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ob-tabs {
          display: flex;
          gap: 8px;
        }
        .ob-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: #78716c;
          cursor: pointer;
          position: relative;
          transition: color 0.15s;
          font-family: inherit;
        }
        .ob-tab-btn:hover { color: #1a1714; }
        .ob-tab-btn.active {
          color: #ea580c;
        }
        .ob-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2.5px;
          background: #ea580c;
          border-radius: 2px;
        }
        .ob-tab-badge {
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          background: #e7e2dc;
          color: #44403c;
        }
        .ob-tab-btn.active .ob-tab-badge {
          background: #ffedd5;
          color: #c2410c;
        }

        /* ── Toolbar: Search & Filter ── */
        .ob-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .ob-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 8px;
          width: 300px;
          transition: border-color 0.15s;
        }
        .ob-search-box:focus-within { border-color: #ea580c; }
        .ob-search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 13px;
          color: #1a1714;
          background: transparent;
          font-family: inherit;
        }
        .ob-filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .ob-pill-btn {
          height: 32px;
          padding: 0 12px;
          border-radius: 7px;
          border: 1px solid #e7e2dc;
          background: #ffffff;
          color: #78716c;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ob-pill-btn:hover { background: #fafaf9; color: #1a1714; }
        .ob-pill-btn.active {
          background: #ea580c;
          border-color: #ea580c;
          color: #ffffff;
        }

        /* ── Active Dining Cards Grid ── */
        .ob-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .ob-card {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ob-card:hover {
          border-color: #ea580c;
          box-shadow: 0 6px 18px rgba(0,0,0,0.05);
        }
        .ob-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ob-card-table {
          font-size: 16px;
          font-weight: 800;
          color: #1a1714;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ob-card-amount {
          font-size: 18px;
          font-weight: 800;
          color: #ea580c;
        }
        .ob-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #78716c;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f5f5f4;
        }
        .ob-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ob-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .ob-status-pill.progress {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #ffedd5;
        }
        .ob-status-pill.ready {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .ob-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        /* ── Reservation Table Panel ── */
        .ob-table-panel {
          background: #ffffff;
          border: 1px solid #e7e2dc;
          border-radius: 12px;
          overflow: hidden;
        }
        .ob-table-wrap {
          width: 100%;
          overflow-x: auto;
          min-height: 280px;
        }
        .ob-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          font-size: 13px;
        }
        .ob-table thead { background: #fafaf9; }
        .ob-table th {
          height: 44px;
          padding: 0 18px;
          border-bottom: 1px solid #e7e2dc;
          color: #78716c;
          font-size: 11px;
          font-weight: 700;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .ob-table td {
          height: 64px;
          padding: 10px 18px;
          border-bottom: 1px solid #f5f5f4;
          color: #44403c;
          vertical-align: middle;
        }
        .ob-table tbody tr:hover { background: #fefdfb; }

        /* Reservation Row Badges */
        .ob-res-guest b {
          display: block;
          font-size: 13.5px;
          color: #1a1714;
        }
        .ob-res-guest small {
          font-size: 12px;
          color: #78716c;
        }
        .ob-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .ob-badge-pending {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fdba74;
        }
        .ob-badge-confirmed {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #7dd3fc;
        }
        .ob-badge-completed {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #86efac;
        }
        .ob-badge-cancelled {
          background: #f5f5f4;
          color: #78716c;
          border: 1px solid #e7e2dc;
        }

        /* ── Modal Overlay ── */
        .ob-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 70;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .ob-modal {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .ob-modal-accent {
          height: 4px;
          background: linear-gradient(90deg, #ea580c, #f97316);
        }
        .ob-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px 0;
        }
        .ob-modal-header h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #1a1714;
        }
        .ob-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          border: 1px solid #e7e2dc;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .ob-modal-body { padding: 18px 22px 22px; }

        /* ── Toast ── */
        .ob-toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .ob-toast.success { background: #16a34a; }
        .ob-toast.error { background: #dc2626; }

        /* ── Empty & Center ── */
        .ob-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #a8a29e;
          gap: 10px;
        }

        /* ── Responsive ── */
        @media (max-width: 1050px) {
          .ob-kpis { grid-template-columns: repeat(2, 1fr); }
          .ob-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .ob-header { flex-direction: column; }
          .ob-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob-view">
        {/* ── Page Header ── */}
        <div className="ob-header">
          <div>
            <div className="ob-eyebrow">
              <WalletCards size={14} /> {t("VẬN HÀNH BÀN ĂN & THANH TOÁN", "FINANCIAL & TABLE OPERATIONS")}
            </div>
            <h1>{t("Đơn hàng, Thanh toán & Đặt bàn", "Orders, Billing & Reservations")}</h1>
            <p>
              {t(
                "Quản lý tập trung các bàn đang dùng bữa, hóa đơn thanh toán và các yêu cầu đặt bàn trước từ website.",
                "Unified management of active dine-in table sessions, billing settlements, and online web reservations."
              )}
            </p>
          </div>

          <div className="ob-header-actions">
            <button
              className="ob-btn ob-btn-secondary"
              onClick={() => {
                refetchOrders();
                refetchReservations();
                showToast(t("Đã làm mới dữ liệu!", "Data refreshed!"));
              }}
              title={t("Làm mới", "Refresh")}
            >
              <RefreshCw size={14} />
            </button>
            <button
              className="ob-btn ob-btn-secondary"
              onClick={() => navigate(ROUTES.MANAGER.FLOOR_MAP)}
            >
              <Layers size={14} /> {t("Sơ đồ bàn", "Floor Map")}
            </button>
          </div>
        </div>

        {/* ── Top KPIs ── */}
        <div className="ob-kpis">
          <div className="ob-kpi-card">
            <div className="ob-kpi-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
              <Receipt size={22} />
            </div>
            <div className="ob-kpi-meta">
              <span>{t("TIỀN CHỜ THANH TOÁN", "PENDING BILLING")}</span>
              <strong>{formatMoney(metrics.totalPendingAmount)}</strong>
              <small>{t("các bàn đang phục vụ", "from active sessions")}</small>
            </div>
          </div>

          <div className="ob-kpi-card">
            <div className="ob-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <UtensilsCrossed size={22} />
            </div>
            <div className="ob-kpi-meta">
              <span>{t("BÀN ĐANG PHỤC VỤ", "ACTIVE TABLES")}</span>
              <strong>
                {metrics.activeTablesCount} <span style={{ fontSize: 16, color: "#a8a29e", fontWeight: 400 }}>/ {allTables.length}</span>
              </strong>
              <small>{t("bàn đang có khách", "dining in progress")}</small>
            </div>
          </div>

          <div className="ob-kpi-card">
            <div className="ob-kpi-icon" style={{ background: "#e0f2fe", color: "#0369a1" }}>
              <CalendarDays size={22} />
            </div>
            <div className="ob-kpi-meta">
              <span>{t("ĐẶT BÀN TRƯỚC", "RESERVATIONS")}</span>
              <strong>{metrics.totalReservationsCount}</strong>
              <small>{t("đơn đặt từ website", "web bookings recorded")}</small>
            </div>
          </div>

          <div className="ob-kpi-card">
            <div className="ob-kpi-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
              <AlertCircle size={22} />
            </div>
            <div className="ob-kpi-meta">
              <span>{t("ĐẶT BÀN CHỜ DUYỆT", "PENDING APPROVAL")}</span>
              <strong style={{ color: metrics.pendingReservationsCount > 0 ? "#dc2626" : "#1a1714" }}>
                {metrics.pendingReservationsCount}
              </strong>
              <small>{t("cần quản lý xác nhận", "waiting for confirmation")}</small>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <div className="ob-tabs-wrapper">
          <div className="ob-tabs">
            <button
              className={`ob-tab-btn ${activeTab === "ACTIVE_DINING" ? "active" : ""}`}
              onClick={() => setActiveTab("ACTIVE_DINING")}
            >
              <Utensils size={16} />
              {t("Bàn đang phục vụ & Hóa đơn", "Active Tables & Billing")}
              <span className="ob-tab-badge">{pendingOrders.length}</span>
            </button>

            <button
              className={`ob-tab-btn ${activeTab === "RESERVATIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("RESERVATIONS")}
            >
              <Calendar size={16} />
              {t("Khách đặt bàn trước qua Web", "Online Reservations")}
              <span className="ob-tab-badge" style={{ background: metrics.pendingReservationsCount > 0 ? "#fef2f2" : undefined, color: metrics.pendingReservationsCount > 0 ? "#dc2626" : undefined }}>
                {reservations.length}
              </span>
            </button>
          </div>

          {/* Quick jump actions */}
          <div style={{ fontSize: 13, color: "#78716c" }}>
            {activeTab === "ACTIVE_DINING"
              ? t("Hiển thị các bàn ăn đang gọi món và thanh toán trực tiếp", "Live dine-in tables receiving service")
              : t("Khách đặt chỗ trước từ trang web /reservation", "Bookings from public reservation portal")}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
           TAB 1: BÀN ĐANG PHỤC VỤ (ACTIVE DINING & ORDERS)
           ═══════════════════════════════════════════════════════ */}
        {activeTab === "ACTIVE_DINING" && (
          <div>
            {/* Search & Floor Filter */}
            <div className="ob-toolbar">
              <div className="ob-search-box">
                <Search size={15} style={{ color: "#a8a29e" }} />
                <input
                  placeholder={t("Tìm theo tên bàn, mã đơn...", "Search table, order code...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="ob-filter-pills">
                <button
                  className={`ob-pill-btn ${tableFloorFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setTableFloorFilter("ALL")}
                >
                  {t("Tất cả tầng", "All Floors")}
                </button>
                <button
                  className={`ob-pill-btn ${tableFloorFilter === 1 ? "active" : ""}`}
                  onClick={() => setTableFloorFilter(1)}
                >
                  {t("Tầng 1", "Floor 1")}
                </button>
                <button
                  className={`ob-pill-btn ${tableFloorFilter === 2 ? "active" : ""}`}
                  onClick={() => setTableFloorFilter(2)}
                >
                  {t("Tầng 2", "Floor 2")}
                </button>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="ob-center">
                <Loader2 size={32} className="spin" />
                <span>{t("Đang tải danh sách bàn đang phục vụ...", "Loading active tables...")}</span>
              </div>
            ) : filteredActiveOrders.length === 0 ? (
              <div className="ob-center">
                <UtensilsCrossed size={36} />
                <span>{t("Không có bàn nào đang hoạt động khớp bộ lọc", "No active tables matching filter")}</span>
              </div>
            ) : (
              <div className="ob-grid">
                {filteredActiveOrders.map((order: any) => {
                  const table = order.session?.table;
                  const guests = order.session?.customerCount || table?.capacity || 2;
                  const amount = Number(order.totalAmount || 0);

                  return (
                    <article className="ob-card" key={order.id}>
                      <div>
                        <div className="ob-card-top">
                          <div className="ob-card-table">
                            <TableIcon size={18} style={{ color: "#ea580c" }} />
                            {table?.tableNumber || `Table #${order.orderCode}`}
                          </div>
                          <div className="ob-card-amount">{formatMoney(amount)}</div>
                        </div>

                        <div className="ob-card-meta">
                          <span>
                            <Users size={13} /> {guests} {t("khách", "guests")}
                          </span>
                          <span>
                            <MapPin size={13} /> {t("Tầng", "Floor")} {table?.floor || 1}
                          </span>
                          <span className="ob-status-pill progress">
                            <Clock size={11} /> {order.status}
                          </span>
                        </div>

                        <div style={{ fontSize: 12.5, color: "#57534e", marginBottom: 6 }}>
                          <b>Order:</b> {order.orderCode} • <b>Session:</b> {order.session?.sessionCode || "LIVE"}
                        </div>
                      </div>

                      <div className="ob-card-actions">
                        <button
                          className="ob-btn ob-btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => setSelectedOrderForBill(order)}
                        >
                          <FileText size={14} /> {t("Xem hóa đơn", "View Bill")}
                        </button>
                        <button
                          className="ob-btn ob-btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            showToast(
                              t(`Đang chuyển sang thanh toán bàn ${table?.tableNumber}`, `Opening payment for ${table?.tableNumber}`),
                              "success"
                            );
                          }}
                        >
                          <CreditCard size={14} /> {t("Thanh toán", "Settle Pay")}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
           TAB 2: ĐẶT BÀN TRƯỚC QUA WEB (ONLINE RESERVATIONS)
           ═══════════════════════════════════════════════════════ */}
        {activeTab === "RESERVATIONS" && (
          <div>
            {/* Search & Reservation Status Filter */}
            <div className="ob-toolbar">
              <div className="ob-search-box">
                <Search size={15} style={{ color: "#a8a29e" }} />
                <input
                  placeholder={t("Tìm theo tên khách, SĐT, mã đặt chỗ...", "Search guest name, phone, code...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="ob-filter-pills">
                <button
                  className={`ob-pill-btn ${resStatusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setResStatusFilter("ALL")}
                >
                  {t("Tất cả", "All")} ({reservations.length})
                </button>
                <button
                  className={`ob-pill-btn ${resStatusFilter === "PENDING" ? "active" : ""}`}
                  onClick={() => setResStatusFilter("PENDING")}
                >
                  {t("Chờ duyệt", "Pending")} ({reservations.filter((r: any) => r.status === "PENDING").length})
                </button>
                <button
                  className={`ob-pill-btn ${resStatusFilter === "CONFIRMED" ? "active" : ""}`}
                  onClick={() => setResStatusFilter("CONFIRMED")}
                >
                  {t("Đã xác nhận", "Confirmed")} ({reservations.filter((r: any) => r.status === "CONFIRMED").length})
                </button>
                <button
                  className={`ob-pill-btn ${resStatusFilter === "COMPLETED" ? "active" : ""}`}
                  onClick={() => setResStatusFilter("COMPLETED")}
                >
                  {t("Đã nhận bàn", "Completed")} ({reservations.filter((r: any) => r.status === "COMPLETED").length})
                </button>
                <button
                  className={`ob-pill-btn ${resStatusFilter === "CANCELLED" ? "active" : ""}`}
                  onClick={() => setResStatusFilter("CANCELLED")}
                >
                  {t("Đã hủy", "Cancelled")}
                </button>
              </div>

              <button
                className="ob-btn ob-btn-success"
                style={{ marginLeft: "auto", flexShrink: 0 }}
                onClick={() => {
                  setIsScanCheckInOpen(true);
                  setScanInputCode("");
                  setScannedReservation(null);
                }}
              >
                <QrCode size={16} /> {t("Quét QR Check-in", "Scan QR Check-in")}
              </button>
            </div>

            {isLoadingReservations ? (
              <div className="ob-center">
                <Loader2 size={32} className="spin" />
                <span>{t("Đang tải danh sách đặt bàn...", "Loading reservations...")}</span>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="ob-center">
                <CalendarDays size={36} />
                <span>{t("Không tìm thấy đơn đặt bàn nào", "No reservations found")}</span>
              </div>
            ) : (
              <div className="ob-table-panel">
                <div className="ob-table-wrap">
                  <table className="ob-table">
                    <thead>
                      <tr>
                        <th>{t("MÃ ĐẶT CHỖ", "CODE")}</th>
                        <th>{t("KHÁCH HÀNG", "GUEST")}</th>
                        <th>{t("NGÀY & GIỜ HẸN", "RESERVATION TIME")}</th>
                        <th>{t("SỐ KHÁCH", "PARTY SIZE")}</th>
                        <th>{t("BÀN ĐÃ GÁN", "ASSIGNED TABLE")}</th>
                        <th>{t("TIỀN CỌC", "DEPOSIT")}</th>
                        <th>{t("TRẠNG THÁI", "STATUS")}</th>
                        <th style={{ textAlign: "right" }}>{t("THAO TÁC DUYỆT", "ACTIONS")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((res: any) => {
                        const dateObj = new Date(res.reservationTime);
                        const timeStr = `${String(dateObj.getHours()).padStart(2, "0")}:${String(
                          dateObj.getMinutes()
                        ).padStart(2, "0")}`;
                        const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
                          dateObj.getMonth() + 1
                        ).padStart(2, "0")}/${dateObj.getFullYear()}`;

                        return (
                          <tr key={res.id}>
                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#ea580c" }}>
                              #{res.id.slice(0, 8).toUpperCase()}
                            </td>

                            <td>
                              <div className="ob-res-guest">
                                <b>{res.guestName}</b>
                                <small>
                                  <Phone size={11} style={{ display: "inline", marginRight: 3 }} />
                                  {res.guestPhone}
                                </small>
                                {res.specialRequest && (
                                  <div style={{ fontSize: 11, color: "#b45309", marginTop: 2, fontStyle: "italic" }}>
                                    "{res.specialRequest}"
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: "#1a1714" }}>{timeStr}</div>
                              <small style={{ color: "#78716c" }}>{dateStr}</small>
                            </td>

                            <td>
                              <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <Users size={14} color="#ea580c" /> {res.partySize} {t("người", "guests")}
                              </span>
                            </td>

                            <td>
                              {res.table ? (
                                <span style={{ fontWeight: 600, color: "#0369a1", display: "flex", alignItems: "center", gap: 4 }}>
                                  <TableIcon size={14} /> {res.table.tableNumber} ({t("Tầng", "F")}{res.table.floor})
                                </span>
                              ) : (
                                <button
                                  className="ob-btn ob-btn-secondary"
                                  style={{ height: 28, fontSize: 11, padding: "0 8px" }}
                                  onClick={() => {
                                    setSelectedResForAssign(res);
                                    const bestMatch = allTables.find((t: any) => t.status === "AVAILABLE" && t.capacity >= res.partySize);
                                    setAssignedTableId(bestMatch?.id || allTables[0]?.id || "");
                                  }}
                                >
                                  <Plus size={12} /> {t("Gán bàn", "Assign")}
                                </button>
                              )}
                            </td>

                            <td>
                              {res.depositAmount ? (
                                <div>
                                  <b style={{ color: "#059669" }}>${Number(res.depositAmount).toFixed(2)}</b>
                                  <div style={{ fontSize: 10, color: res.depositStatus === "PAID" ? "#059669" : "#d97706" }}>
                                    ● {res.depositStatus || "PAID"}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: "#a8a29e", fontSize: 12 }}>{t("Không cọc", "None")}</span>
                              )}
                            </td>

                            <td>
                              <span
                                className={`ob-badge-status ${
                                  res.status === "CONFIRMED"
                                    ? "ob-badge-confirmed"
                                    : res.status === "PENDING"
                                    ? "ob-badge-pending"
                                    : res.status === "COMPLETED"
                                    ? "ob-badge-completed"
                                    : "ob-badge-cancelled"
                                }`}
                              >
                                {res.status}
                              </span>
                            </td>

                            <td>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                                {/* Nút Xác nhận (Nếu đang PENDING) */}
                                {res.status === "PENDING" && (
                                  <button
                                    className="ob-btn ob-btn-primary"
                                    style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                                    onClick={() => confirmMutation.mutate(res.id)}
                                    title={t("Xác nhận đặt bàn", "Confirm Booking")}
                                  >
                                    <Check size={13} /> {t("Duyệt", "Confirm")}
                                  </button>
                                )}

                                {/* Nút Gán bàn đổi bàn */}
                                <button
                                  className="ob-btn ob-btn-secondary"
                                  style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                                  onClick={() => {
                                    setSelectedResForAssign(res);
                                    const bestMatch = allTables.find((t: any) => t.status === "AVAILABLE" && t.capacity >= res.partySize);
                                    setAssignedTableId(res.tableId || bestMatch?.id || allTables[0]?.id || "");
                                  }}
                                  title={t("Đổi bàn", "Change Table")}
                                >
                                  <TableIcon size={13} />
                                </button>

                                {/* Nút Check-in nhận bàn khi khách đến */}
                                {res.status !== "COMPLETED" && res.status !== "CANCELLED" && (
                                  <button
                                    className="ob-btn ob-btn-success"
                                    style={{ height: 30, fontSize: 12, padding: "0 10px" }}
                                    onClick={() => checkInMutation.mutate(res.id)}
                                    title={t("Khách đã đến - Nhận bàn", "Check in guest to dining session")}
                                  >
                                    <UserCheck size={13} /> {t("Check-in", "Check-in")}
                                  </button>
                                )}

                                {/* Nút Hủy */}
                                {res.status !== "CANCELLED" && res.status !== "COMPLETED" && (
                                  <button
                                    className="ob-btn ob-btn-secondary"
                                    style={{ height: 30, fontSize: 12, padding: "0 8px", color: "#dc2626" }}
                                    onClick={() => cancelMutation.mutate(res.id)}
                                    title={t("Hủy đặt bàn", "Cancel Booking")}
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL: XEM CHI TIẾT HÓA ĐƠN
          ═══════════════════════════════════════════════════════ */}
      {selectedOrderForBill && (
        <div className="ob-modal-overlay" onClick={() => setSelectedOrderForBill(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ob-modal-accent" />
            <div className="ob-modal-header">
              <h2>{t("Chi tiết hóa đơn bàn", "Table Bill Details")}</h2>
              <button className="ob-modal-close" onClick={() => setSelectedOrderForBill(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="ob-modal-body">
              <div style={{ textAlign: "center", marginBottom: 18, borderBottom: "1px dashed #e7e2dc", paddingBottom: 14 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 20, color: "#1a1714" }}>
                  {selectedOrderForBill.session?.table?.tableNumber || "TABLE"}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#78716c" }}>
                  {t("Mã đơn", "Order Code")}: #{selectedOrderForBill.orderCode} • {t("Thời gian", "Time")}:{" "}
                  {new Date(selectedOrderForBill.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#78716c" }}>
                <span>{t("Tạm tính", "Subtotal")}</span>
                <b>{formatMoney(Number(selectedOrderForBill.totalAmount || 0))}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#78716c" }}>
                <span>VAT (8%)</span>
                <b>{formatMoney(Number(selectedOrderForBill.totalAmount || 0) * 0.08)}</b>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "2px solid #1a1714",
                  fontSize: 17,
                  color: "#1a1714",
                }}
              >
                <b>{t("TỔNG THANH TOÁN", "TOTAL DUE")}</b>
                <b style={{ color: "#ea580c" }}>
                  {formatMoney(Number(selectedOrderForBill.totalAmount || 0) * 1.08)}
                </b>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button
                  className="ob-btn ob-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    showToast(t("Đang gửi lệnh in phiếu hóa đơn...", "Sending print ticket..."), "success");
                  }}
                >
                  <Printer size={15} /> {t("In hóa đơn", "Print Bill")}
                </button>
                <button
                  className="ob-btn ob-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSelectedOrderForBill(null);
                    showToast(t("Đã ghi nhận thanh toán thành công!", "Payment processed!"), "success");
                  }}
                >
                  <Check size={15} /> {t("Xác nhận trả tiền", "Complete Payment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: GÁN BÀN CHO LƯỢT ĐẶT TRƯỚC (THÔNG MINH)
          ═══════════════════════════════════════════════════════ */}
      {selectedResForAssign && (
        <div className="ob-modal-overlay" onClick={() => setSelectedResForAssign(null)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="ob-modal-accent" />
            <div className="ob-modal-header">
              <h2>{t("Điều phối & Gán bàn cho khách", "Assign Table for Booking")}</h2>
              <button className="ob-modal-close" onClick={() => setSelectedResForAssign(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="ob-modal-body">
              {/* Tóm tắt khách */}
              <div style={{ marginBottom: 16, background: "#fdf8f4", border: "1px solid #fed7aa", padding: "12px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 15, color: "#1a1714" }}>{selectedResForAssign.guestName}</b>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={14} /> {selectedResForAssign.partySize} {t("người", "guests")}
                  </span>
                </div>
                {selectedResForAssign.specialRequest && (
                  <div style={{ fontSize: 12, color: "#9a3412", marginTop: 6, fontWeight: 500 }}>
                    📌 <b>{t("Yêu cầu & Sở thích:", "Preferences:")}</b> {selectedResForAssign.specialRequest}
                  </div>
                )}
              </div>

              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#78716c", marginBottom: 8 }}>
                {t("CHỌN BÀN ĂN PHÙ HỢP (HỆ THỐNG ĐÃ ƯU TIÊN GỢI Ý BÀN TỐT NHẤT)", "SELECT MATCHING TABLE")}
              </label>

              <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e7e2dc", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {recommendedTables.map((tbl: any) => {
                  const isSelected = assignedTableId === tbl.id;
                  const isAvailable = tbl.status === "AVAILABLE";
                  const isCapacityFit = tbl.capacity >= selectedResForAssign.partySize;

                  return (
                    <div
                      key={tbl.id}
                      onClick={() => setAssignedTableId(tbl.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: isSelected ? "2px solid #ea580c" : "1px solid #e7e2dc",
                        background: isSelected ? "#fff7ed" : isAvailable ? "#ffffff" : "#f5f5f4",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: isAvailable ? "#22c55e" : tbl.status === "OCCUPIED" ? "#ef4444" : "#f59e0b",
                          }}
                        />
                        <div>
                          <strong style={{ fontSize: 13.5, color: "#1a1714" }}>{tbl.tableNumber}</strong>
                          <span style={{ fontSize: 12, color: "#78716c", marginLeft: 8 }}>
                            {t("Tầng", "Floor")} {tbl.floor} • {tbl.capacity} {t("chỗ", "seats")}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isCapacityFit && isAvailable && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: 4, border: "1px solid #a7f3d0" }}>
                            {t("Phù hợp", "Good Match")}
                          </span>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, color: isAvailable ? "#15803d" : "#78716c" }}>
                          {tbl.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="ob-btn ob-btn-secondary" onClick={() => setSelectedResForAssign(null)}>
                  {t("Hủy", "Cancel")}
                </button>
                <button
                  className="ob-btn ob-btn-secondary"
                  disabled={!assignedTableId || assignTableMutation.isPending}
                  onClick={() =>
                    assignTableMutation.mutate({
                      id: selectedResForAssign.id,
                      tableId: assignedTableId,
                    })
                  }
                >
                  <Check size={14} /> {t("Chỉ gán bàn", "Assign Only")}
                </button>
                <button
                  className="ob-btn ob-btn-primary"
                  disabled={!assignedTableId || assignTableMutation.isPending || confirmMutation.isPending}
                  onClick={async () => {
                    try {
                      await assignTableMutation.mutateAsync({
                        id: selectedResForAssign.id,
                        tableId: assignedTableId,
                      });
                      if (selectedResForAssign.status === "PENDING") {
                        await confirmMutation.mutateAsync(selectedResForAssign.id);
                      }
                      setSelectedResForAssign(null);
                      showToast(
                        t("Đã gán bàn và duyệt đơn đặt bàn thành công!", "Table assigned & reservation confirmed!"),
                        "success"
                      );
                    } catch {
                      showToast(t("Có lỗi khi thao tác", "Error occurred"), "error");
                    }
                  }}
                >
                  <CheckCircle2 size={15} />{" "}
                  {selectedResForAssign.status === "PENDING"
                    ? t("Gán bàn & Duyệt ngay", "Assign & Confirm Now")
                    : t("Cập nhật bàn", "Update Table")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: QUÉT MÃ QR CHECK-IN NHANH CHO HOSTESS
          ═══════════════════════════════════════════════════════ */}
      {isScanCheckInOpen && (
        <div className="ob-modal-overlay" onClick={() => setIsScanCheckInOpen(false)}>
          <div className="ob-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="ob-modal-accent" style={{ background: "linear-gradient(90deg, #10b981, #059669)" }} />
            <div className="ob-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#ecfdf5", color: "#059669", display: "grid", placeItems: "center" }}>
                  <QrCode size={18} />
                </div>
                <h2>{t("Quét mã QR / Check-in Khách Đặt Bàn", "Scan QR / Check-in Guest")}</h2>
              </div>
              <button className="ob-modal-close" onClick={() => setIsScanCheckInOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="ob-modal-body">
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#78716c", lineHeight: 1.5 }}>
                {t(
                  "Sử dụng máy quét mã vạch / camera quét mã QR trên điện thoại của khách, hoặc nhập mã đặt chỗ / số điện thoại để check-in mở bàn ăn.",
                  "Scan guest's mobile QR code or enter reservation ID/phone to check-in and open dining session."
                )}
              </p>

              {/* Ô quét mã */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchReservationByScan();
                }}
                style={{ display: "flex", gap: 8, marginBottom: 18 }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <ScanLine
                    size={17}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#059669" }}
                  />
                  <input
                    autoFocus
                    placeholder={t("Quét QR hoặc nhập mã đơn / SĐT khách...", "Scan QR or enter Code / Phone...")}
                    value={scanInputCode}
                    onChange={(e) => setScanInputCode(e.target.value)}
                    style={{
                      width: "100%",
                      height: 42,
                      paddingLeft: 38,
                      paddingRight: 12,
                      border: "2px solid #a7f3d0",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="ob-btn ob-btn-primary"
                  style={{ background: "#059669", height: 42, padding: "0 18px" }}
                  disabled={isSearchingScan || !scanInputCode.trim()}
                >
                  {isSearchingScan ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                  {t("Tìm đơn", "Search")}
                </button>
              </form>

              {/* Khung kết quả tra cứu */}
              {scannedReservation && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {t("ĐÃ XÁC NHẬN ĐƠN HỢP LỆ", "VALID RESERVATION")}
                      </span>
                      <h3 style={{ margin: "2px 0 0", fontSize: 17, color: "#1a1714" }}>
                        {scannedReservation.guestName}
                      </h3>
                      <span style={{ fontSize: 12, color: "#4b5563" }}>
                        📞 {scannedReservation.guestPhone} • Mã:{" "}
                        <strong style={{ fontFamily: "monospace", color: "#059669" }}>
                          #{scannedReservation.id.slice(0, 8).toUpperCase()}
                        </strong>
                      </span>
                    </div>

                    <span
                      className={`ob-badge-status ${
                        scannedReservation.status === "CONFIRMED"
                          ? "ob-badge-confirmed"
                          : scannedReservation.status === "COMPLETED"
                          ? "ob-badge-completed"
                          : "ob-badge-pending"
                      }`}
                    >
                      {scannedReservation.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5, color: "#374151", background: "#ffffff", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1fae5", marginBottom: 12 }}>
                    <div>
                      👥 <b>{t("Số khách:", "Party size:")}</b> {scannedReservation.partySize} {t("người", "guests")}
                    </div>
                    <div>
                      🕒 <b>{t("Giờ hẹn:", "Time:")}</b>{" "}
                      {new Date(scannedReservation.reservationTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {scannedReservation.specialRequest && (
                      <div style={{ gridColumn: "span 2", fontSize: 11.5, color: "#9a3412" }}>
                        📌 <i>{scannedReservation.specialRequest}</i>
                      </div>
                    )}
                  </div>

                  {/* Chọn / Xác nhận bàn Check-in */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      {t("BÀN ĂN DÀNH CHO KHÁCH (CHỌN BÀN ĐỂ MỞ PHIÊN ĂN):", "ASSIGNED TABLE FOR GUEST:")}
                    </label>
                    <select
                      value={scanQuickTableId}
                      onChange={(e) => setScanQuickTableId(e.target.value)}
                      style={{
                        width: "100%",
                        height: 38,
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        padding: "0 10px",
                        fontSize: 13,
                        fontWeight: 600,
                        background: "#ffffff",
                        color: "#1a1714",
                        outline: "none",
                      }}
                    >
                      <option value="">{t("-- Chọn bàn ăn phù hợp --", "-- Select a table --")}</option>
                      {allTables.map((tbl: any) => (
                        <option
                          key={tbl.id}
                          value={tbl.id}
                          disabled={tbl.status === "OCCUPIED" && tbl.id !== scannedReservation.tableId}
                        >
                          {tbl.tableNumber} (Tầng {tbl.floor} • {tbl.capacity} chỗ) - [{tbl.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cảnh báo nếu đã check-in trước đó */}
                  {scannedReservation.status === "COMPLETED" && (
                    <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                      ℹ️ {t("Đơn này đã được check-in trước đó.", "This reservation is already checked-in.")}
                    </div>
                  )}

                  {/* Nút Check-in */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="ob-btn ob-btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setScannedReservation(null)}
                    >
                      {t("Đổi mã khác", "Scan Another")}
                    </button>
                    <button
                      type="button"
                      className="ob-btn ob-btn-success"
                      style={{ flex: 2, height: 42, fontSize: 14 }}
                      disabled={checkInMutation.isPending || !scanQuickTableId}
                      onClick={handleConfirmScanCheckIn}
                    >
                      {checkInMutation.isPending ? (
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <UserCheck size={17} />
                      )}
                      {t("Xác nhận Check-in & Bắt đầu ăn", "Confirm Check-in & Seat Guest")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`ob-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </>
  );
}