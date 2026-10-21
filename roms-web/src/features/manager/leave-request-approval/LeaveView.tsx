import {
  CalendarDays,
  ClipboardCheck,
  FileClock,
} from "lucide-react";

import PageHeading from "../common/PageHeading";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

function LeaveView() {
  const { t } = useManagerLocale();
  const requests = [
    [
      "Trần Vân A",
      t("Bếp trưởng • Ca sáng", "Head Chef • Morning Shift"),
      "15/10/2023 - 16/10/2023 (2 days)",
      t("Về quê giải quyết việc gia đình đột xuất.", "Personal family emergency out of town."),
      "PENDING",
    ],
    [
      "Nguyễn Mai Linh",
      t("Phục vụ bàn • Ca tối", "Waiter • Evening Shift"),
      "18/10/2023 (1 day)",
      t("Sốt virus, cần nghỉ ngơi 1 ngày theo chỉ định của bác sĩ.", "Medical sick leave under doctor prescription."),
      "PENDING",
    ],
    [
      "Phạm Hữu Hoàng",
      t("Pha chế • Ca sáng", "Barista • Morning Shift"),
      "10/10/2023 (1 day)",
      t("Nghỉ bù ngày lễ Quốc Khánh.", "Compensatory day off for national holiday."),
      "APPROVED",
    ],
  ];
  return (
    <div style={{ padding: '30px 34px 60px' , background: '#f7f5f2'}}>
      <PageHeading
        title={t("Yêu cầu nghỉ phép", "Leave Requests & Approvals")}
        description={t("Quản lý và phê duyệt đơn xin nghỉ của nhân viên", "Review and approve employee time-off requests")}
        actions={
          <div className="tabs">
            <button className="selected">{t("Chờ duyệt (5)", "Pending (5)")}</button>
            <button>{t("Đã duyệt", "Approved")}</button>
            <button>{t("Từ chối", "Rejected")}</button>
          </div>
        }
      />
      <div className="leave-grid">
        {requests.map(([name, role, date, reason, statusCode]) => {
          const isApproved = statusCode === "APPROVED";
          const statusLabel = isApproved ? t("Đã duyệt", "Approved") : t("Chờ duyệt", "Pending");

          return (
            <article
              className={`leave-card ${isApproved ? "approved" : ""}`}
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
                  className={`status ${isApproved ? "ok" : "late"}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="leave-date">
                <CalendarDays />
                <b>{date}</b>
                <small>{t("Nghỉ phép năm", "Annual Leave")}</small>
              </div>
              <p>
                <FileClock /> {reason}
              </p>
              <div className="leave-assignee">
                {t("▧ Nhân sự thay thế: Lê Thị B (Bếp phó)", "▧ Covering Staff: Le Thi B (Sous Chef)")}
              </div>
              {!isApproved && (
                <div className="leave-actions">
                  <button className="danger-text">{t("Từ chối", "Reject")}</button>
                  <button className="button primary">
                    <ClipboardCheck /> {t("Duyệt nhanh", "Approve")}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default LeaveView;