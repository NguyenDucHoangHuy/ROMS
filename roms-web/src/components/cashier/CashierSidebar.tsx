import React from "react";
import { NavLink } from "react-router-dom";
import { useCashierLocale } from "@/contexts/CashierLocaleContext";
import {
  History,
  LifeBuoy,
  Receipt,
  Settings,
  TableProperties,
  WalletCards,
  BarChart3,
} from "lucide-react";

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [

  {
    label: "Bàn & Khu vực",
    path: "/cashier/tables",
    icon: TableProperties,
  },
  {
    label: "Thanh toán",
    path: "/cashier/checkout",
    icon: WalletCards,
  },
  {
    label: "Lịch sử & Hoàn tiền",
    path: "/cashier/history-refund",
    icon: History,
  },
  {
    label: "Doanh thu & Audit",
    path: "/cashier/revenue-audit-log",
    icon: BarChart3,
  },
  {
    label: "Báo cáo cuối ngày",
    path: "/cashier/end-of-day",
    icon: Receipt,
  },
  {
    label: "Cài đặt",
    path: "/cashier/settings",
    icon: Settings,
  },
];

const CashierSidebar: React.FC = () => {
  const { isEnglish } = useCashierLocale();

  const labels = isEnglish
    ? {
        tables: "Tables & Areas",
        checkout: "Checkout",
        history: "History & Refunds",
        revenue: "Revenue & Audit",
        endOfDay: "End of Day Report",
        settings: "Settings",
        support: "Support",
      }
    : {
        tables: "Bàn & Khu vực",
        checkout: "Thanh toán",
        history: "Lịch sử & Hoàn tiền",
        revenue: "Doanh thu & Audit",
        endOfDay: "Báo cáo cuối ngày",
        settings: "Cài đặt",
        support: "Hỗ trợ",
      };

  const localizedItems = sidebarItems.map((item, index) => ({
    ...item,
    label: [
      labels.tables,
      labels.checkout,
      labels.history,
      labels.revenue,
      labels.endOfDay,
      labels.settings,
    ][index],
  }));

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col bg-[#1a1d21] text-white lg:flex">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="flex h-[92px] items-center gap-4 border-b border-white/5 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c2410c] text-xl font-bold">
          B
        </div>

        <div>
          <h1 className="text-[18px] font-bold tracking-tight">
            Bistro POS
          </h1>

          <p className="mt-1 text-[13px] text-slate-400">
            Terminal 01
          </p>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="mt-6 flex-1 overflow-y-auto px-4">

        {localizedItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/cashier"}
              className={({ isActive }) =>
                [
                  "group relative mb-2 flex h-12 w-full items-center gap-4 rounded-xl px-4 text-[14px] transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-2.5 h-7 w-1 rounded-r-full bg-[#f35b25]" />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={
                      isActive
                        ? "text-[#f35b25]"
                        : "text-slate-400 group-hover:text-white"
                    }
                  />

                  <span
                    className={
                      isActive
                        ? "font-bold"
                        : "font-medium"
                    }
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

      </nav>

      {/* =====================================================
          SUPPORT
      ===================================================== */}

      <div className="border-t border-white/5 p-4">
        <button
          type="button"
          className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-[14px] text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LifeBuoy size={19} />
          {labels.support}
        </button>
      </div>

    </aside>
  );
};

export default CashierSidebar;