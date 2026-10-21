import {
  Download,
  MoreVertical,
  Plus,
  Search,
  X,
  Edit2,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, type CreateUserPayload, type UpdateUserPayload } from "@/services/modules/usersService";
import { UserRole } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

const ROLE_CONFIG: Record<string, { vi: string; en: string }> = {
  [UserRole.ADMIN]: { vi: "Quản trị viên", en: "System Admin" },
  [UserRole.MANAGER]: { vi: "Quản lý", en: "Restaurant Manager" },
  [UserRole.CHEF]: { vi: "Bếp trưởng", en: "Head Chef" },
  [UserRole.WAITER]: { vi: "Phục vụ", en: "Waiter / Server" },
  [UserRole.CASHIER]: { vi: "Thu ngân", en: "Cashier" },
};

const ROLE_TABS = [
  { key: "ALL", vi: "Tất cả", en: "All Roles" },
  { key: "MANAGER", vi: "Quản lý", en: "Managers" },
  { key: "CHEF", vi: "Bếp trưởng", en: "Chefs" },
  { key: "WAITER", vi: "Phục vụ", en: "Waiters" },
  { key: "CASHIER", vi: "Thu ngân", en: "Cashiers" },
  { key: "ADMIN", vi: "Quản trị viên", en: "Admins" },
];

interface EmployeeItem {
  id: string;
  rawId: string;
  name: string;
  email: string;
  role: string;
  roleKey: string;
  status: string;
  isActive: boolean;
  phone: string;
  joined: string;
  initials: string;
}

function EmployeesView() {
  const { isEn, t } = useManagerLocale();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoleKey, setSelectedRoleKey] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeItem | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "WAITER",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real users from backend
  const { data: rawEmployees = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: usersService.getEmployees,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsAddModalOpen(false);
      setFormData({ fullName: "", phone: "", email: "", password: "", role: "WAITER" });
      setFormError(null);
      showToast(t("Thêm nhân viên mới thành công!", "New staff member added successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể tạo tài khoản nhân viên. Vui lòng kiểm tra lại.", "Failed to create employee account. Please verify input data.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditTarget(null);
      setFormError(null);
      showToast(t("Cập nhật thông tin nhân viên thành công!", "Staff record updated successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể cập nhật nhân viên.", "Failed to update employee.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  // Toggle active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setActiveMenuId(null);
      showToast(
        variables.isActive
          ? t("Đã kích hoạt tài khoản nhân viên", "Employee account activated")
          : t("Đã khóa tài khoản nhân viên", "Employee account locked"),
        "success"
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể đổi trạng thái nhân viên.", "Failed to change employee status.");
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    },
  });

  // Transform raw backend employees
  const people: EmployeeItem[] = useMemo(() => {
    return rawEmployees.map((u: any, index: number) => {
      const roleKey = typeof u.role === "object" && u.role?.name ? u.role.name : u.role;
      const roleCfg = ROLE_CONFIG[roleKey];
      const roleLabel = roleCfg ? (isEn ? roleCfg.en : roleCfg.vi) : roleKey || (isEn ? "Staff" : "Nhân viên");

      const initials = (u.fullName || "NV")
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase();

      const dateObj = u.createdAt ? new Date(u.createdAt) : new Date();
      const joined = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}/${dateObj.getFullYear()}`;

      return {
        id: `NV${String(index + 1).padStart(3, "0")}`,
        rawId: u.id,
        name: u.fullName || (isEn ? "Unnamed Staff" : "Chưa đặt tên"),
        email: u.email || `${u.phone || "nv"}@roms.vn`,
        role: roleLabel,
        roleKey,
        status: u.isActive ? (isEn ? "Active" : "Đang làm việc") : (isEn ? "Locked" : "Đã khóa"),
        isActive: u.isActive,
        phone: u.phone || "---",
        joined,
        initials,
      };
    });
  }, [rawEmployees, isEn]);

  // Filtered people
  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchRole =
        selectedRoleKey === "ALL" ||
        (selectedRoleKey === "MANAGER"
          ? (person.roleKey === UserRole.MANAGER || person.roleKey === UserRole.ADMIN)
          : person.roleKey === selectedRoleKey);
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        person.name.toLowerCase().includes(q) ||
        person.email.toLowerCase().includes(q) ||
        person.phone.toLowerCase().includes(q) ||
        person.id.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [people, selectedRoleKey, searchTerm]);

  // Open add modal
  const handleOpenAddModal = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "Password123",
      role: "WAITER",
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Submit add
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError(t("Vui lòng nhập họ và tên nhân viên.", "Please enter employee full name."));
      return;
    }
    if (!formData.phone.trim()) {
      setFormError(t("Vui lòng nhập số điện thoại.", "Please enter phone number."));
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setFormError(t("Mật khẩu phải từ 8 ký tự trở lên.", "Password must be at least 8 characters."));
      return;
    }

    createMutation.mutate({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() ? formData.email.trim() : undefined,
      password: formData.password,
      role: formData.role,
    });
  };

  // Open edit modal
  const handleOpenEditModal = (person: EmployeeItem) => {
    setEditTarget(person);
    setFormData({
      fullName: person.name,
      phone: person.phone === "---" ? "" : person.phone,
      email: person.email.endsWith("@roms.vn") ? "" : person.email,
      password: "",
      role: person.roleKey || "WAITER",
    });
    setFormError(null);
    setActiveMenuId(null);
  };

  // Submit edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError(t("Vui lòng nhập họ và tên.", "Please enter full name."));
      return;
    }
    if (!formData.phone.trim()) {
      setFormError(t("Vui lòng nhập số điện thoại.", "Please enter phone number."));
      return;
    }

    const payload: UpdateUserPayload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() ? formData.email.trim() : undefined,
      role: formData.role,
    };

    if (formData.password && formData.password.trim().length >= 8) {
      payload.password = formData.password.trim();
    }

    updateMutation.mutate({ id: editTarget.rawId, payload });
  };

  return (
    <>
      <style>{`
        .employees-view {
          padding: 30px 34px 60px;
          color: #1f2937;
          background: #f7f5f2;
          min-height: 100%;
        }

        .employees-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
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
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .employees-view .button.primary:hover {
          background: #981b10;
          box-shadow: 0 2px 8px rgba(180, 35, 24, 0.18);
        }

        .employees-view .button.primary:active {
          transform: translateY(1px);
        }

        .employees-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .employees-toolbar .role-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          flex-wrap: wrap;
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
          transition: all 0.15s ease;
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

        .employees-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          width: 240px;
        }

        .search-box svg {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 13px;
          color: #1f2937;
          background: transparent;
        }

        .employees-view .icon-button {
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
          transition: all 0.15s ease;
        }

        .employees-view .icon-button:hover {
          color: #374151;
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .employees-view .employees-panel {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          position: relative;
        }

        .employees-view .table-wrap {
          width: 100%;
          overflow-x: auto;
          min-height: 280px;
        }

        .employees-view table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          font-size: 13px;
        }

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

        .employees-view table tbody tr:hover {
          background: #fafafa;
        }

        .employees-view .mono {
          color: #6b7280;
          font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          font-weight: 600;
        }

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
          background: #fef2f2;
          color: #b91c1c;
        }

        .action-cell {
          position: relative;
        }

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
          transition: all 0.15s ease;
        }

        .employees-view .more-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-icon-btn {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-icon-btn:hover {
          color: #1e293b;
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .action-icon-btn.edit:hover {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .action-icon-btn.warning:hover {
          color: #d97706;
          background: #fffbeb;
          border-color: #fde68a;
        }

        .action-icon-btn.success:hover {
          color: #16a34a;
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .action-icon-btn.danger:hover {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          bottom: 36px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          min-width: 175px;
          z-index: 100;
          padding: 5px 0;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: none;
          background: none;
          font-size: 12.5px;
          color: #374151;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease;
        }

        .dropdown-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .dropdown-item.danger {
          color: #dc2626;
        }

        .dropdown-item.danger:hover {
          background: #fef2f2;
        }

        .employees-view .table-footer {
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: modalIn 0.15s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .modal-close {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }

        .modal-close:hover {
          color: #334155;
          background: #f1f5f9;
        }

        .modal-body {
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .form-group input,
        .form-group select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          font-size: 13px;
          color: #1f2937;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #b42318;
          box-shadow: 0 0 0 2px rgba(180, 35, 24, 0.1);
        }

        .form-error {
          padding: 10px 12px;
          border-radius: 6px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-footer {
          padding: 14px 22px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-secondary {
          height: 36px;
          padding: 0 14px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
        }

        .btn-danger {
          height: 36px;
          padding: 0 14px;
          border: none;
          border-radius: 7px;
          background: #dc2626;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-danger:hover {
          background: #b91c1c;
        }

        /* Toast */
        .toast-popup {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          z-index: 200;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
          animation: toastIn 0.2s ease-out;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .toast-popup.success {
          background: #15803d;
          color: #ffffff;
        }

        .toast-popup.error {
          background: #dc2626;
          color: #ffffff;
        }
      `}</style>

      <div className="employees-view">
        {/* =========================
            PAGE HEADER
            ========================= */}
        <div className="employees-page-header">
          <div>
            <h1>{t("Danh sách nhân viên", "Staff Directory & Records")}</h1>
            <p>{t("Quản lý thông tin và trạng thái làm việc của đội ngũ", "Manage staff profiles, role permissions, and active status")}</p>
          </div>

          <button className="button primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            {t("Thêm nhân viên mới", "Add New Employee")}
          </button>
        </div>

        {/* =========================
            FILTER TOOLBAR
            ========================= */}
        <div className="employees-toolbar">
          <div className="role-filters">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                className={selectedRoleKey === tab.key ? "selected" : ""}
                onClick={() => setSelectedRoleKey(tab.key)}
              >
                {isEn ? tab.en : tab.vi}
              </button>
            ))}
          </div>

          <div className="employees-toolbar-actions">
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder={t("Tìm tên, SĐT, email...", "Search name, phone, email...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                >
                  <X size={14} color="#9ca3af" />
                </button>
              )}
            </div>

            <button
              className="icon-button"
              aria-label={t("Làm mới", "Reload")}
              title={t("Tải lại dữ liệu", "Reload staff data")}
              onClick={() => refetch()}
            >
              <Download size={15} />
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
                  <th>{t("Mã NV", "Staff ID")}</th>
                  <th>{t("Họ tên", "Full Name")}</th>
                  <th>{t("Chức vụ", "Role")}</th>
                  <th>{t("Trạng thái", "Status")}</th>
                  <th>{t("Số điện thoại", "Phone Number")}</th>
                  <th>{t("Ngày gia nhập", "Joined Date")}</th>
                  <th style={{ textAlign: "right" }}>{t("Thao tác", "Actions")}</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#6b7280" }}>
                        <Loader2 size={18} className="animate-spin" />
                        {t("Đang tải danh sách nhân viên từ cơ sở dữ liệu...", "Loading staff members from database...")}
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
                      {t("Lỗi tải dữ liệu. Vui lòng kiểm tra lại backend.", "Failed to load staff data. Please check backend connection.")}
                    </td>
                  </tr>
                ) : filteredPeople.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      {t("Không tìm thấy nhân viên nào phù hợp với bộ lọc.", "No staff members matched the current filters.")}
                    </td>
                  </tr>
                ) : (
                  filteredPeople.map((person) => {
                    const isSelf = Boolean(
                      currentUser &&
                      (person.rawId === currentUser.id ||
                       person.phone === currentUser.phone ||
                       person.phone === (currentUser as any)?.phoneNumber)
                    );

                    return (
                      <tr key={person.rawId}>
                        <td className="mono">{person.id}</td>

                        <td>
                          <div className="person">
                            <span className="person-avatar">{person.initials}</span>

                            <span>
                              <b style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {person.name}
                                {isSelf && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      padding: "1px 6px",
                                      background: "#ffedd5",
                                      color: "#c2410c",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {t("Bạn", "You")}
                                  </span>
                                )}
                              </b>
                              <small>{person.email}</small>
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 500, color: "#374151" }}>{person.role}</span>
                        </td>

                        <td>
                          <span className={`status ${person.isActive ? "ok" : "late"}`}>
                            ● {person.status}
                          </span>
                        </td>

                        <td>{person.phone}</td>

                        <td>{person.joined}</td>

                        <td style={{ textAlign: "right" }} className="action-cell">
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="action-icon-btn edit"
                              title={t("Chỉnh sửa hồ sơ", "Edit Profile")}
                              onClick={() => handleOpenEditModal(person)}
                            >
                              <Edit2 size={14} />
                            </button>

                            {!isSelf && (
                              <button
                                className={`action-icon-btn ${person.isActive ? "warning" : "success"}`}
                                title={person.isActive ? t("Khóa tài khoản", "Lock Account") : t("Mở khóa tài khoản", "Unlock Account")}
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    id: person.rawId,
                                    isActive: !person.isActive,
                                  })
                                }
                              >
                                {person.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>
                            )}

                            <div style={{ position: "relative" }}>
                              <button
                                className="more-button"
                                aria-label={t(`Thao tác với ${person.name}`, `Actions for ${person.name}`)}
                                onClick={() =>
                                  setActiveMenuId(activeMenuId === person.rawId ? null : person.rawId)
                                }
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuId === person.rawId && (
                                <div className="dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleOpenEditModal(person);
                                      setActiveMenuId(null);
                                    }}
                                  >
                                    <Edit2 size={14} /> {t("Chỉnh sửa hồ sơ", "Edit Profile")}
                                  </button>

                                  {!isSelf ? (
                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        toggleStatusMutation.mutate({
                                          id: person.rawId,
                                          isActive: !person.isActive,
                                        });
                                        setActiveMenuId(null);
                                      }}
                                    >
                                      {person.isActive ? (
                                        <>
                                          <UserX size={14} color="#d97706" /> {t("Khóa tài khoản", "Lock Account")}
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck size={14} color="#16a34a" /> {t("Mở khóa tài khoản", "Unlock Account")}
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <div
                                      style={{
                                        padding: "8px 14px",
                                        fontSize: 11,
                                        color: "#9ca3af",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      {t("Tài khoản đang đăng nhập", "Currently logged in")}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* =========================
              TABLE FOOTER
              ========================= */}
          <div className="table-footer">
            <span>
              {t("Hiển thị", "Showing")} {filteredPeople.length} {t("trên tổng số", "of")} {people.length} {t("nhân viên", "employees")}
            </span>
            <span style={{ color: "#9ca3af", fontSize: 11 }}>
              {t("Dữ liệu đồng bộ trực tiếp từ Database ROMS", "Synchronized live with ROMS database")}
            </span>
          </div>
        </section>
      </div>

      {/* =========================
          MODAL: THÊM NHÂN VIÊN MỚI
          ========================= */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("Thêm nhân viên mới", "Add New Employee")}</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("Họ và tên *", "Full Name *")}</label>
                  <input
                    type="text"
                    placeholder={t("VD: Nguyễn Văn An", "e.g. John Doe")}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Số điện thoại (dùng đăng nhập) *", "Phone Number (Login ID) *")}</label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Email liên hệ", "Contact Email")}</label>
                  <input
                    type="email"
                    placeholder={t("VD: an.nguyen@roms.vn (tùy chọn)", "e.g. staff@restaurant.com (optional)")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t("Mật khẩu khởi tạo *", "Initial Password *")}</label>
                  <input
                    type="text"
                    placeholder={t("Tối thiểu 8 ký tự", "Minimum 8 characters")}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Chức vụ (Vai trò hệ thống) *", "System Role *")}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value={UserRole.WAITER}>{t("Phục vụ (Waiter)", "Waiter / Server")}</option>
                    <option value={UserRole.CHEF}>{t("Bếp trưởng / Đầu bếp (Chef)", "Chef / Kitchen Staff")}</option>
                    <option value={UserRole.CASHIER}>{t("Thu ngân (Cashier)", "Cashier")}</option>
                    <option value={UserRole.MANAGER}>{t("Quản lý nhà hàng (Manager)", "Restaurant Manager")}</option>
                    <option value={UserRole.ADMIN}>{t("Quản trị hệ thống (Admin)", "System Administrator")}</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? t("Đang tạo...", "Creating...")
                    : t("Lưu nhân viên", "Save Employee")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          MODAL: CHỈNH SỬA HỒ SƠ
          ========================= */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t("Chỉnh sửa hồ sơ:", "Edit Profile:")} {editTarget.name}</h3>
              <button className="modal-close" onClick={() => setEditTarget(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("Họ và tên *", "Full Name *")}</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Số điện thoại *", "Phone Number *")}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("Email", "Email")}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t("Đổi mật khẩu mới (bỏ trống nếu không đổi)", "Change Password (leave blank if unchanged)")}</label>
                  <input
                    type="password"
                    placeholder={t("Nhập mật khẩu mới nếu muốn đổi", "Enter new password if changing")}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t("Chức vụ (Vai trò hệ thống) *", "System Role *")}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value={UserRole.WAITER}>{t("Phục vụ (Waiter)", "Waiter / Server")}</option>
                    <option value={UserRole.CHEF}>{t("Bếp trưởng / Đầu bếp (Chef)", "Chef / Kitchen Staff")}</option>
                    <option value={UserRole.CASHIER}>{t("Thu ngân (Cashier)", "Cashier")}</option>
                    <option value={UserRole.MANAGER}>{t("Quản lý nhà hàng (Manager)", "Restaurant Manager")}</option>
                    <option value={UserRole.ADMIN}>{t("Quản trị hệ thống (Admin)", "System Administrator")}</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditTarget(null)}
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? t("Đang lưu...", "Saving...")
                    : t("Cập nhật", "Update Profile")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          TOAST THÔNG BÁO
          ========================= */}
      {toast && (
        <div className={`toast-popup ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}

export default EmployeesView;