import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import PageHeading from "../common/PageHeading";

function ScheduleView() {
  const days = ["T2 12", "T3 13", "T4 14", "T5 15", "T6 16", "T7 17", "CN 18"];
  const shifts: [string, string, string[]][] = [
    [
      "Trần Thị A",
      "Bếp",
      ["Ca Sáng", "Ca Sáng", "", "Ca Gãy", "Ca Sáng", "Nghỉ", "Nghỉ"],
    ],
    [
      "Nguyễn Văn V",
      "Phục vụ",
      [
        "Nghỉ",
        "Ca Chiều",
        "Ca Chiều",
        "Ca Chiều",
        "Ca Chiều",
        "Ca Sáng",
        "Ca Sáng",
      ],
    ],
  ];
  return (
    <div style={{ padding: '30px 34px 60px' , background: '#f7f5f2'}}>
      <PageHeading
        title="Lịch Phân Ca"
        description="Quản lý và sắp xếp lịch làm việc cho nhân viên."
        actions={
          <>
            <button className="select-button">
              Tất cả bộ phận <ChevronDown />
            </button>
            <div className="tabs">
              <button className="selected">Tuần</button>
              <button>Tháng</button>
            </div>
            <button className="button primary">
              <Plus /> Thêm Ca
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
            <CalendarDays /> Tuần 12 - 18 Tháng 10, 2023
          </b>
          <button>
            <ChevronRight />
          </button>
        </div>
        <div className="schedule-legend">
          <span>
            <i className="shift-dot morning" /> CA SÁNG (06:00 - 14:00)
          </span>
          <span>
            <i className="shift-dot evening" /> CA CHIỀU (14:00 - 22:00)
          </span>
          <span>
            <i className="shift-dot flexible" /> CA GÃY (LINH HOẠT)
          </span>
        </div>
        <div className="schedule-scroll">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
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
                  {cells.map((shift, index) => (
                    <td key={`${name}-${index}`}>
                      {shift ? (
                        <span
                          className={`shift ${shift.includes("Chiều") ? "evening" : shift === "Nghỉ" ? "off" : "morning"}`}
                        >
                          {shift}
                          <small>
                            {shift === "Nghỉ"
                              ? ""
                              : shift.includes("Chiều")
                                ? "14:00 - 22:00"
                                : "06:00 - 14:00"}
                          </small>
                        </span>
                      ) : null}
                    </td>
                  ))}
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