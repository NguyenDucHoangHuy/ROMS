import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

function ScheduleView() {
  const { isEn, t } = useManagerLocale();
  const days = isEn
    ? ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"]
    : ["T2 12", "T3 13", "T4 14", "T5 15", "T6 16", "T7 17", "CN 18"];

  const shifts: [string, string, string[]][] = [
    [
      "Trần Thị A",
      t("Bếp", "Kitchen"),
      [
        t("Ca Sáng", "Morning"),
        t("Ca Sáng", "Morning"),
        "",
        t("Ca Gãy", "Split"),
        t("Ca Sáng", "Morning"),
        t("Nghỉ", "Day Off"),
        t("Nghỉ", "Day Off"),
      ],
    ],
    [
      "Nguyễn Văn V",
      t("Phục vụ", "Server"),
      [
        t("Nghỉ", "Day Off"),
        t("Ca Chiều", "Afternoon"),
        t("Ca Chiều", "Afternoon"),
        t("Ca Chiều", "Afternoon"),
        t("Ca Chiều", "Afternoon"),
        t("Ca Sáng", "Morning"),
        t("Ca Sáng", "Morning"),
      ],
    ],
  ];

  return (
    <div style={{ padding: '30px 34px 60px' , background: '#f7f5f2'}}>
      <PageHeading
        title={t("Lịch Phân Ca", "Shift Schedule & Roster")}
        description={t("Quản lý và sắp xếp lịch làm việc cho nhân viên.", "Coordinate and manage staff shifts, schedules, and days off.")}
        actions={
          <>
            <button className="select-button">
              {t("Tất cả bộ phận", "All Departments")} <ChevronDown />
            </button>
            <div className="tabs">
              <button className="selected">{t("Tuần", "Week")}</button>
              <button>{t("Tháng", "Month")}</button>
            </div>
            <button className="button primary">
              <Plus /> {t("Thêm Ca", "Add Shift")}
            </button>
          </>
        }
      />
      <section className="panel schedule-panel">
        <div className="schedule-nav">
          <button>
            <ChevronLeft />
          </button>
          <b>
            <CalendarDays /> {isEn ? "Week of Oct 12 - Oct 18, 2023" : "Tuần 12 - 18 Tháng 10, 2023"}
          </b>
          <button>
            <ChevronRight />
          </button>
        </div>
        <div className="schedule-legend">
          <span>
            <i className="shift-dot morning" /> {t("CA SÁNG (06:00 - 14:00)", "MORNING SHIFT (06:00 - 14:00)")}
          </span>
          <span>
            <i className="shift-dot evening" /> {t("CA CHIỀU (14:00 - 22:00)", "AFTERNOON SHIFT (14:00 - 22:00)")}
          </span>
          <span>
            <i className="shift-dot flexible" /> {t("CA GÃY (LINH HOẠT)", "SPLIT / FLEX SHIFT")}
          </span>
        </div>
        <div className="schedule-scroll">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>{t("Nhân viên", "Staff Member")}</th>
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map(([name, role, cells]) => (
                <tr key={name}>
                  <td>
                    <div className="person">
                      <span className="person-avatar">{name.slice(0, 2)}</span>
                      <span>
                        <b>{name}</b>
                        <small>{role}</small>
                      </span>
                    </div>
                  </td>
                  {cells.map((shift, index) => {
                    const isOff = shift === t("Nghỉ", "Day Off");
                    const isEve = shift === t("Ca Chiều", "Afternoon");

                    return (
                      <td key={`${name}-${index}`}>
                        {shift ? (
                          <span
                            className={`shift ${isEve ? "evening" : isOff ? "off" : "morning"}`}
                          >
                            {shift}
                            <small>
                              {isOff
                                ? ""
                                : isEve
                                  ? "14:00 - 22:00"
                                  : "06:00 - 14:00"}
                            </small>
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ScheduleView;