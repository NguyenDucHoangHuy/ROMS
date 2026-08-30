// export default function AuditLogsPage() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-white mb-1">Nhật ký hoạt động</h1>
//       <p className="text-gray-500 text-sm mb-2">Audit Logs — Chỉ Admin mới có quyền xem</p>
//       <p className="text-gray-600 text-sm mt-4">AuditLogsPage — Coming soon</p>
//     </div>
//   )
// }

"use client";

import { useMemo, useState } from "react";

// import {
//   AlertCircle,
//   CalendarDays,
//   Download,
// } from "lucide-react";

import PageHeading from "../common/PageHeading";
// import KPI from "../common/KPI";

type LoaiHanhDong =
  | "tao-don"
  | "cap-nhat-mon"
  | "sua-gia"
  | "duyet-hoan-tien"
  | "huy-don"
  | "dang-nhap"
  | "xuat-kho"
  | "thanh-toan";

type DoiTuongLog = "hoa-don" | "thanh-toan" | "kho" | "he-thong";

type MucDoRuiRo = "binh-thuong" | "canh-bao" | "nghiem-trong";

interface SuKienLienQuan {
  thoiGian: string;
  hanhDong: string;
  nguoiThucHien: string;
}

interface NhatKyHanhDong {
  id: string;
  thoiGian: string; // dd/mm/yyyy HH:mm:ss
  nhanVien: string;
  vaiTro: string;
  viTat: string;
  loaiHanhDong: LoaiHanhDong;
  doiTuong: DoiTuongLog;
  moTa: string;
  mucDoRuiRo: MucDoRuiRo;
  duLieuTruoc?: Record<string, string | number>;
  duLieuSau?: Record<string, string | number>;
  chuoiSuKien?: SuKienLienQuan[];
  nhomBatThuong?: string; // id nhóm cảnh báo bất thường (nếu có)
}

interface QuyTacCanhBao {
  id: string;
  ten: string;
  moTa: string;
  batTat: boolean;
  mucDo: MucDoRuiRo;
}

/* ================================================================
   Nhãn hiển thị
   ================================================================ */
const NHAN_HANH_DONG: Record<LoaiHanhDong, string> = {
  "tao-don": "Tạo đơn",
  "cap-nhat-mon": "Cập nhật món",
  "sua-gia": "Sửa giá",
  "duyet-hoan-tien": "Duyệt hoàn tiền",
  "huy-don": "Huỷ đơn",
  "dang-nhap": "Đăng nhập",
  "xuat-kho": "Xuất / điều chỉnh kho",
  "thanh-toan": "Xử lý thanh toán",
};

const NHAN_DOI_TUONG: Record<DoiTuongLog, string> = {
  "hoa-don": "Đơn hàng / Hoá đơn",
  "thanh-toan": "Thanh toán",
  kho: "Kho hàng",
  "he-thong": "Hệ thống",
};

const MAU_MUC_DO: Record<MucDoRuiRo, string> = {
  "binh-thuong": "val-badge--thuong",
  "canh-bao": "val-badge--canh-bao",
  "nghiem-trong": "val-badge--nghiem-trong",
};

const NHAN_MUC_DO: Record<MucDoRuiRo, string> = {
  "binh-thuong": "Bình thường",
  "canh-bao": "Cảnh báo",
  "nghiem-trong": "Nghiêm trọng",
};

/* ================================================================
   Chuỗi sự kiện liên quan đến Đơn #88219 (dùng minh hoạ Audit Trail
   Inspection: Khách đặt món -> Bếp nấu -> Thu ngân sửa giá -> Quản lý
   duyệt hoàn tiền)
   ================================================================ */
const CHUOI_SU_KIEN_88219: SuKienLienQuan[] = [
  { thoiGian: "19:32:05", hanhDong: "Khách đặt món (tạo đơn #88219)", nguoiThucHien: "Minh Anh — Phục vụ" },
  { thoiGian: "19:41:12", hanhDong: "Bếp xác nhận đã chế biến xong món", nguoiThucHien: "Đức — Bếp" },
  { thoiGian: "19:52:47", hanhDong: "Thu ngân chỉnh sửa giá món trên hoá đơn", nguoiThucHien: "Lan — Thu ngân" },
  { thoiGian: "20:03:15", hanhDong: "Quản lý duyệt yêu cầu hoàn tiền", nguoiThucHien: "Hùng — Quản lý" },
];

/* ============================================================
   Dữ liệu mẫu (demo) — trong thực tế sẽ được lấy từ API backend.
   Bao gồm 1 cụm 5 lần "Duyệt hoàn tiền" liên tiếp trong 10 phút của
   cùng 1 Quản lý để minh hoạ tính năng Anomaly Detection.
   ============================================================ */
const NHAT_KY: NhatKyHanhDong[] = [
  {
    id: "LOG-10245",
    thoiGian: "22/08/2026 19:32:05",
    nhanVien: "Minh Anh",
    vaiTro: "Phục vụ",
    viTat: "MA",
    loaiHanhDong: "tao-don",
    doiTuong: "hoa-don",
    moTa: "Tạo đơn hàng mới cho Bàn 12 (Đơn #88219)",
    mucDoRuiRo: "binh-thuong",
    chuoiSuKien: CHUOI_SU_KIEN_88219,
  },
  {
    id: "LOG-10246",
    thoiGian: "22/08/2026 19:41:12",
    nhanVien: "Đức",
    vaiTro: "Bếp",
    viTat: "Đ",
    loaiHanhDong: "cap-nhat-mon",
    doiTuong: "hoa-don",
    moTa: "Đánh dấu hoàn tất chế biến cho Đơn #88219",
    mucDoRuiRo: "binh-thuong",
    chuoiSuKien: CHUOI_SU_KIEN_88219,
  },
  {
    id: "LOG-10247",
    thoiGian: "22/08/2026 19:52:47",
    nhanVien: "Lan",
    vaiTro: "Thu ngân",
    viTat: "L",
    loaiHanhDong: "sua-gia",
    doiTuong: "thanh-toan",
    moTa: "Chỉnh sửa giá món 'Bít tết Wagyu' trên Đơn #88219",
    mucDoRuiRo: "canh-bao",
    duLieuTruoc: { monAn: "Bít tết Wagyu", gia: "$130.00", ghiChu: "(trống)" },
    duLieuSau: { monAn: "Bít tết Wagyu", gia: "$95.00", ghiChu: "Giảm giá do khách khiếu nại chất lượng" },
    chuoiSuKien: CHUOI_SU_KIEN_88219,
  },
  {
    id: "LOG-10248",
    thoiGian: "22/08/2026 20:03:15",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $35.00 cho Đơn #88219 (khiếu nại chất lượng món ăn)",
    mucDoRuiRo: "canh-bao",
    duLieuTruoc: { trangThai: "Chờ duyệt", soTienHoan: "$35.00" },
    duLieuSau: { trangThai: "Đã hoàn tiền", soTienHoan: "$35.00" },
    chuoiSuKien: CHUOI_SU_KIEN_88219,
  },
  {
    id: "LOG-10249",
    thoiGian: "22/08/2026 20:05:02",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $18.00 cho Đơn #88203",
    mucDoRuiRo: "nghiem-trong",
    nhomBatThuong: "hoan-tien-lien-tuc",
  },
  {
    id: "LOG-10250",
    thoiGian: "22/08/2026 20:06:19",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $42.00 cho Đơn #88195",
    mucDoRuiRo: "nghiem-trong",
    nhomBatThuong: "hoan-tien-lien-tuc",
  },
  {
    id: "LOG-10251",
    thoiGian: "22/08/2026 20:07:33",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $27.50 cho Đơn #88188",
    mucDoRuiRo: "nghiem-trong",
    nhomBatThuong: "hoan-tien-lien-tuc",
  },
  {
    id: "LOG-10252",
    thoiGian: "22/08/2026 20:08:41",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $60.00 cho Đơn #88176",
    mucDoRuiRo: "nghiem-trong",
    nhomBatThuong: "hoan-tien-lien-tuc",
  },
  {
    id: "LOG-10253",
    thoiGian: "22/08/2026 20:09:58",
    nhanVien: "Hùng",
    vaiTro: "Quản lý",
    viTat: "H",
    loaiHanhDong: "duyet-hoan-tien",
    doiTuong: "thanh-toan",
    moTa: "Duyệt hoàn tiền $15.00 cho Đơn #88160",
    mucDoRuiRo: "nghiem-trong",
    nhomBatThuong: "hoan-tien-lien-tuc",
  },
  {
    id: "LOG-10254",
    thoiGian: "22/08/2026 21:14:02",
    nhanVien: "Quản Trị Viên",
    vaiTro: "Admin",
    viTat: "AD",
    loaiHanhDong: "dang-nhap",
    doiTuong: "he-thong",
    moTa: "Đăng nhập vào hệ thống quản trị từ thiết bị mới",
    mucDoRuiRo: "binh-thuong",
  },
  {
    id: "LOG-10255",
    thoiGian: "23/08/2026 08:02:44",
    nhanVien: "Kho Nam",
    vaiTro: "Thủ kho",
    viTat: "KN",
    loaiHanhDong: "xuat-kho",
    doiTuong: "kho",
    moTa: "Điều chỉnh giảm 6kg 'Thăn bò Wagyu' do kiểm kê chênh lệch",
    mucDoRuiRo: "canh-bao",
    duLieuTruoc: { soLuong: "24 kg" },
    duLieuSau: { soLuong: "18 kg" },
  },
  {
    id: "LOG-10256",
    thoiGian: "23/08/2026 12:20:10",
    nhanVien: "Sarah J.",
    vaiTro: "Phục vụ",
    viTat: "SJ",
    loaiHanhDong: "huy-don",
    doiTuong: "hoa-don",
    moTa: "Huỷ đơn hàng Bàn 04 (Đơn #88260) — khách đổi ý trước khi bếp nhận món",
    mucDoRuiRo: "binh-thuong",
  },
];

const CAC_LOAI_HANH_DONG = Object.keys(NHAN_HANH_DONG) as LoaiHanhDong[];
const CAC_NHAN_VIEN = Array.from(new Set(NHAT_KY.map((l) => l.nhanVien))).sort();

const QUY_TAC_MAC_DINH: QuyTacCanhBao[] = [
  {
    id: "rule-1",
    ten: "Duyệt hoàn tiền liên tục",
    moTa: "Cảnh báo khi 1 Quản lý bấm Duyệt hoàn tiền ≥ 5 lần trong vòng 10 phút.",
    batTat: true,
    mucDo: "nghiem-trong",
  },
  {
    id: "rule-2",
    ten: "Sửa giá ngoài giờ",
    moTa: "Cảnh báo khi có thao tác Sửa giá diễn ra sau 23:00 hoặc trước 06:00.",
    batTat: false,
    mucDo: "canh-bao",
  },
  {
    id: "rule-3",
    ten: "Đăng nhập từ thiết bị lạ",
    moTa: "Cảnh báo khi tài khoản Admin đăng nhập từ IP hoặc thiết bị chưa từng ghi nhận.",
    batTat: true,
    mucDo: "canh-bao",
  },
];

/* ---- Icon set ---- */
// const IconBell: React.FC = () => (
//   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" strokeLinejoin="round" />
//     <path d="M10 20a2 2 0 004 0" strokeLinecap="round" />
//   </svg>
// );
const IconSearch: React.FC = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
  </svg>
);
const IconLock: React.FC = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M7 10V7a5 5 0 0110 0v3" strokeLinecap="round" />
  </svg>
);
const IconChevronRight: React.FC = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClose: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);
const IconDownload: React.FC = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAlertTriangle: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l10 18H2z" strokeLinejoin="round" />
    <path d="M12 10v4M12 17.5v.1" strokeLinecap="round" />
  </svg>
);

const dinhDangJson = (obj?: Record<string, string | number>) => (obj ? Object.entries(obj) : []);

// export interface ViewAuditLogsProps {
//   onNavigate?: (key: MenuSidebarKey) => void;
// }

export default function AuditLogsPage() {

  const [tuKhoa, setTuKhoa] = useState("");
  const [khungThoiGian, setKhungThoiGian] = useState("30-ngay");
  const [loaiDangChon, setLoaiDangChon] = useState<Set<LoaiHanhDong>>(new Set());
  const [nhanVienDangChon, setNhanVienDangChon] = useState("tat-ca");
  const [doiTuongDangChon, setDoiTuongDangChon] = useState<"tat-ca" | DoiTuongLog>("tat-ca");
  const [chiXemNhomBatThuong, setChiXemNhomBatThuong] = useState<string | null>(null);

  const [logDangXem, setLogDangXem] = useState<NhatKyHanhDong | null>(null);
  const [quyTac, setQuyTac] = useState<QuyTacCanhBao[]>(QUY_TAC_MAC_DINH);
  const [dangXuat, setDangXuat] = useState<string | null>(null);

  const toggleLoaiHanhDong = (loai: LoaiHanhDong) => {
    setLoaiDangChon((prev) => {
      const moi = new Set(prev);
      if (moi.has(loai)) moi.delete(loai);
      else moi.add(loai);
      return moi;
    });
  };

  const datLaiBoLoc = () => {
    setTuKhoa("");
    setKhungThoiGian("30-ngay");
    setLoaiDangChon(new Set());
    setNhanVienDangChon("tat-ca");
    setDoiTuongDangChon("tat-ca");
    setChiXemNhomBatThuong(null);
  };

  const nhatKyDaLoc = useMemo(() => {
    const tk = tuKhoa.trim().toLowerCase();
    return NHAT_KY.filter((l) => {
      if (chiXemNhomBatThuong && l.nhomBatThuong !== chiXemNhomBatThuong) return false;
      if (loaiDangChon.size > 0 && !loaiDangChon.has(l.loaiHanhDong)) return false;
      if (nhanVienDangChon !== "tat-ca" && l.nhanVien !== nhanVienDangChon) return false;
      if (doiTuongDangChon !== "tat-ca" && l.doiTuong !== doiTuongDangChon) return false;
      if (tk && !(l.moTa.toLowerCase().includes(tk) || l.id.toLowerCase().includes(tk))) return false;
      return true;
    });
  }, [tuKhoa, loaiDangChon, nhanVienDangChon, doiTuongDangChon, chiXemNhomBatThuong]);

  const toggleQuyTac = (id: string) => {
    setQuyTac((prev) => prev.map((q) => (q.id === id ? { ...q, batTat: !q.batTat } : q)));
  };

  const themQuyTacMoi = () => {
    setQuyTac((prev) => [
      ...prev,
      {
        id: `rule-${prev.length + 1}`,
        ten: "Quy tắc mới",
        moTa: "Nhấn để cấu hình điều kiện cảnh báo cho quy tắc này.",
        batTat: false,
        mucDo: "binh-thuong",
      },
    ]);
  };

  const xuatBaoCao = (dinhDang: "Excel" | "PDF" | "CSV mã hoá") => {
    setDangXuat(`Đang tạo file ${dinhDang}...`);
    window.setTimeout(() => {
      setDangXuat(`✅ Đã xuất ${nhatKyDaLoc.length} bản ghi ra file ${dinhDang} (giả lập).`);
      window.setTimeout(() => setDangXuat(null), 3000);
    }, 900);
  };

  return (
    <>
      {/* ==========================================================
          CSS riêng cho trang Nhật ký hệ thống — viết trực tiếp tại
          đây theo yêu cầu, không đưa vào styles.css dùng chung.
          ========================================================== */}
      <style>{`
        .val-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .val-title {
          font-size: 24px;
          font-weight: 700;
          margin: 6px 0 4px;
          color: var(--rsp-chu-chinh);
        }
        .val-permission-banner {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 26px;
          background: var(--rsp-trang);
          border: 1px solid var(--rsp-vien);
          border-radius: var(--rsp-radius-lg);
          box-shadow: var(--rsp-shadow);
          padding: 14px 18px;
          margin: 18px 0 22px;
          font-size: 12.5px;
        }
        .val-permission-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .val-permission-group strong {
          font-weight: 700;
        }
        .val-permission-group--ok strong { color: var(--rsp-xanh-la); }
        .val-permission-group--no strong { color: var(--rsp-do); }
        .val-permission-chip {
          background: var(--rsp-nen-xam);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 11.5px;
          color: var(--rsp-chu-chinh);
        }
        .val-permission-group--no .val-permission-chip {
          background: var(--rsp-do-nen);
          color: var(--rsp-do);
          font-weight: 600;
        }

        .val-filter-card {
          background: var(--rsp-trang);
          border: 1px solid var(--rsp-vien);
          border-radius: var(--rsp-radius-lg);
          box-shadow: var(--rsp-shadow);
          padding: 16px 18px;
          margin-bottom: 18px;
        }
        .val-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
        }
        .val-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .val-filter-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--rsp-chu-phu);
        }
        .val-select {
          border: 1px solid var(--rsp-vien);
          background: var(--rsp-trang);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          color: var(--rsp-chu-chinh);
          min-width: 170px;
        }
        .val-filter-search {
          flex: 1;
          min-width: 200px;
        }
        .val-reset-btn {
          border: 1px solid var(--rsp-vien);
          background: var(--rsp-trang);
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--rsp-chu-phu);
        }
        .val-reset-btn:hover { background: var(--rsp-nen-xam); }

        .val-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--rsp-vien);
        }
        .val-chip {
          border: 1px solid var(--rsp-vien);
          background: var(--rsp-trang);
          border-radius: 999px;
          padding: 6px 13px;
          font-size: 12px;
          font-weight: 500;
          color: var(--rsp-chu-chinh);
        }
        .val-chip:hover { background: var(--rsp-nen-xam); }
        .val-chip--active {
          background: var(--rsp-den);
          border-color: var(--rsp-den);
          color: var(--rsp-trang);
          font-weight: 600;
        }

        .val-body-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 18px;
          align-items: start;
        }

        .val-log-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .val-log-count {
          font-size: 13px;
          color: var(--rsp-chu-phu);
        }
        .val-export-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .val-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--rsp-vien);
          background: var(--rsp-trang);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--rsp-chu-chinh);
        }
        .val-export-btn:hover { background: var(--rsp-nen-xam); }
        .val-export-status {
          font-size: 12px;
          color: var(--rsp-cam-dam);
          font-weight: 600;
        }

        .val-log-row {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--rsp-vien);
          padding: 13px 20px;
          display: grid;
          grid-template-columns: 140px 130px 130px 1fr 90px 26px;
          gap: 10px;
          align-items: center;
          font-size: 12.5px;
        }
        .val-log-row:hover { background: #fbfaf8; }
        .val-log-row:last-child { border-bottom: none; }
        .val-log-time { color: var(--rsp-chu-phu); }
        .val-log-person { display: flex; align-items: center; gap: 8px; }
        .val-log-person-name { font-weight: 600; color: var(--rsp-chu-chinh); }
        .val-log-person-role { font-size: 11px; color: var(--rsp-chu-phu); }
        .val-log-desc { color: var(--rsp-chu-chinh); }
        .val-log-chevron { color: var(--rsp-chu-phu); justify-self: end; }

        .val-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .val-badge--thuong { background: var(--rsp-nen-xam); color: var(--rsp-chu-phu); }
        .val-badge--canh-bao { background: var(--rsp-vang-nen); color: var(--rsp-vang); }
        .val-badge--nghiem-trong { background: var(--rsp-do-nen); color: var(--rsp-do); }

        .val-empty { padding: 40px 20px; text-align: center; color: var(--rsp-chu-phu); font-size: 13px; }

        .val-side-col { display: flex; flex-direction: column; gap: 16px; }
        .val-anomaly-card {
          background: var(--rsp-trang);
          border: 1px solid var(--rsp-vien);
          border-radius: var(--rsp-radius-lg);
          box-shadow: var(--rsp-shadow);
          padding: 16px 18px;
        }
        .val-anomaly-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--rsp-chu-chinh);
          margin-bottom: 4px;
        }
        .val-anomaly-sub {
          font-size: 11.5px;
          color: var(--rsp-chu-phu);
          margin-bottom: 14px;
        }
        .val-alert-banner {
          display: flex;
          gap: 10px;
          background: var(--rsp-do-nen);
          color: var(--rsp-do);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .val-alert-banner-icon { flex-shrink: 0; margin-top: 1px; }
        .val-alert-banner button {
          margin-top: 8px;
          background: var(--rsp-trang);
          border: 1px solid rgba(209, 55, 47, 0.35);
          color: var(--rsp-do);
          border-radius: 7px;
          padding: 5px 10px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .val-alert-banner button:hover { background: #fbe7e5; }

        .val-rule-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid var(--rsp-vien);
        }
        .val-rule-row:first-of-type { border-top: none; padding-top: 0; }
        .val-rule-name { font-size: 13px; font-weight: 600; color: var(--rsp-chu-chinh); }
        .val-rule-desc { font-size: 11.5px; color: var(--rsp-chu-phu); margin-top: 3px; line-height: 1.5; }

        .val-switch { position: relative; width: 38px; height: 21px; flex-shrink: 0; }
        .val-switch input { opacity: 0; width: 0; height: 0; }
        .val-switch-track {
          position: absolute; inset: 0; background: var(--rsp-vien); border-radius: 999px; cursor: pointer;
          transition: background 0.15s ease;
        }
        .val-switch-track::before {
          content: ""; position: absolute; width: 15px; height: 15px; left: 3px; top: 3px;
          background: var(--rsp-trang); border-radius: 50%; transition: transform 0.15s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        .val-switch input:checked + .val-switch-track { background: var(--rsp-cam); }
        .val-switch input:checked + .val-switch-track::before { transform: translateX(17px); }

        .val-add-rule-btn {
          width: 100%;
          margin-top: 14px;
          border: 1.5px dashed var(--rsp-vien);
          background: transparent;
          color: var(--rsp-chu-phu);
          border-radius: 8px;
          padding: 9px;
          font-size: 12.5px;
          font-weight: 600;
        }
        .val-add-rule-btn:hover { background: var(--rsp-nen-xam); color: var(--rsp-chu-chinh); }

        .val-locked-card {
          background: var(--rsp-den);
          color: #e7e2db;
          border-radius: var(--rsp-radius-lg);
          padding: 16px 18px;
          display: flex;
          gap: 12px;
        }
        .val-locked-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(224, 97, 29, 0.2); color: var(--rsp-cam);
          display: flex; align-items: center; justify-content: center;
        }
        .val-locked-title { font-size: 12.5px; font-weight: 700; color: var(--rsp-trang); margin-bottom: 4px; }
        .val-locked-text { font-size: 11.5px; line-height: 1.6; color: #b7b0a8; margin: 0; }

        .val-overlay {
          position: fixed; inset: 0; background: rgba(20, 17, 14, 0.45);
          display: flex; justify-content: flex-end; z-index: 50;
        }
        .val-panel {
          width: 460px; max-width: 100%; height: 100%; background: var(--rsp-trang);
          overflow-y: auto; padding: 22px 24px 40px; box-shadow: -8px 0 24px rgba(0,0,0,0.15);
        }
        .val-panel-header {
          display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px;
        }
        .val-panel-id { font-size: 11px; color: var(--rsp-chu-phu); font-weight: 600; }
        .val-panel-close {
          border: none; background: var(--rsp-nen-xam); border-radius: 8px; width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center; color: var(--rsp-chu-chinh); flex-shrink: 0;
        }
        .val-panel-close:hover { background: var(--rsp-vien); }
        .val-panel-desc { font-size: 15px; font-weight: 700; color: var(--rsp-chu-chinh); margin: 6px 0 4px; line-height: 1.4; }
        .val-panel-meta { font-size: 12px; color: var(--rsp-chu-phu); margin-bottom: 18px; }

        .val-panel-section-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--rsp-chu-phu); margin: 22px 0 10px;
        }

        .val-diff-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .val-diff-table th {
          text-align: left; font-size: 10.5px; text-transform: uppercase; color: var(--rsp-chu-phu);
          padding: 6px 8px; border-bottom: 1px solid var(--rsp-vien);
        }
        .val-diff-table td { padding: 8px; border-bottom: 1px solid var(--rsp-vien); vertical-align: top; }
        .val-diff-key { font-weight: 600; color: var(--rsp-chu-chinh); white-space: nowrap; }
        .val-diff-old { color: var(--rsp-do); text-decoration: line-through; background: var(--rsp-do-nen); border-radius: 5px; }
        .val-diff-new { color: var(--rsp-xanh-la); background: var(--rsp-xanh-la-nen); border-radius: 5px; }
        .val-diff-same { color: var(--rsp-chu-phu); }

        .val-timeline { display: flex; flex-direction: column; }
        .val-timeline-item { display: flex; gap: 12px; position: relative; padding-bottom: 20px; }
        .val-timeline-item:last-child { padding-bottom: 0; }
        .val-timeline-dot {
          width: 10px; height: 10px; border-radius: 50%; background: var(--rsp-cam); margin-top: 4px; flex-shrink: 0;
          position: relative; z-index: 1;
        }
        .val-timeline-line {
          position: absolute; left: 4.5px; top: 14px; bottom: 0; width: 1.5px; background: var(--rsp-vien);
        }
        .val-timeline-time { font-size: 11px; color: var(--rsp-chu-phu); font-weight: 600; }
        .val-timeline-action { font-size: 13px; font-weight: 600; color: var(--rsp-chu-chinh); margin-top: 2px; }
        .val-timeline-person { font-size: 11.5px; color: var(--rsp-chu-phu); margin-top: 1px; }

        .val-panel-locked {
          margin-top: 24px;
          display: flex; gap: 10px; align-items: flex-start;
          background: var(--rsp-nen-xam); border-radius: 10px; padding: 12px 14px;
          font-size: 11.5px; color: var(--rsp-chu-phu); line-height: 1.6;
        }
        .val-panel-locked strong { color: var(--rsp-chu-chinh); }

        @media (max-width: 1100px) {
          .val-body-grid { grid-template-columns: 1fr; }
          .val-log-row { grid-template-columns: 110px 1fr 90px 26px; }
          .val-log-row > :nth-child(3) { display: none; }
        }
      `}</style>

      
        <div style={{
          padding:"30px 34px 60px", background: '#f7f5f2'
        }}>


<PageHeading
  eyebrow="AUDIT & SECURITY"
  title="Nhật ký hoạt động"
  description="Theo dõi các thay đổi và hành động trong hệ thống."
/>
            <div className="val-page-header">
              <div>
                <div className="eyebrow">Quản trị hệ thống</div>
                <h1 className="val-title">Nhật ký hệ thống (Audit Logs)</h1>
                <p className="description">
                  Toàn bộ thao tác quan trọng trong nhà hàng được ghi lại tự động và không thể thay đổi.
                </p>
              </div>
            </div>

            <div className="val-permission-banner">
              <div className="val-permission-group val-permission-group--ok">
                <strong>✅ Được phép:</strong>
                <span className="val-permission-chip">Lọc nâng cao</span>
                <span className="val-permission-chip">Xem chi tiết / JSON Diff</span>
                <span className="val-permission-chip">Xuất Excel / PDF / CSV</span>
                <span className="val-permission-chip">Cấu hình cảnh báo bất thường</span>
              </div>
              <div className="val-permission-group val-permission-group--no">
                <strong>🚫 Không được phép:</strong>
                <span className="val-permission-chip">Sửa nhật ký</span>
                <span className="val-permission-chip">Xoá nhật ký</span>
              </div>
            </div>

            <div className="val-filter-card">
              <div className="val-filter-row">
                <div className="val-filter-field">
                  <label className="val-filter-label">Khung thời gian</label>
                  <select
                    className="val-select"
                    value={khungThoiGian}
                    onChange={(e) => setKhungThoiGian(e.target.value)}
                  >
                    <option value="hom-nay">Hôm nay</option>
                    <option value="7-ngay">7 ngày qua</option>
                    <option value="30-ngay">30 ngày qua</option>
                    <option value="tuy-chinh">Tuỳ chỉnh...</option>
                  </select>
                </div>

                <div className="val-filter-field">
                  <label className="val-filter-label">Nhân viên thực hiện</label>
                  <select
                    className="val-select"
                    value={nhanVienDangChon}
                    onChange={(e) => setNhanVienDangChon(e.target.value)}
                  >
                    <option value="tat-ca">Tất cả nhân viên</option>
                    {CAC_NHAN_VIEN.map((nv) => (
                      <option key={nv} value={nv}>
                        {nv}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="val-filter-field">
                  <label className="val-filter-label">Đối tượng</label>
                  <select
                    className="val-select"
                    value={doiTuongDangChon}
                    onChange={(e) => setDoiTuongDangChon(e.target.value as "tat-ca" | DoiTuongLog)}
                  >
                    <option value="tat-ca">Tất cả đối tượng</option>
                    <option value="hoa-don">Đơn hàng / Hoá đơn (Bills)</option>
                    <option value="thanh-toan">Thanh toán (Payments)</option>
                    <option value="kho">Kho hàng (Inventory)</option>
                    <option value="he-thong">Hệ thống</option>
                  </select>
                </div>

                <div className="val-filter-field val-filter-search">
                  <label className="val-filter-label">Tìm kiếm</label>
                  <div className="rsp-search dhtt-search">
                    <IconSearch />
                    <input
                      type="text"
                      placeholder="Tìm theo mã log hoặc mô tả..."
                      value={tuKhoa}
                      onChange={(e) => setTuKhoa(e.target.value)}
                    />
                  </div>
                </div>

                <button className="val-reset-btn" onClick={datLaiBoLoc}>
                  Đặt lại bộ lọc
                </button>
              </div>

              <div className="val-chip-row">
                {CAC_LOAI_HANH_DONG.map((loai) => (
                  <button
                    key={loai}
                    className={`val-chip${loaiDangChon.has(loai) ? " val-chip--active" : ""}`}
                    onClick={() => toggleLoaiHanhDong(loai)}
                  >
                    {NHAN_HANH_DONG[loai]}
                  </button>
                ))}
              </div>
            </div>

            <div className="val-body-grid">
              <div>
                <div className="val-log-toolbar">
                  <span className="val-log-count">
                    {chiXemNhomBatThuong && (
                      <button
                        className="val-chip val-chip--active"
                        onClick={() => setChiXemNhomBatThuong(null)}
                        style={{ marginRight: 10 }}
                      >
                        Đang lọc theo cảnh báo bất thường ✕
                      </button>
                    )}
                    Tìm thấy {nhatKyDaLoc.length} bản ghi
                  </span>
                  <div className="val-export-group">
                    {dangXuat && <span className="val-export-status">{dangXuat}</span>}
                    <button className="val-export-btn" onClick={() => xuatBaoCao("Excel")}>
                      <IconDownload /> Excel
                    </button>
                    <button className="val-export-btn" onClick={() => xuatBaoCao("PDF")}>
                      <IconDownload /> PDF
                    </button>
                    <button className="val-export-btn" onClick={() => xuatBaoCao("CSV mã hoá")}>
                      <IconDownload /> CSV mã hoá
                    </button>
                  </div>
                </div>

                <div className="rsp-table-card">
                  {nhatKyDaLoc.map((log) => (
                    <button key={log.id} className="val-log-row" onClick={() => setLogDangXem(log)}>
                      <span className="val-log-time">{log.thoiGian}</span>
                      <span className="val-log-person">
                        <span
                          className="rsp-avatar rsp-avatar--table"
                          style={{ width: 28, height: 28, fontSize: 11 }}
                        >
                          {log.viTat}
                        </span>
                        <span>
                          <span className="val-log-person-name">{log.nhanVien}</span>
                          <br />
                          <span className="val-log-person-role">{log.vaiTro}</span>
                        </span>
                      </span>
                      <span>
                        <span className={`val-badge ${MAU_MUC_DO[log.mucDoRuiRo]}`}>
                          {NHAN_HANH_DONG[log.loaiHanhDong]}
                        </span>
                      </span>
                      <span className="val-log-desc">{log.moTa}</span>
                      <span className={`val-badge ${MAU_MUC_DO[log.mucDoRuiRo]}`}>
                        {NHAN_MUC_DO[log.mucDoRuiRo]}
                      </span>
                      <span className="val-log-chevron">
                        <IconChevronRight />
                      </span>
                    </button>
                  ))}
                  {nhatKyDaLoc.length === 0 && (
                    <div className="val-empty">Không có bản ghi nào khớp với bộ lọc hiện tại.</div>
                  )}
                </div>
              </div>

              <div className="val-side-col">
                <div className="val-anomaly-card">
                  <div className="val-anomaly-title">
                    <IconAlertTriangle /> Cảnh báo bất thường
                  </div>
                  <div className="val-anomaly-sub">Tự động phát hiện chuỗi hành động đáng ngờ.</div>

                  <div className="val-alert-banner">
                    <span className="val-alert-banner-icon">
                      <IconAlertTriangle />
                    </span>
                    <div>
                      <strong>Hùng (Quản lý)</strong> đã Duyệt hoàn tiền{" "}
                      <strong>5 lần trong 10 phút</strong> (20:05 – 20:09) — có thể là dấu hiệu gian lận nội
                      bộ.
                      <br />
                      <button onClick={() => setChiXemNhomBatThuong("hoan-tien-lien-tuc")}>
                        Xem 5 bản ghi liên quan
                      </button>
                    </div>
                  </div>

                  {quyTac.map((q) => (
                    <div className="val-rule-row" key={q.id}>
                      <div>
                        <div className="val-rule-name">{q.ten}</div>
                        <div className="val-rule-desc">{q.moTa}</div>
                      </div>
                      <label className="val-switch">
                        <input type="checkbox" checked={q.batTat} onChange={() => toggleQuyTac(q.id)} />
                        <span className="val-switch-track" />
                      </label>
                    </div>
                  ))}

                  <button className="val-add-rule-btn" onClick={themQuyTacMoi}>
                    + Thêm quy tắc cảnh báo mới
                  </button>
                </div>

                <div className="val-locked-card">
                  <span className="val-locked-icon">
                    <IconLock />
                  </span>
                  <div>
                    <div className="val-locked-title">Nhật ký không thể chỉnh sửa</div>
                    <p className="val-locked-text">
                      Để đảm bảo tính toàn vẹn dữ liệu, <strong style={{ color: "#fff" }}>không ai</strong>{" "}
                      — kể cả Quản trị viên — có quyền Sửa hoặc Xoá bản ghi nhật ký đã được ghi nhận.
                    </p>
                  </div>
                </div>
              </div>
            </div>
         

      {logDangXem && (
        <div className="val-overlay" onClick={() => setLogDangXem(null)}>
          <div className="val-panel" onClick={(e) => e.stopPropagation()}>
            <div className="val-panel-header">
              <span className="val-panel-id">{logDangXem.id}</span>
              <button className="val-panel-close" onClick={() => setLogDangXem(null)} aria-label="Đóng">
                <IconClose />
              </button>
            </div>
            <div className="val-panel-desc">{logDangXem.moTa}</div>
            <div className="val-panel-meta">
              {logDangXem.thoiGian} · {logDangXem.nhanVien} ({logDangXem.vaiTro}) ·{" "}
              {NHAN_DOI_TUONG[logDangXem.doiTuong]}
            </div>
            <span className={`val-badge ${MAU_MUC_DO[logDangXem.mucDoRuiRo]}`}>
              {NHAN_MUC_DO[logDangXem.mucDoRuiRo]}
            </span>

            {logDangXem.duLieuTruoc && logDangXem.duLieuSau && (
              <>
                <div className="val-panel-section-title">Chi tiết thay đổi (JSON Diff)</div>
                <table className="val-diff-table">
                  <thead>
                    <tr>
                      <th>Trường</th>
                      <th>Trước</th>
                      <th>Sau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dinhDangJson(logDangXem.duLieuTruoc).map(([key, giaTriTruoc]) => {
                      const giaTriSau = logDangXem.duLieuSau?.[key];
                      const coThayDoi = giaTriSau !== undefined && giaTriSau !== giaTriTruoc;
                      return (
                        <tr key={key}>
                          <td className="val-diff-key">{key}</td>
                          <td className={coThayDoi ? "val-diff-old" : "val-diff-same"}>{giaTriTruoc}</td>
                          <td className={coThayDoi ? "val-diff-new" : "val-diff-same"}>{giaTriSau ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {logDangXem.chuoiSuKien && (
              <>
                <div className="val-panel-section-title">Chuỗi sự kiện liên quan</div>
                <div className="val-timeline">
                  {logDangXem.chuoiSuKien.map((sk, idx) => (
                    <div className="val-timeline-item" key={idx}>
                      {idx < (logDangXem.chuoiSuKien?.length ?? 0) - 1 && (
                        <span className="val-timeline-line" />
                      )}
                      <span className="val-timeline-dot" />
                      <div>
                        <div className="val-timeline-time">{sk.thoiGian}</div>
                        <div className="val-timeline-action">{sk.hanhDong}</div>
                        <div className="val-timeline-person">{sk.nguoiThucHien}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="val-panel-locked">
              <IconLock />
              <span>
                <strong>Bản ghi bất biến (Immutable).</strong> Đây là bản sao chỉ đọc — hệ thống không cung
                cấp bất kỳ chức năng Sửa hoặc Xoá nào cho nhật ký này, kể cả với tài khoản Admin.
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
   
  );
}
