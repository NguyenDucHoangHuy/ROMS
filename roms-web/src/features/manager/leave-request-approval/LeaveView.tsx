import {
  CalendarDays,
  ClipboardCheck,
  FileClock,
} from "lucide-react";

import PageHeading from "../common/PageHeading";

function LeaveView() {
  const requests = [
    [
      "Trần Vân A",
      "Bếp trưởng • Ca sáng",
      "15/10/2023 - 16/10/2023 (2 ngày)",
      "Về quê giải quyết việc gia đình đột xuất.",
      "Chờ duyệt",
    ],
    [
      "Nguyễn Mai Linh",
      "Phục vụ bàn • Ca tối",
      "18/10/2023 (1 ngày)",
      "Sốt virus, cần nghỉ ngơi 1 ngày theo chỉ định của bác sĩ.",
      "Chờ duyệt",
    ],
    [
      "Phạm Hữu Hoàng",
      "Pha chế • Ca sáng",
      "10/10/2023 (1 ngày)",
      "Nghỉ bù ngày lễ Quốc Khánh.",
      "Đã duyệt",
    ],
  ];
  return (
    <div style={{ padding: '30px 34px 60px' , background: '#f7f5f2'}}>
      <PageHeading
        title="Yêu cầu nghỉ phép"
        description="Quản lý và phê duyệt đơn xin nghỉ của nhân viên"
        actions={
          <div className="tabs">
            <button className="selected">Chờ duyệt (5)</button>
            <button>Đã duyệt</button>
            <button>Từ chối</button>
          </div>
        }
      />
      <div className="leave-grid">
        {requests.map(([name, role, date, reason, status]) => (
          <article
            className={`leave-card ${status === "Đã duyệt" ? "approved" : ""}`}
            key={name}
          >
            <div className="leave-head">
              <span className="person-avatar">
                {name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(-2)}
              </span>
              <div>
                <b>{name}</b>
                <small>{role}</small>
              </div>
              <span
                className={`status ${status === "Đã duyệt" ? "ok" : "late"}`}
              >
                {status}
              </span>
            </div>
            <div className="leave-date">
              <CalendarDays />
              <b>{date}</b>
              <small>Nghỉ phép năm</small>
            </div>
            <p>
              <FileClock /> {reason}
            </p>
            <div className="leave-assignee">
              ▧ Nhân sự thay thế: Lê Thị B (Bếp phó)
            </div>
            {status === "Chờ duyệt" && (
              <div className="leave-actions">
                <button className="danger-text">Từ chối</button>
                <button className="button primary">
                  <ClipboardCheck /> Duyệt nhanh
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default LeaveView;