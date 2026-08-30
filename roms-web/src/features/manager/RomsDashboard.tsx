"use client";

import OverviewView from "../manager/overview/OverviewView";
import AttendanceView from "../manager/atendance/AttendanceView";
import InventoryView from "../manager/inventory/InventoryView";
import SuppliersView from "../manager/suppliers/SuppliersView";
import LeaveView from "../manager/leave-request-approval/LeaveView";
import ScheduleView from "../manager/staffs-manage/ScheduleView";
import EmployeesView from "../manager/hr/EmployeesView";
import MenuView from "../manager/menu/MenuView";
import FloorMapView from "../manager/floor-map/FloorMapView";
import OrdersView from "../manager/orders-billing/OrdersView";
import PeopleView from "../manager/staffs-manage/PeopleView";

import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  CircleHelp,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  Store,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import AiAnalyticsView from "../manager/analytics/AnalyticsDashboard";

const navGroups = [
  {
    label: "VẬN HÀNH",
    items: [
      ["Tổng quan", LayoutDashboard],
      ["Sơ đồ bàn", Map],
      ["Quản lý thực đơn", Utensils],
      ["Bếp & Đơn hàng", ShoppingBasket],
      ["Đơn hàng & Thanh toán", WalletCards],
      ["Quản lý nhân sự", Users],
      ["Quản lý hồ sơ nhân viên", Users],
      ["Chấm công & Check-in GPS", ClipboardCheck],
      ["Kho nguyên liệu", Package],
      ["Nhà cung cấp", Store],
      ["Duyệt nghỉ phép", FileClock],
      ["Lịch phân ca", CalendarDays],
      ["Phân tích AI", Sparkles],
    ],
  },
  {
    label: "QUẢN TRỊ",
    items: [
      ["Cấu hình hệ thống", Settings],
      ["Quản lý người dùng", Users],
      ["Nhật ký hoạt động", FileClock],
    ],
  },
] as const;

type ViewKey = (typeof navGroups)[number]["items"][number][0];


function Sidebar({
  active,
  onChange,
  open,
  onClose,
}: {
  active: ViewKey;
  onChange: (view: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Utensils />
          </div>
          <div>
            <strong>ROMS</strong>
            <span>Phần mềm quản trị</span>
          </div>
        </div>
        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([label, Icon]) => (
                <button
                  key={label}
                  onClick={() => {
                    onChange(label);
                    onClose();
                  }}
                  className={`nav-item ${active === label ? "active" : ""}`}
                >
                  <Icon /> <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <CircleHelp />
            <span>Trợ giúp</span>
          </button>
          <button className="nav-item">
            <LogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="topbar">
      <div className="mobile-menu">
        <button aria-label="Mở menu" onClick={onMenu}>
          <Menu />
        </button>
      </div>
      <div className="topbar-title">Hệ thống Quản lý ROMS</div>
      <div className="topbar-actions">
        <label className="search">
          <Search />
          <input placeholder="Tìm kiếm nhân viên, ca làm..." />
        </label>
        <button className="icon-button" aria-label="Thông báo">
          <Bell />
          <i />
        </button>
        <button className="icon-button" aria-label="Cài đặt">
          <Settings />
        </button>
        <div className="avatar">AM</div>
      </div>
    </header>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="description">{description}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}


// function Split() {
//   return <WalletCards />;
// }

function GenericView({ active }: { active: ViewKey }) {
  const configs: Record<string, [string, string, string]> = {
    "Sơ đồ bàn": [
      "FLOOR OPERATIONS",
      "Sơ đồ bàn",
      "Bản đồ khu vực phục vụ và trạng thái bàn theo thời gian thực.",
    ],
    "Quản lý thực đơn": [
      "CULINARY ENGINEERING",
      "Quản lý thực đơn",
      "Thiết kế thực đơn, biên lợi nhuận và hiệu suất món ăn.",
    ],
    "Bếp & Đơn hàng": [
      "KITCHEN OPERATIONS",
      "Bếp & Đơn hàng",
      "Theo dõi hàng đợi bếp và điều phối món ăn theo từng khu vực.",
    ],
    "Đơn hàng & Thanh toán": [
      "FINANCIAL OPERATIONS",
      "Đơn hàng & Thanh toán",
      "Quản lý hóa đơn, bàn đang phục vụ và trạng thái thanh toán.",
    ],
    "Quản lý nhân sự": [
      "TEAM LOGISTICS",
      "Danh sách nhân viên",
      "Quản lý thông tin và trạng thái làm việc của đội ngũ.",
    ],
    "Quản lý hồ sơ nhân viên": [
        "EMPLOYEE RECORDS",
        "Hồ sơ nhân viên",
        "Quản lý thông tin cá nhân, hợp đồng, chức vụ và lịch sử làm việc của nhân viên.",
    ],
    "Kho nguyên liệu": [
      "INVENTORY CONTROL",
      "Danh sách nguyên liệu",
      "Theo dõi tồn kho, nhà cung cấp và các cảnh báo định mức.",
    ],
    "Phân tích AI": [
      "INTELLIGENT INSIGHTS",
      "Culinary Intelligence & Forecasting",
      "Dự báo nhu cầu, tối ưu nguồn lực và tìm cơ hội tăng trưởng.",
    ],
    "Cấu hình hệ thống": [
      "ADMINISTRATION",
      "Cấu hình hệ thống",
      "Thiết lập quy tắc vận hành và thông tin nhà hàng.",
    ],
    "Quản lý người dùng": [
      "ADMINISTRATION",
      "Quản lý người dùng (RBAC)",
      "Kiểm soát quyền truy cập và vai trò trong hệ thống.",
    ],
    "Nhật ký hoạt động": [
      "AUDIT & SECURITY",
      "Nhật ký hoạt động",
      "Theo dõi các thay đổi và hành động trong hệ thống.",
    ],
  };
  const [eyebrow, title, desc] = configs[active];
  return (
    <>
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        description={desc}
        actions={
          <button className="button primary">
            <Plus /> Thêm mới
          </button>
        }
      />
      <div className="placeholder-view">
        <div className="placeholder-icon">
          <Activity />
        </div>
        <h2>{title}</h2>
        <p>
          Khu vực nội dung của chức năng này đã sẵn sàng để kết nối dữ liệu và
          quy trình nghiệp vụ.
        </p>
        <div className="placeholder-stats">
          <span>
            <b>24</b> Đang hoạt động
          </span>
          <span>
            <b>08</b> Cần xử lý
          </span>
          <span>
            <b>98%</b> Hiệu suất
          </span>
        </div>
      </div>
    </>
  );
}

export default function RomsDashboard() {
  const [active, setActive] = useState<ViewKey>("Tổng quan");
  const [menuOpen, setMenuOpen] = useState(false);
  const content = useMemo(() => {
    if (active === "Tổng quan") return <OverviewView />;
    if (active === "Chấm công & Check-in GPS") return <AttendanceView />;
    if (active === "Kho nguyên liệu") return <InventoryView />;
    if (active === "Lịch phân ca") return <ScheduleView />;
    if (active === "Duyệt nghỉ phép") return <LeaveView />;
    if (active === "Nhà cung cấp") return <SuppliersView />;
    if (active === "Quản lý hồ sơ nhân viên") return <EmployeesView />;
    if (active === "Quản lý thực đơn") return <MenuView />;
    if (active === "Sơ đồ bàn") return <FloorMapView />;
    if (active === "Đơn hàng & Thanh toán") return <OrdersView />;
    if (active === "Quản lý nhân sự") return <PeopleView />;
    if (active === "Phân tích AI") return <AiAnalyticsView />;
    return <GenericView active={active} />;
  }, [active]);
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onChange={setActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="main-shell">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="main-content">{content}</main>
      </div>
    </div>
  );
}
