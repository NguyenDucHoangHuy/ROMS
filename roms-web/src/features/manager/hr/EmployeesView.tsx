// import {
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   MoreVertical,
//   Plus,
//   Settings,
// } from "lucide-react";

// import PageHeading from "../common/PageHeading";

// function EmployeesView() {
//   const people = [
//     [
//       "NV001",
//       "Trần Thị Lan",
//       "Quản lý",
//       "Đang làm việc",
//       "0901 234 567",
//       "15/03/2021",
//     ],
//     [
//       "NV042",
//       "Nguyễn Văn Nam",
//       "Bếp trưởng",
//       "Đang làm việc",
//       "0912 345 678",
//       "02/06/2022",
//     ],
//     [
//       "NV087",
//       "Lê Hoàng Long",
//       "Phục vụ",
//       "Đang nghỉ",
//       "0987 654 321",
//       "10/11/2023",
//     ],
//     [
//       "NV092",
//       "Phạm Mai Anh",
//       "Thu ngân",
//       "Đang làm việc",
//       "0976 543 210",
//       "05/01/2024",
//     ],
//   ];
//   return (
//     <div style={{ padding: '30px 34px 60px' }}>
//       <PageHeading
//         title="Hồ sơ nhân viên"
//         description="Quản lý thông tin cá nhân, chức vụ, hợp đồng và lịch sử làm việc của nhân viên."
//         actions={
//           <button className="button primary">
//             <Plus /> Thêm nhân viên mới
//           </button>
//         }
//       />
//       <div className="role-filters">
//         <button className="selected">Tất cả</button>
//         <button>Quản lý</button>
//         <button>Bếp trưởng</button>
//         <button>Phục vụ</button>
//         <button>Thu ngân</button>
//         <button className="icon-button">
//           <Settings />
//         </button>
//         <button className="icon-button">
//           <Download />
//         </button>
//       </div>
//       <section className="panel table-panel employees-panel">
//         <div className="table-wrap">
//           <table>
//             <thead>
//               <tr>
//                 <th>Mã NV</th>
//                 <th>Họ tên</th>
//                 <th>Chức vụ</th>
//                 <th>Trạng thái</th>
//                 <th>Số điện thoại</th>
//                 <th>Ngày gia nhập</th>
//                 <th>Thao tác</th>
//               </tr>
//             </thead>
//             <tbody>
//               {people.map(([id, name, role, status, phone, joined]) => (
//                 <tr key={id}>
//                   <td className="mono">{id}</td>
//                   <td>
//                     <div className="person">
//                       <span className="person-avatar">
//                         {name
//                           .split(" ")
//                           .map((x) => x[0])
//                           .join("")
//                           .slice(-2)}
//                       </span>
//                       <span>
//                         <b>{name}</b>
//                         <small>
//                           {name.toLowerCase().replaceAll(" ", ".")}@roms.vn
//                         </small>
//                       </span>
//                     </div>
//                   </td>
//                   <td>{role}</td>
//                   <td>
//                     <span
//                       className={`status ${status === "Đang nghỉ" ? "late" : "ok"}`}
//                     >
//                       {status}
//                     </span>
//                   </td>
//                   <td>{phone}</td>
//                   <td>{joined}</td>
//                   <td>
//                     <button className="more-button">
//                       <MoreVertical />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div className="table-footer">
//           <span>Hiển thị 1-4 trên 45 nhân viên</span>
//           <div className="pagination">
//             <button>
//               <ChevronLeft />
//             </button>
//             <button className="current">1</button>
//             <button>2</button>
//             <button>3</button>
//             <button>
//               <ChevronRight />
//             </button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default EmployeesView;




import { Download, MoreVertical, Plus, Settings } from "lucide-react";
import { useMemo, useState } from "react";

function EmployeesView() {
  const [selectedRole, setSelectedRole] = useState("Tất cả");

  const people = [
    {
      id: "NV001",
      name: "Trần Thị Lan",
      email: "lan.tran@roms.vn",
      role: "Quản lý",
      status: "Đang làm việc",
      phone: "0901 234 567",
      joined: "15/03/2021",
      initials: "TL",
    },
    {
      id: "NV042",
      name: "Nguyễn Văn Nam",
      email: "nam.nguyen@roms.vn",
      role: "Bếp trưởng",
      status: "Đang làm việc",
      phone: "0912 345 678",
      joined: "02/06/2022",
      initials: "VN",
    },
    {
      id: "NV087",
      name: "Lê Hoàng Long",
      email: "long.le@roms.vn",
      role: "Phục vụ",
      status: "Đang nghỉ",
      phone: "0987 654 321",
      joined: "10/11/2023",
      initials: "L",
    },
    {
      id: "NV092",
      name: "Phạm Mai Anh",
      email: "anh.pham@roms.vn",
      role: "Thu ngân",
      status: "Đang làm việc",
      phone: "0976 543 210",
      joined: "05/01/2024",
      initials: "MA",
    },
  ];

  const roles = [
    "Tất cả",
    "Quản lý",
    "Bếp trưởng",
    "Phục vụ",
    "Thu ngân",
  ];

  const filteredPeople = useMemo(() => {
    if (selectedRole === "Tất cả") {
      return people;
    }

    return people.filter((person) => person.role === selectedRole);
  }, [selectedRole]);

  return (
    <>
      <style>{`
        /* ============================================================
           EMPLOYEES VIEW
           CSS riêng cho trang Danh sách nhân viên
           Không ảnh hưởng các View khác
           ============================================================ */

        .employees-view {
          padding: 30px 34px 60px;
          color: #1f2937;
          background: #f7f5f2;
        }

        /* =========================
           PAGE HEADER
           ========================= */

        .employees-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .employees-page-header h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.25;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1f2937;
        }

        .employees-page-header p {
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: #6b7280;
        }

        /* =========================
           PRIMARY BUTTON
           ========================= */

        .employees-view .button.primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          height: 40px;
          padding: 0 16px;

          border: 0;
          border-radius: 7px;

          background: #b42318;
          color: #ffffff;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
          white-space: nowrap;

          transition:
            background 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.15s ease;
        }

        .employees-view .button.primary:hover {
          background: #981b10;
          box-shadow: 0 2px 8px rgba(180, 35, 24, 0.18);
        }

        .employees-view .button.primary:active {
          transform: translateY(1px);
        }

        .employees-view .button.primary svg {
          width: 16px;
          height: 16px;
          stroke-width: 2.2;
        }

        /* =========================
           TOOLBAR
           ========================= */

        .employees-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .employees-toolbar .role-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .employees-toolbar .role-filters button {
          height: 34px;
          padding: 0 14px;

          border: 1px solid #e5e7eb;
          border-radius: 7px;

          background: #ffffff;
          color: #6b7280;

          font-family: inherit;
          font-size: 13px;
          font-weight: 500;

          cursor: pointer;

          transition:
            color 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .employees-toolbar .role-filters button:hover {
          color: #374151;
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .employees-toolbar .role-filters button.selected {
          border-color: #b42318;
          background: #b42318;
          color: #ffffff;
          font-weight: 600;
        }

        /* =========================
           TOOLBAR ICONS
           ========================= */

        .employees-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .employees-toolbar .icon-button {
          width: 34px;
          height: 34px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: 1px solid #e5e7eb;
          border-radius: 7px;

          background: #ffffff;
          color: #6b7280;

          cursor: pointer;

          transition:
            color 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .employees-toolbar .icon-button:hover {
          color: #374151;
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .employees-toolbar .icon-button svg {
          width: 16px;
          height: 16px;
        }

        /* =========================
           TABLE CARD
           ========================= */

        .employees-view .employees-panel {
          overflow: hidden;

          border: 1px solid #e5e7eb;
          border-radius: 10px;

          background: #ffffff;

          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .employees-view .table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .employees-view table {
          width: 100%;
          min-width: 950px;

          border-collapse: collapse;
          border-spacing: 0;

          font-size: 13px;
        }

        /* =========================
           TABLE HEADER
           ========================= */

        .employees-view table thead {
          background: #f9fafb;
        }

        .employees-view table th {
          height: 46px;
          padding: 0 18px;

          border-bottom: 1px solid #e5e7eb;

          color: #6b7280;

          font-size: 11px;
          font-weight: 700;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.04em;

          white-space: nowrap;
        }

        /* =========================
           TABLE BODY
           ========================= */

        .employees-view table td {
          height: 68px;
          padding: 10px 18px;

          border-bottom: 1px solid #f0f1f3;

          color: #374151;

          vertical-align: middle;
        }

        .employees-view table tbody tr:last-child td {
          border-bottom: none;
        }

        .employees-view table tbody tr {
          transition: background 0.12s ease;
        }

        .employees-view table tbody tr:hover {
          background: #fafafa;
        }

        /* =========================
           EMPLOYEE ID
           ========================= */

        .employees-view .mono {
          color: #6b7280;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            "Liberation Mono",
            monospace;
          font-size: 12px;
          font-weight: 500;
        }

        /* =========================
           PERSON CELL
           ========================= */

        .employees-view .person {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 210px;
        }

        .employees-view .person-avatar {
          width: 36px;
          height: 36px;

          flex: 0 0 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #f3e8e6;
          color: #9f2d22;

          font-size: 11px;
          font-weight: 700;
        }

        .employees-view .person > span:last-child {
          min-width: 0;

          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .employees-view .person b {
          color: #1f2937;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 600;
        }

        .employees-view .person small {
          color: #9ca3af;
          font-size: 11px;
          line-height: 1.3;
        }

        /* =========================
           STATUS BADGE
           ========================= */

        .employees-view .status {
          display: inline-flex;
          align-items: center;

          min-height: 25px;
          padding: 0 9px;

          border-radius: 999px;

          font-size: 11px;
          font-weight: 600;

          white-space: nowrap;
        }

        .employees-view .status.ok {
          background: #eaf7ee;
          color: #217a3b;
        }

        .employees-view .status.late {
          background: #fff2e5;
          color: #b45309;
        }

        /* =========================
           MORE BUTTON
           ========================= */

        .employees-view .more-button {
          width: 30px;
          height: 30px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: none;
          border-radius: 6px;

          background: transparent;
          color: #9ca3af;

          cursor: pointer;

          transition:
            color 0.15s ease,
            background 0.15s ease;
        }

        .employees-view .more-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .employees-view .more-button svg {
          width: 16px;
          height: 16px;
        }

        /* =========================
           TABLE FOOTER
           ========================= */

        .employees-view .table-footer {
          min-height: 58px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 18px;

          border-top: 1px solid #e5e7eb;

          color: #6b7280;
          font-size: 12px;
        }

        /* =========================
           PAGINATION
           ========================= */

        .employees-view .pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .employees-view .pagination button {
          width: 30px;
          height: 30px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: 1px solid transparent;
          border-radius: 6px;

          background: transparent;
          color: #6b7280;

          font-family: inherit;
          font-size: 12px;
          font-weight: 500;

          cursor: pointer;
        }

        .employees-view .pagination button:hover {
          border-color: #e5e7eb;
          background: #f9fafb;
          color: #374151;
        }

        .employees-view .pagination button.current {
          border-color: #b42318;
          background: #b42318;
          color: #ffffff;
          font-weight: 600;
        }

        .employees-view .pagination-ellipsis {
          width: 24px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          color: #9ca3af;
          font-size: 13px;
        }

        /* =========================
           RESPONSIVE
           ========================= */

        @media (max-width: 900px) {
          .employees-view {
            padding: 24px 20px 40px;
          }

          .employees-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .employees-page-header .button.primary {
            align-self: flex-start;
          }

          .employees-toolbar {
            flex-wrap: wrap;
          }

          .employees-toolbar .role-filters {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .employees-view {
            padding: 20px 14px 30px;
          }

          .employees-page-header h1 {
            font-size: 24px;
          }

          .employees-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .employees-toolbar-actions {
            align-self: flex-end;
          }

          .employees-view .table-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
            padding: 14px 16px;
          }

          .employees-view .pagination {
            align-self: flex-end;
          }
        }
      `}</style>

      <div className="employees-view">
        {/* =========================
            PAGE HEADER
            ========================= */}

        <div className="employees-page-header">
          <div>
            <h1>Danh sách nhân viên</h1>
            <p>
              Quản lý thông tin và trạng thái làm việc của đội ngũ
            </p>
          </div>

          <button className="button primary">
            <Plus />
            Thêm nhân viên mới
          </button>
        </div>

        {/* =========================
            FILTER TOOLBAR
            ========================= */}

        <div className="employees-toolbar">
          <div className="role-filters">
            {roles.map((role) => (
              <button
                key={role}
                className={selectedRole === role ? "selected" : ""}
                onClick={() => setSelectedRole(role)}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="employees-toolbar-actions">
            <button
              className="icon-button"
              aria-label="Bộ lọc"
              title="Bộ lọc"
            >
              <Settings />
            </button>

            <button
              className="icon-button"
              aria-label="Xuất dữ liệu"
              title="Xuất dữ liệu"
            >
              <Download />
            </button>
          </div>
        </div>

        {/* =========================
            EMPLOYEE TABLE
            ========================= */}

        <section className="panel table-panel employees-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Chức vụ</th>
                  <th>Trạng thái</th>
                  <th>Số điện thoại</th>
                  <th>Ngày gia nhập</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredPeople.map((person) => (
                  <tr key={person.id}>
                    <td className="mono">{person.id}</td>

                    <td>
                      <div className="person">
                        <span className="person-avatar">
                          {person.initials}
                        </span>

                        <span>
                          <b>{person.name}</b>
                          <small>{person.email}</small>
                        </span>
                      </div>
                    </td>

                    <td>{person.role}</td>

                    <td>
                      <span
                        className={`status ${
                          person.status === "Đang nghỉ"
                            ? "late"
                            : "ok"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>

                    <td>{person.phone}</td>

                    <td>{person.joined}</td>

                    <td>
                      <button
                        className="more-button"
                        aria-label={`Thao tác với ${person.name}`}
                      >
                        <MoreVertical />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =========================
              PAGINATION
              ========================= */}

          <div className="table-footer">
            <span>
              Hiển thị 1-{filteredPeople.length} trên 45 nhân viên
            </span>

            <div className="pagination">
              <button aria-label="Trang trước">‹</button>

              <button className="current">1</button>
              <button>2</button>
              <button>3</button>

              <span className="pagination-ellipsis">…</span>

              <button aria-label="Trang sau">›</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EmployeesView;