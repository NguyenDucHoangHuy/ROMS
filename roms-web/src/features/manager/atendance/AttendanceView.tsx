// import {
//   AlertCircle,
//   CalendarDays,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardCheck,
//   Clock3,
//   Download,
//   Map,
// } from "lucide-react";

// // import PageHeading from "../layout/PageHeading";
// import PageHeading from "../common/PageHeading";
// import KPI from "../common/KPI";


// const staff = [
//   {
//     initials: "NA",
//     name: "Nguyễn Văn An",
//     role: "Phục vụ bàn",
//     in: "07:55 AM",
//     out: "04:05 PM",
//     hours: "8h 10m",
//     status: "Đúng giờ",
//     tone: "ok",
//   },
//   {
//     initials: "TB",
//     name: "Trần Thị Bích",
//     role: "Bếp chính",
//     in: "08:15 AM",
//     out: "--:-- --",
//     hours: "--",
//     status: "Đi muộn",
//     tone: "late",
//   },
//   {
//     initials: "CD",
//     name: "Lê Công Duy",
//     role: "Pha chế",
//     in: "06:50 AM",
//     out: "03:00 PM",
//     hours: "8h 10m",
//     status: "Đúng giờ",
//     tone: "ok",
//   },
//   {
//     initials: "PN",
//     name: "Phạm Hoàng Nam",
//     role: "Lễ tân",
//     in: "--:-- --",
//     out: "--:-- --",
//     hours: "0h 0m",
//     status: "Vắng mặt",
//     tone: "absent",
//   },
//   {
//     initials: "HM",
//     name: "Hoàng Minh Tâm",
//     role: "Giám sát",
//     in: "07:45 AM",
//     out: "--:-- --",
//     hours: "--",
//     status: "Đang làm",
//     tone: "ok",
//   },
// ];

// export default function AttendanceView() {
//   return (
//     <div style={{ padding: '30px 34px 60px',background: '#f7f5f2' }}>
//       <PageHeading
//         title="Chấm công & Check-in GPS"
//         description="Hôm nay: Thứ Năm, 24 Tháng 10, 2023"
//         actions={
//           <>
//             <button className="button secondary">
//               <CalendarDays /> Chọn ngày
//             </button>
//             <button className="button primary">
//               <Download /> Xuất báo cáo
//             </button>
//           </>
//         }
//       />
//       <div className="kpi-grid three">
//         <KPI
//           icon={ClipboardCheck}
//           label="Tổng nhân sự có mặt"
//           value="42"
//           detail="/ 48 nhân viên"
//           variant="green"
//         />
//         <KPI
//           icon={Clock3}
//           label="Đi muộn"
//           value="3"
//           detail="nhân viên"
//           variant="gold"
//         />
//         <KPI
//           icon={AlertCircle}
//           label="Vắng mặt"
//           value="3"
//           detail="nhân viên"
//           variant="red"
//         />
//       </div>
//       <div className="content-grid attendance-layout">
//         <section className="panel table-panel">
//           <div className="panel-header">
//             <div>
//               <h2>Bảng lương & Chấm công</h2>
//               <p>Danh sách nhân sự trong ngày</p>
//             </div>
//             <button className="select-button">
//               Tất cả ca làm việc <ChevronDown />
//             </button>
//           </div>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Nhân viên</th>
//                   <th>Giờ vào</th>
//                   <th>Giờ ra</th>
//                   <th>Tổng giờ</th>
//                   <th>Trạng thái</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {staff.map((person) => (
//                   <tr key={person.name}>
//                     <td>
//                       <div className="person">
//                         <span className="person-avatar">{person.initials}</span>
//                         <span>
//                           <b>{person.name}</b>
//                           <small>{person.role}</small>
//                         </span>
//                       </div>
//                     </td>
//                     <td className={person.tone === "late" ? "late-text" : ""}>
//                       {person.in}
//                     </td>
//                     <td>{person.out}</td>
//                     <td>{person.hours}</td>
//                     <td>
//                       <span className={`status ${person.tone}`}>
//                         {person.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="table-footer">
//             <span>Hiển thị 1-5 của 48 nhân sự</span>
//             <div className="pagination">
//               <button>
//                 <ChevronLeft />
//               </button>
//               <button className="current">1</button>
//               <button>2</button>
//               <button>
//                 <ChevronRight />
//               </button>
//             </div>
//           </div>
//         </section>
//         <section className="panel map-panel">
//           <div className="panel-header">
//             <div>
//               <h2>
//                 <Map /> Bản đồ Check-in GPS
//               </h2>
//               <p>Vị trí check-in thời gian thực</p>
//             </div>
//           </div>
//           <div className="map-placeholder">
//             <div className="map-road road-one" />
//             <div className="map-road road-two" />
//             <div className="map-water" />
//             <span className="map-pin pin-one" />
//             <span className="map-pin pin-two" />
//             <span className="map-pin pin-three" />
//             <div className="map-label">ROMS Restaurant</div>
//             <div className="zoom">
//               <button>+</button>
//               <button>−</button>
//             </div>
//           </div>
//           <div className="map-legend">
//             <span>
//               <i className="dot green-dot" /> Hợp lệ
//             </span>
//             <span>
//               <i className="dot yellow-dot" /> Sai vị trí/muộn
//             </span>
//             <span>Cập nhật 2 phút trước</span>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  Map,
  Search,
  X,
} from "lucide-react";

// import PageHeading from "../layout/PageHeading";
import PageHeading from "../common/PageHeading";
import KPI from "../common/KPI";

/* ================================================================
   Dữ liệu mẫu (demo) — trong thực tế sẽ lấy từ API backend.
   Đã mở rộng lên 14 nhân sự + thêm trường "shift" để lọc theo ca làm
   việc, và đủ dữ liệu để phân trang thực sự có nhiều hơn 1 trang.
   ================================================================ */
const staff = [
  {
    initials: "NA",
    name: "Nguyễn Văn An",
    role: "Phục vụ bàn",
    shift: "sang",
    in: "07:55 AM",
    out: "04:05 PM",
    hours: "8h 10m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "TB",
    name: "Trần Thị Bích",
    role: "Bếp chính",
    shift: "sang",
    in: "08:15 AM",
    out: "--:-- --",
    hours: "--",
    status: "Đi muộn",
    tone: "late",
  },
  {
    initials: "CD",
    name: "Lê Công Duy",
    role: "Pha chế",
    shift: "sang",
    in: "06:50 AM",
    out: "03:00 PM",
    hours: "8h 10m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "PN",
    name: "Phạm Hoàng Nam",
    role: "Lễ tân",
    shift: "chieu",
    in: "--:-- --",
    out: "--:-- --",
    hours: "0h 0m",
    status: "Vắng mặt",
    tone: "absent",
  },
  {
    initials: "HM",
    name: "Hoàng Minh Tâm",
    role: "Giám sát",
    shift: "sang",
    in: "07:45 AM",
    out: "--:-- --",
    hours: "--",
    status: "Đang làm",
    tone: "ok",
  },
  {
    initials: "TL",
    name: "Trịnh Thị Lài",
    role: "Phục vụ bàn",
    shift: "chieu",
    in: "01:55 PM",
    out: "10:05 PM",
    hours: "8h 10m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "VQ",
    name: "Võ Minh Quân",
    role: "Bếp phụ",
    shift: "chieu",
    in: "02:20 PM",
    out: "--:-- --",
    hours: "--",
    status: "Đi muộn",
    tone: "late",
  },
  {
    initials: "DH",
    name: "Đặng Thu Hà",
    role: "Pha chế",
    shift: "gay",
    in: "10:05 AM",
    out: "02:00 PM",
    hours: "3h 55m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "NB",
    name: "Ngô Thanh Bình",
    role: "Thu ngân",
    shift: "sang",
    in: "07:58 AM",
    out: "04:02 PM",
    hours: "8h 04m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "LT",
    name: "Lý Anh Tuấn",
    role: "Bảo vệ",
    shift: "gay",
    in: "--:-- --",
    out: "--:-- --",
    hours: "0h 0m",
    status: "Vắng mặt",
    tone: "absent",
  },
  {
    initials: "PH",
    name: "Phan Thị Huệ",
    role: "Phục vụ bàn",
    shift: "chieu",
    in: "02:00 PM",
    out: "10:10 PM",
    hours: "8h 10m",
    status: "Đúng giờ",
    tone: "ok",
  },
  {
    initials: "DK",
    name: "Đỗ Văn Khoa",
    role: "Bếp chính",
    shift: "sang",
    in: "06:45 AM",
    out: "--:-- --",
    hours: "--",
    status: "Đang làm",
    tone: "ok",
  },
  {
    initials: "MT",
    name: "Mai Thị Trang",
    role: "Lễ tân",
    shift: "sang",
    in: "08:20 AM",
    out: "04:15 PM",
    hours: "7h 55m",
    status: "Đi muộn",
    tone: "late",
  },
  {
    initials: "QK",
    name: "Quách Bảo Khánh",
    role: "Giám sát",
    shift: "gay",
    in: "10:00 AM",
    out: "--:-- --",
    hours: "--",
    status: "Đang làm",
    tone: "ok",
  },
];

type CaLamViec =
  | "tat-ca"
  | "sang"
  | "chieu"
  | "gay";

const SO_DONG_MOI_TRANG = 5;
const TONG_SO_NHAN_SU_CONG_TY = 48; // tổng toàn nhà hàng (dùng cho KPI, khác với size mock ở trên)

const TUY_CHON_CA_LAM_VIEC = [
  { key: "tat-ca", label: "Tất cả ca làm việc" },
  { key: "sang", label: "Ca sáng (06:00 - 14:00)" },
  { key: "chieu", label: "Ca chiều (14:00 - 22:00)" },
  { key: "gay", label: "Ca gãy (linh hoạt)" },
]satisfies { key: CaLamViec; label: string }[];

/* Toạ độ khu vực 470 Trần Đại Nghĩa, Ngũ Hành Sơn, Đà Nẵng (VKU) */
const VI_TRI_NHA_HANG = { lat: 15.9739, lon: 108.2531 };
const BBOX_BAN_DO = "108.2461,15.9669,108.2601,15.9809"; // vùng hiển thị quanh vị trí trên
const OSM_EMBED_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX_BAN_DO}&layer=mapnik&marker=${VI_TRI_NHA_HANG.lat}%2C${VI_TRI_NHA_HANG.lon}`;
const OSM_XEM_LON_HON = `https://www.openstreetmap.org/?mlat=${VI_TRI_NHA_HANG.lat}&mlon=${VI_TRI_NHA_HANG.lon}#map=17/${VI_TRI_NHA_HANG.lat}/${VI_TRI_NHA_HANG.lon}`;

const TEN_THU = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function dinhDangNgayDayDu(date: Date) {
  return `${TEN_THU[date.getDay()]}, ${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

/** Sinh lưới ngày (6 hàng x 7 cột, bắt đầu từ Thứ Hai) cho 1 tháng bất kỳ */
function taoLuoiNgay(thangHienThi: Date) : Date[]{
  const nam = thangHienThi.getFullYear();
  const thang = thangHienThi.getMonth();
  const ngayDauThang = new Date(nam, thang, 1);
  // Chuyển getDay() (0=CN) sang hệ Thứ Hai đứng đầu tuần
  const lechDau = (ngayDauThang.getDay() + 6) % 7;
  const ngayBatDauLuoi = new Date(nam, thang, 1 - lechDau);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(ngayBatDauLuoi);
    d.setDate(ngayBatDauLuoi.getDate() + i);
    return d;
  });
}

function cungNgay(a: Date, b: Date): boolean  {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AttendanceView() {
  const [ngayDaChon, setNgayDaChon] = useState(() => new Date(2023, 9, 24));
  const [thangHienThiLich, setThangHienThiLich] = useState(() => new Date(2023, 9, 1));
  const [moLich, setMoLich] = useState(false);

  // const [caDangChon, setCaDangChon] = useState("tat-ca");
  const [caDangChon, setCaDangChon] = useState<CaLamViec>("tat-ca");

  const [moDropdownCa, setMoDropdownCa] = useState(false);

  const [tuKhoa, setTuKhoa] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);

  // const [trangThaiXuat, setTrangThaiXuat] = useState(null);
  const [trangThaiXuat, setTrangThaiXuat] =
  useState<"dang-xuat" | "da-xuat" | null>(null);

  // const lichRef = useRef(null);
  // const dropdownCaRef = useRef(null);
  const lichRef = useRef<HTMLDivElement | null>(null);
  const dropdownCaRef = useRef<HTMLDivElement | null>(null);

  // Đóng popover lịch / dropdown ca khi bấm ra ngoài
  useEffect(() => {
    // function xuLyClickNgoai(e: MouseEvent) {
    //   if (lichRef.current && !lichRef.current.contains(e.target)) setMoLich(false);
    //   if (dropdownCaRef.current && !dropdownCaRef.current.contains(e.target)) setMoDropdownCa(false);
    // }
    function xuLyClickNgoai(e: MouseEvent) {
      const target = e.target as Node;

      if (
        lichRef.current &&
        !lichRef.current.contains(target)
      ) {
        setMoLich(false);
      }

      if (
        dropdownCaRef.current &&
        !dropdownCaRef.current.contains(target)
      ) {
        setMoDropdownCa(false);
      }
    }
    document.addEventListener("mousedown", xuLyClickNgoai);
    return () => document.removeEventListener("mousedown", xuLyClickNgoai);
  }, []);

  const danhSachDaLoc = useMemo(() => {
    const tk = tuKhoa.trim().toLowerCase();
    return staff.filter((p) => {
      const khopCa = caDangChon === "tat-ca" || p.shift === caDangChon;
      const khopTuKhoa = !tk || p.name.toLowerCase().includes(tk) || p.role.toLowerCase().includes(tk);
      return khopCa && khopTuKhoa;
    });
  }, [caDangChon, tuKhoa]);

  const tongSoTrang = Math.max(1, Math.ceil(danhSachDaLoc.length / SO_DONG_MOI_TRANG));
  const trangAnToan = Math.min(trangHienTai, tongSoTrang);
  const duLieuTrangHienTai = danhSachDaLoc.slice(
    (trangAnToan - 1) * SO_DONG_MOI_TRANG,
    trangAnToan * SO_DONG_MOI_TRANG
  );

  const dongBatDau = danhSachDaLoc.length === 0 ? 0 : (trangAnToan - 1) * SO_DONG_MOI_TRANG + 1;
  const dongKetThuc = Math.min(trangAnToan * SO_DONG_MOI_TRANG, danhSachDaLoc.length);

  const doiTrang = (soTrang: number) => {
    setTrangHienTai(Math.min(Math.max(1, soTrang), tongSoTrang));
  };

  const chonNgay = (d: Date) => {
    setNgayDaChon(d);
    setMoLich(false);
  };

  const doiThang = (delta: number) => {
    setThangHienThiLich((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const moLichVaCanChinhThang = () => {
    setThangHienThiLich(new Date(ngayDaChon.getFullYear(), ngayDaChon.getMonth(), 1));
    setMoLich((v) => !v);
  };

  
  const chonCaLamViec = (key: CaLamViec) => {
    setCaDangChon(key);
    setTrangHienTai(1);
    setMoDropdownCa(false);
  };

  /** Xuất báo cáo CSV thật — tải file về máy dựa trên dữ liệu đang được lọc */
  const xuatBaoCao = () => {
    setTrangThaiXuat("dang-xuat");
  

    window.setTimeout(() => {
      const dongTieuDe = ["Họ tên", "Vai trò", "Giờ vào", "Giờ ra", "Tổng giờ", "Trạng thái"];
      const dongDuLieu = danhSachDaLoc.map((p) => [p.name, p.role, p.in, p.out, p.hours, p.status]);
      const noiDungCsv = [dongTieuDe, ...dongDuLieu]
        .map((dong) => dong.map((o) => `"${String(o).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      // Thêm BOM để Excel hiển thị đúng tiếng Việt có dấu
      const blob = new Blob(["\uFEFF" + noiDungCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cham-cong-${ngayDaChon.getFullYear()}-${String(ngayDaChon.getMonth() + 1).padStart(2, "0")}-${String(ngayDaChon.getDate()).padStart(2, "0")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setTrangThaiXuat("da-xuat");
      window.setTimeout(() => setTrangThaiXuat(null), 2500);
    }, 500);
  };

  const luoiNgayLich = useMemo(() => taoLuoiNgay(thangHienThiLich), [thangHienThiLich]);
  const nhanCaHienTai =
    TUY_CHON_CA_LAM_VIEC.find((t) => t.key === caDangChon)?.label ?? "Tất cả ca làm việc";

  return (
    <div style={{ padding: "30px 34px 60px" , background: '#f7f5f2'}}>
      {/* ==========================================================
          CSS cho các phần tương tác mới thêm (lịch, dropdown ca, ô
          tìm kiếm, bản đồ thật) — viết trực tiếp trong file này.
          ========================================================== */}
      <style>{`
        .av-date-wrap, .av-dropdown-wrap { position: relative; display: inline-block; }

        .av-calendar-popover {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 40;
          width: 280px; background: #fff; border: 1px solid #e5e1da;
          border-radius: 14px; box-shadow: 0 12px 28px rgba(20,17,14,0.16);
          padding: 14px;
        }
        .av-calendar-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
        }
        .av-calendar-header button {
          border: none; background: #f4efe8; width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; color: #1a1714; cursor: pointer;
        }
        .av-calendar-header button:hover { background: #ece4d8; }
        .av-calendar-title { font-size: 13.5px; font-weight: 700; color: #1a1714; }
        .av-calendar-weekdays, .av-calendar-days {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center;
        }
        .av-calendar-weekdays span { font-size: 10.5px; font-weight: 700; color: #9a938a; padding: 4px 0; }
        .av-calendar-day {
          border: none; background: transparent; width: 100%; aspect-ratio: 1; border-radius: 8px;
          font-size: 12.5px; color: #1a1714; cursor: pointer;
        }
        .av-calendar-day:hover { background: #f4efe8; }
        .av-calendar-day--khac-thang { color: #cbc4ba; }
        .av-calendar-day--hom-nay { font-weight: 700; color: #d2620f; }
        .av-calendar-day--dang-chon { background: #d2620f; color: #fff; font-weight: 700; }
        .av-calendar-day--dang-chon:hover { background: #b8530c; }
        .av-calendar-footer {
          margin-top: 10px; padding-top: 10px; border-top: 1px solid #efe9e1;
          font-size: 11px; color: #9a938a; text-align: center;
        }

        .av-dropdown-menu {
          position: absolute; top: calc(100% + 6px); left: 0; z-index: 40; min-width: 230px;
          background: #fff; border: 1px solid #e5e1da; border-radius: 12px;
          box-shadow: 0 12px 28px rgba(20,17,14,0.16); padding: 6px; text-align: left;
        }
        .av-dropdown-item {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
          border: none; background: transparent; padding: 9px 10px; border-radius: 8px;
          font-size: 13px; color: #1a1714; cursor: pointer; text-align: left;
        }
        .av-dropdown-item:hover { background: #f4efe8; }
        .av-dropdown-item--active { font-weight: 700; color: #d2620f; }

        .av-search-box {
          display: flex; align-items: center; gap: 8px; background: #f4efe8;
          border: 1px solid #e5e1da; border-radius: 10px; padding: 8px 12px; min-width: 220px;
        }
        .av-search-box input { border: none; background: transparent; outline: none; font-size: 13px; width: 100%; color: #1a1714; }
        .av-search-box svg { color: #9a938a; flex-shrink: 0; }

        .av-export-status { font-size: 12px; font-weight: 600; color: #d2620f; margin-right: 8px; align-self: center; }

        .av-map-frame {
          width: 100%; height: 100%; min-height: 260px; border: 0; display: block; border-radius: 0 0 16px 16px;
        }
        .av-map-address {
          position: absolute; left: 12px; bottom: 12px; background: rgba(26,23,20,0.85); color: #fff;
          font-size: 11.5px; padding: 7px 12px; border-radius: 8px; max-width: 80%; line-height: 1.4;
        }
        .av-map-open-link {
          position: absolute; right: 12px; top: 12px; display: inline-flex; align-items: center; gap: 5px;
          background: #fff; border-radius: 8px; padding: 6px 10px; font-size: 11.5px; font-weight: 600;
          color: #1a1714; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .av-map-open-link:hover { background: #f4efe8; }
        .av-map-wrap { position: relative; }

        .av-pagination-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <PageHeading
        title="Chấm công & Check-in GPS"
        description={`Ngày xem: ${dinhDangNgayDayDu(ngayDaChon)}`}
        actions={
          <>
            <div className="av-date-wrap" ref={lichRef}>
              <button className="button secondary" onClick={moLichVaCanChinhThang}>
                <CalendarDays /> Chọn ngày
              </button>

              {moLich && (
                <div className="av-calendar-popover">
                  <div className="av-calendar-header">
                    <button onClick={() => doiThang(-1)} aria-label="Tháng trước">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="av-calendar-title">
                      Tháng {thangHienThiLich.getMonth() + 1} / {thangHienThiLich.getFullYear()}
                    </span>
                    <button onClick={() => doiThang(1)} aria-label="Tháng sau">
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="av-calendar-weekdays">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>

                  <div className="av-calendar-days">
                    {luoiNgayLich.map((d, idx) => {
                      const khacThang = d.getMonth() !== thangHienThiLich.getMonth();
                      const laHomNay = cungNgay(d, new Date());
                      const dangChon = cungNgay(d, ngayDaChon);
                      return (
                        <button
                          key={idx}
                          className={[
                            "av-calendar-day",
                            khacThang ? "av-calendar-day--khac-thang" : "",
                            laHomNay && !dangChon ? "av-calendar-day--hom-nay" : "",
                            dangChon ? "av-calendar-day--dang-chon" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => chonNgay(d)}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="av-calendar-footer">Chọn 1 ngày để xem dữ liệu chấm công</div>
                </div>
              )}
            </div>

            <button className="button primary" onClick={xuatBaoCao} disabled={trangThaiXuat === "dang-xuat"}>
              {trangThaiXuat === "da-xuat" ? <Check /> : <Download />}
              {trangThaiXuat === "dang-xuat"
                ? "Đang xuất..."
                : trangThaiXuat === "da-xuat"
                ? "Đã xuất file"
                : "Xuất báo cáo"}
            </button>
          </>
        }
      />

      <div className="kpi-grid three">
        <KPI
          icon={ClipboardCheck}
          label="Tổng nhân sự có mặt"
          value={String(staff.filter((p) => p.tone !== "absent").length)}
          detail={`/ ${TONG_SO_NHAN_SU_CONG_TY} nhân viên`}
          variant="green"
        />
        <KPI
          icon={Clock3}
          label="Đi muộn"
          value={String(staff.filter((p) => p.tone === "late").length)}
          detail="nhân viên"
          variant="gold"
        />
        <KPI
          icon={AlertCircle}
          label="Vắng mặt"
          value={String(staff.filter((p) => p.tone === "absent").length)}
          detail="nhân viên"
          variant="red"
        />
      </div>

      <div className="content-grid attendance-layout">
        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <h2>Bảng lương & Chấm công</h2>
              <p>Danh sách nhân sự trong ngày</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="av-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc vai trò..."
                  value={tuKhoa}
                  onChange={(e) => {
                    setTuKhoa(e.target.value);
                    setTrangHienTai(1);
                  }}
                />
                {tuKhoa && (
                  <button
                    onClick={() => setTuKhoa("")}
                    style={{ border: "none", background: "transparent", display: "flex", cursor: "pointer" }}
                    aria-label="Xoá tìm kiếm"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="av-dropdown-wrap" ref={dropdownCaRef}>
                <button className="select-button" onClick={() => setMoDropdownCa((v) => !v)}>
                  {nhanCaHienTai} <ChevronDown />
                </button>
                {moDropdownCa && (
                  <div className="av-dropdown-menu">
                    {TUY_CHON_CA_LAM_VIEC.map((t) => (
                      <button
                        key={t.key}
                        className={`av-dropdown-item${caDangChon === t.key ? " av-dropdown-item--active" : ""}`}
                        onClick={() => chonCaLamViec(t.key)}
                      >
                        {t.label}
                        {caDangChon === t.key && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th>Tổng giờ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {duLieuTrangHienTai.map((person) => (
                  <tr key={person.name}>
                    <td>
                      <div className="person">
                        <span className="person-avatar">{person.initials}</span>
                        <span>
                          <b>{person.name}</b>
                          <small>{person.role}</small>
                        </span>
                      </div>
                    </td>
                    <td className={person.tone === "late" ? "late-text" : ""}>{person.in}</td>
                    <td>{person.out}</td>
                    <td>{person.hours}</td>
                    <td>
                      <span className={`status ${person.tone}`}>{person.status}</span>
                    </td>
                  </tr>
                ))}
                {duLieuTrangHienTai.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "26px 0", color: "#9a938a" }}>
                      Không tìm thấy nhân sự phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              {danhSachDaLoc.length === 0
                ? "Không có kết quả"
                : `Hiển thị ${dongBatDau}-${dongKetThuc} của ${danhSachDaLoc.length} nhân sự`}
            </span>
            <div className="pagination">
              <button
                className="av-pagination-btn"
                onClick={() => doiTrang(trangAnToan - 1)}
                disabled={trangAnToan <= 1}
              >
                <ChevronLeft />
              </button>
              {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map((so) => (
                <button
                  key={so}
                  className={so === trangAnToan ? "current" : ""}
                  onClick={() => doiTrang(so)}
                >
                  {so}
                </button>
              ))}
              <button
                className="av-pagination-btn"
                onClick={() => doiTrang(trangAnToan + 1)}
                disabled={trangAnToan >= tongSoTrang}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>

        <section className="panel map-panel">
          <div className="panel-header">
            <div>
              <h2>
                <Map /> Bản đồ Check-in GPS
              </h2>
              <p>Vị trí check-in thời gian thực</p>
            </div>
          </div>

          <div className="av-map-wrap" style={{ flex: 1, minHeight: 260 }}>
            <iframe
              title="Bản đồ Check-in GPS - 470 Trần Đại Nghĩa, Đà Nẵng"
              className="av-map-frame"
              src={OSM_EMBED_SRC}
              loading="lazy"
            />
            <a className="av-map-open-link" href={OSM_XEM_LON_HON} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} /> Xem lớn hơn
            </a>
            <div className="av-map-address">
              📍 ROMS Restaurant — 470 Trần Đại Nghĩa, Ngũ Hành Sơn, Đà Nẵng
            </div>
          </div>

          <div className="map-legend">
            <span>
              <i className="dot green-dot" /> Hợp lệ
            </span>
            <span>
              <i className="dot yellow-dot" /> Sai vị trí/muộn
            </span>
            <span>Cập nhật 2 phút trước</span>
          </div>
        </section>
      </div>
    </div>
  );
}
