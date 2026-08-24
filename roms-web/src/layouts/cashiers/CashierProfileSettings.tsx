import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import { useCashierLocale } from "@/contexts/CashierLocaleContext";
import {
  Bell,
  Banknote,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  History,
  LogOut,
  Receipt,
  RotateCcw,
  Save,
  Settings,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Split,
  User,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface ShiftInfo {
  name: string;
  startTime: string;
  endTime: string;
  status: "active" | "inactive";
}

interface CashierProfile {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  branch: string;
  avatarUrl: string;
  currentShift: ShiftInfo;
}

interface SystemSettings {
  language: "Tiếng Việt" | "English";
  notificationSound: boolean;
}

interface NavigationItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  branch: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const initialCashierProfile: CashierProfile = {
  id: "NV-082",
  fullName: "Nguyễn Thu Ngân",
  role: "Thu ngân chính",
  email: "nguyen.thungan@bistropos.vn",
  phone: "+84 90 123 4567",
  branch: "Quận 1, TP. Hồ Chí Minh",
  avatarUrl: "https://i.pravatar.cc/160?img=47",
  currentShift: {
    name: "Ca Sáng",
    startTime: "06:00",
    endTime: "14:00",
    status: "active",
  },
};

const initialSettings: SystemSettings = {
  language: "Tiếng Việt",
  notificationSound: true,
};

const navigationItems: NavigationItem[] = [
  {
    label: "Sales",
    icon: ShoppingBag,
    path: "/cashier/",
  },
  {
    label: "Orders",
    icon: Receipt,
    path: "/cashier/orders",
  },
  {
    label: "History",
    icon: History,
    path: "/cashier/history",
  },
  {
    label: "Refunds",
    icon: RotateCcw,
    path: "/cashier/refunds",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/cashier/settings",
  },
];

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  vi: {
    settings: "Cài đặt",
    sales: "Bán hàng",
    orders: "Đơn hàng",
    history: "Lịch sử",
    refunds: "Hoàn tiền",
    settingsNav: "Cài đặt",

    newTable: "Bàn mới",
    terminalActive: "Terminal đang hoạt động",
    online: "Online",

    splitBill: "Tách hóa đơn",
    quickCash: "Tiền nhanh",
    notifications: "Thông báo",

    cashierRole: "Thu ngân chính",
    editProfile: "Chỉnh sửa hồ sơ",

    email: "Email",
    phone: "Số điện thoại",
    branch: "Chi nhánh",
    currentShift: "Ca làm việc hiện tại",
    morningShift: "Ca Sáng",

    accountSecurity: "Bảo mật tài khoản",
    securityDescription:
      "Cập nhật mật khẩu để bảo vệ tài khoản của bạn.",
    changePassword: "Đổi mật khẩu",

    systemOptions: "Tùy chọn hệ thống",
    languageDisplay: "Ngôn ngữ (Language)",
    posLanguage: "Ngôn ngữ hiển thị của POS",
    notificationSound: "Âm thanh thông báo",
    notificationDescription:
      "Phát âm thanh khi có đơn mới",

    logout: "Đăng xuất",

    editPersonalInfo: "Chỉnh sửa thông tin cá nhân",
    personalInfoDescription:
      "Cập nhật thông tin tài khoản thu ngân của bạn.",
    fullName: "Họ và tên",

    cancel: "Hủy",
    saveChanges: "Lưu thay đổi",
    profileUpdated:
      "Thông tin cá nhân đã được cập nhật.",

    changePasswordTitle: "Đổi mật khẩu",
    changePasswordDescription:
      "Tạo mật khẩu mới để bảo vệ tài khoản của bạn.",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",

    passwordMinLength:
      "Mật khẩu mới phải có ít nhất 6 ký tự.",
    passwordNotMatch:
      "Mật khẩu xác nhận không khớp.",
    currentPasswordRequired:
      "Vui lòng nhập mật khẩu hiện tại.",

    passwordUpdated: "Mật khẩu đã được cập nhật.",
    updatePassword: "Cập nhật mật khẩu",

    noNotifications: "Bạn không có thông báo mới.",
    splitBillMessage:
      "Chức năng Tách hóa đơn đã được mở.",
    quickCashMessage:
      "Chức năng Tiền nhanh đã được mở.",

    logoutConfirm:
      "Bạn có chắc chắn muốn đăng xuất khỏi Bistro POS?",
  },

  en: {
    settings: "Settings",
    sales: "Sales",
    orders: "Orders",
    history: "History",
    refunds: "Refunds",
    settingsNav: "Settings",

    newTable: "New Table",
    terminalActive: "Terminal Active",
    online: "Online",

    splitBill: "Split Bill",
    quickCash: "Quick Cash",
    notifications: "Notifications",

    cashierRole: "Main Cashier",
    editProfile: "Edit Profile",

    email: "Email",
    phone: "Phone",
    branch: "Branch",
    currentShift: "Current Shift",
    morningShift: "Morning Shift",

    accountSecurity: "Account Security",
    securityDescription:
      "Update your password to keep your account secure.",
    changePassword: "Change Password",

    systemOptions: "System Options",
    languageDisplay: "Language",
    posLanguage: "POS display language",
    notificationSound: "Notification Sound",
    notificationDescription:
      "Play sound when a new order arrives",

    logout: "Log Out",

    editPersonalInfo: "Edit Personal Information",
    personalInfoDescription:
      "Update your cashier account information.",
    fullName: "Full Name",

    cancel: "Cancel",
    saveChanges: "Save Changes",
    profileUpdated:
      "Personal information has been updated.",

    changePasswordTitle: "Change Password",
    changePasswordDescription:
      "Create a new password to protect your account.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordPlaceholder: "Enter password",

    passwordMinLength:
      "New password must contain at least 6 characters.",
    passwordNotMatch:
      "Passwords do not match.",
    currentPasswordRequired:
      "Please enter your current password.",

    passwordUpdated: "Password has been updated.",
    updatePassword: "Update Password",

    noNotifications:
      "You have no new notifications.",
    splitBillMessage:
      "Split Bill has been opened.",
    quickCashMessage:
      "Quick Cash has been opened.",

    logoutConfirm:
      "Are you sure you want to log out of Bistro POS?",
  },
};

/* =========================================================
   BUTTON
========================================================= */

interface AppButtonProps {
  children: React.ReactNode;
  variant?: "outline" | "primary" | "danger" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

function AppButton({
  children,
  variant = "outline",
  className = "",
  onClick,
  type = "button",
}: AppButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

  const variants = {
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
    primary:
      "bg-orange-600 text-white shadow-sm hover:bg-orange-700 hover:shadow-md",
    danger:
      "border border-rose-100 bg-rose-100 text-rose-700 hover:bg-rose-200",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
        checked ? "bg-orange-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* =========================================================
   INFO FIELD
========================================================= */

function InfoField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      {children ?? (
        <p className="truncate text-base font-semibold text-slate-800 xl:text-lg">
          {value}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            : "border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              : "border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible ? "Hide password" : "Show password"
          }
          className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CashierProfileSettings() {
  const navigate = useNavigate();
  const { language, setLanguage, isEnglish } = useCashierLocale();

  const [profile, setProfile] = useState<CashierProfile>(
    initialCashierProfile
  );

  const [settings, setSettings] =
    useState<SystemSettings>(initialSettings);

  const [isProfileModalOpen, setIsProfileModalOpen] =
    useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const [profileForm, setProfileForm] =
    useState<ProfileFormData>({
      fullName: initialCashierProfile.fullName,
      email: initialCashierProfile.email,
      phone: initialCashierProfile.phone,
      branch: initialCashierProfile.branch,
    });

  const [profileError, setProfileError] =
    useState("");

  const [passwordForm, setPasswordForm] =
    useState<PasswordFormData>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [passwordErrors, setPasswordErrors] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const t = isEnglish
    ? translations.en
    : translations.vi;

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNewTable = () => {
    navigate("/cashier/checkout");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  /* =======================================================
     PROFILE MODAL
  ======================================================= */

  const openProfileModal = () => {
    setProfileForm({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      branch: profile.branch,
    });

    setProfileError("");
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileError("");
  };

  const handleSaveProfile = () => {
    if (!profileForm.fullName.trim()) {
      setProfileError(
        isEnglish
          ? "Full name is required."
          : "Vui lòng nhập họ và tên."
      );

      return;
    }

    if (!profileForm.email.trim()) {
      setProfileError(
        isEnglish
          ? "Email is required."
          : "Vui lòng nhập email."
      );

      return;
    }

    setProfile((previous) => ({
      ...previous,
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      branch: profileForm.branch.trim(),
    }));

    setIsProfileModalOpen(false);
    setProfileError("");

    showToast(t.profileUpdated);
  };

  /* =======================================================
     PASSWORD MODAL
  ======================================================= */

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handlePasswordSubmit = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword =
        t.currentPasswordRequired;
    }

    if (passwordForm.newPassword.length < 6) {
      errors.newPassword = t.passwordMinLength;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      errors.confirmPassword =
        t.passwordNotMatch;
    }

    setPasswordErrors(errors);

    if (
      errors.currentPassword ||
      errors.newPassword ||
      errors.confirmPassword
    ) {
      return;
    }

    setIsPasswordModalOpen(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    showToast(t.passwordUpdated);
  };

  /* =======================================================
     HEADER ACTIONS
  ======================================================= */

  const handleSplitBill = () => {
    window.alert(t.splitBillMessage);
  };

  const handleQuickCash = () => {
    window.alert(t.quickCashMessage);
  };

  const handleNotification = () => {
    window.alert(t.noNotifications);
  };

  /* =======================================================
     LANGUAGE
  ======================================================= */

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage =
      event.target.value as SystemSettings["language"];

    setLanguage(selectedLanguage === "English" ? "en" : "vi");

    setSettings((previous) => ({
      ...previous,
      language: selectedLanguage,
    }));
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    const confirmed = window.confirm(
      t.logoutConfirm
    );

    if (!confirmed) {
      return;
    }

    navigate("/login");
  };

  /* =======================================================
     NAV LABEL
  ======================================================= */

  const getNavigationLabel = (
    label: string
  ): string => {
    if (!isEnglish) {
      switch (label) {
        case "Sales":
          return t.sales;
        case "Orders":
          return t.orders;
        case "History":
          return t.history;
        case "Refunds":
          return t.refunds;
        case "Settings":
          return t.settingsNav;
        default:
          return label;
      }
    }

    return label;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="h-screen overflow-hidden bg-slate-100/90 text-slate-900">
      <div className="flex h-full min-h-0">

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <CashierSidebar />

        <aside className="hidden">

          {/* Brand */}
          <div className="mb-7 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
              <ChefHat
                size={23}
                strokeWidth={2.4}
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-[20px] font-extrabold leading-5 tracking-tight">
                Bistro POS
              </h1>

              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Terminal #01
              </p>
            </div>
          </div>

          {/* New Table */}
          <button
            type="button"
            onClick={handleNewTable}
            className="mb-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-base font-bold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161a]"
          >
            <span className="text-xl leading-none">
              +
            </span>

            <span>{t.newTable}</span>
          </button>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.label === "Settings";

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-700/80 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-500" />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={
                      isActive ? 2.5 : 2
                    }
                    className={
                      isActive
                        ? "ml-1 text-orange-500"
                        : "text-slate-300 group-hover:text-orange-400"
                    }
                  />

                  <span>
                    {getNavigationLabel(
                      item.label
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Terminal Status */}
          <div className="border-t border-slate-800 pt-4">
            <div className="rounded-xl bg-slate-900/70 px-3 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.12)]" />

                <span className="text-xs font-semibold text-slate-300">
                  {t.terminalActive}
                </span>
              </div>

              <p className="mt-1 pl-4 text-[10px] text-slate-500">
                POS-01 · {t.online}
              </p>
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================== */}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100/90">

          {/* =================================================
              HEADER
          ================================================== */}

          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7 xl:px-8">

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {t.settings}
            </h2>

            <div className="flex items-center gap-3">

              {/* Split Bill */}
              <AppButton
                variant="outline"
                onClick={handleSplitBill}
                className="h-10 rounded-lg px-4 text-sm"
              >
                <Split
                  size={16}
                  strokeWidth={2.2}
                />

                {t.splitBill}
              </AppButton>

              {/* Quick Cash */}
              <AppButton
                variant="primary"
                onClick={handleQuickCash}
                className="h-10 rounded-lg px-4 text-sm"
              >
                <Banknote
                  size={16}
                  strokeWidth={2.3}
                />

                {t.quickCash}
              </AppButton>

              {/* Notification */}
              <button
                type="button"
                aria-label={t.notifications}
                onClick={handleNotification}
                className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Bell
                  size={20}
                  strokeWidth={2}
                />

                <span className="absolute right-[8px] top-[7px] h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-600" />
              </button>

              {/* Avatar */}
              <button
                type="button"
                aria-label={t.editProfile}
                onClick={openProfileModal}
                className="ml-1 overflow-hidden rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-9 w-9 object-cover"
                />
              </button>
            </div>
          </header>

          {/* =================================================
              WORKSPACE
          ================================================== */}

          <section className="min-h-0 flex-1 overflow-auto px-7 py-7 xl:px-8">
            <div className="mx-auto grid max-w-[1500px] grid-cols-12 items-start gap-5">

              {/* =================================================
                  PROFILE CARD
              ================================================== */}

              <section className="col-span-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-7">

                <div className="flex items-center justify-between gap-5">

                  <div className="flex min-w-0 items-center gap-5">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="h-20 w-20 rounded-full border-2 border-slate-200 object-cover shadow-sm"
                      />

                      <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <h3 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 xl:text-3xl">
                        {profile.fullName}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100">
                          {profile.id}
                        </span>

                        <span className="text-sm font-medium text-slate-500">
                          {t.cashierRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit */}
                  <AppButton
                    variant="outline"
                    onClick={openProfileModal}
                    className="h-10 shrink-0 rounded-xl px-4 text-sm"
                  >
                    <Edit3
                      size={15}
                      strokeWidth={2}
                    />

                    {t.editProfile}
                  </AppButton>
                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* Profile Information */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2">

                  <InfoField
                    label={t.email}
                    value={profile.email}
                  />

                  <InfoField
                    label={t.phone}
                    value={profile.phone}
                  />

                  <InfoField
                    label={t.branch}
                    value={
                      isEnglish
                        ? "District 1, Ho Chi Minh City"
                        : profile.branch
                    }
                  />

                  <InfoField label={t.currentShift}>
                    <div className="flex items-center gap-2 text-base font-semibold text-slate-800 xl:text-lg">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />

                      <span>
                        {isEnglish
                          ? `${t.morningShift} (${profile.currentShift.startTime} - ${profile.currentShift.endTime})`
                          : `${profile.currentShift.name} (${profile.currentShift.startTime} - ${profile.currentShift.endTime})`}
                      </span>
                    </div>
                  </InfoField>
                </div>
              </section>

              {/* =================================================
                  RIGHT COLUMN
              ================================================== */}

              <div className="col-span-12 flex flex-col gap-5 xl:col-span-5">

                {/* =================================================
                    SECURITY
                ================================================== */}

                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <ShieldCheck
                        size={19}
                        strokeWidth={2.2}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900">
                        {t.accountSecurity}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {t.securityDescription}
                      </p>
                    </div>
                  </div>

                  <AppButton
                    variant="outline"
                    onClick={openPasswordModal}
                    className="mt-5 h-12 w-full rounded-xl text-sm"
                  >
                    {t.changePassword}

                    <ChevronRight
                      size={17}
                    />
                  </AppButton>
                </section>

                {/* =================================================
                    SYSTEM OPTIONS
                ================================================== */}

                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Settings2
                        size={19}
                        strokeWidth={2.2}
                      />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {t.systemOptions}
                    </h3>
                  </div>

                  <div className="mt-6 space-y-5">

                    {/* Language */}
                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {t.languageDisplay}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {t.posLanguage}
                        </p>
                      </div>

                      <div className="relative shrink-0">

                        <select
                          value={language === "en" ? "English" : "Tiếng Việt"}
                          onChange={
                            handleLanguageChange
                          }
                          aria-label={
                            t.languageDisplay
                          }
                          className="h-10 min-w-[125px] appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition-colors hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                          <option value="Tiếng Việt">
                            Tiếng Việt
                          </option>

                          <option value="English">
                            English
                          </option>
                        </select>

                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Notification Sound */}
                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {t.notificationSound}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {t.notificationDescription}
                        </p>
                      </div>

                      <ToggleSwitch
                        checked={
                          settings.notificationSound
                        }
                        onChange={(checked) =>
                          setSettings(
                            (previous) => ({
                              ...previous,
                              notificationSound:
                                checked,
                            })
                          )
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    LOGOUT
                ================================================== */}

                <div className="flex justify-end">
                  <AppButton
                    variant="danger"
                    onClick={handleLogout}
                    className="h-12 rounded-xl px-6 text-sm font-bold"
                  >
                    <LogOut
                      size={17}
                      strokeWidth={2.2}
                    />

                    {t.logout}
                  </AppButton>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* =======================================================
          EDIT PROFILE MODAL
      ======================================================= */}

      {isProfileModalOpen && (
        <ModalBackdrop onClose={closeProfileModal}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <User size={20} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {t.editPersonalInfo}
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.personalInfoDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeProfileModal}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">

              <FormInput
                label={t.fullName}
                value={profileForm.fullName}
                onChange={(value) => {
                  setProfileForm(
                    (previous) => ({
                      ...previous,
                      fullName: value,
                    })
                  );

                  if (value.trim()) {
                    setProfileError("");
                  }
                }}
                error={profileError}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <FormInput
                  label={t.email}
                  value={profileForm.email}
                  onChange={(value) =>
                    setProfileForm(
                      (previous) => ({
                        ...previous,
                        email: value,
                      })
                    )
                  }
                  type="email"
                />

                <FormInput
                  label={t.phone}
                  value={profileForm.phone}
                  onChange={(value) =>
                    setProfileForm(
                      (previous) => ({
                        ...previous,
                        phone: value,
                      })
                    )
                  }
                  type="tel"
                />
              </div>

              <FormInput
                label={t.branch}
                value={profileForm.branch}
                onChange={(value) =>
                  setProfileForm(
                    (previous) => ({
                      ...previous,
                      branch: value,
                    })
                  )
                }
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <AppButton
                variant="outline"
                onClick={closeProfileModal}
                className="h-11 rounded-xl px-5 text-sm"
              >
                {t.cancel}
              </AppButton>

              <AppButton
                variant="primary"
                onClick={handleSaveProfile}
                className="h-11 rounded-xl px-5 text-sm"
              >
                <Save size={16} />
                {t.saveChanges}
              </AppButton>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* =======================================================
          CHANGE PASSWORD MODAL
      ======================================================= */}

      {isPasswordModalOpen && (
        <ModalBackdrop onClose={closePasswordModal}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {t.changePasswordTitle}
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.changePasswordDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">

              <PasswordInput
                label={t.currentPassword}
                value={
                  passwordForm.currentPassword
                }
                onChange={(value) => {
                  setPasswordForm(
                    (previous) => ({
                      ...previous,
                      currentPassword: value,
                    })
                  );

                  if (value.trim()) {
                    setPasswordErrors(
                      (previous) => ({
                        ...previous,
                        currentPassword: "",
                      })
                    );
                  }
                }}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(
                    (previous) => !previous
                  )
                }
                placeholder={
                  t.passwordPlaceholder
                }
                error={
                  passwordErrors.currentPassword
                }
              />

              <PasswordInput
                label={t.newPassword}
                value={passwordForm.newPassword}
                onChange={(value) => {
                  setPasswordForm(
                    (previous) => ({
                      ...previous,
                      newPassword: value,
                    })
                  );

                  if (value.length >= 6) {
                    setPasswordErrors(
                      (previous) => ({
                        ...previous,
                        newPassword: "",
                      })
                    );
                  }
                }}
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(
                    (previous) => !previous
                  )
                }
                placeholder={
                  t.passwordPlaceholder
                }
                error={
                  passwordErrors.newPassword
                }
              />

              <PasswordInput
                label={t.confirmPassword}
                value={
                  passwordForm.confirmPassword
                }
                onChange={(value) => {
                  setPasswordForm(
                    (previous) => ({
                      ...previous,
                      confirmPassword: value,
                    })
                  );

                  if (
                    value ===
                    passwordForm.newPassword
                  ) {
                    setPasswordErrors(
                      (previous) => ({
                        ...previous,
                        confirmPassword: "",
                      })
                    );
                  }
                }}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                placeholder={
                  t.passwordPlaceholder
                }
                error={
                  passwordErrors.confirmPassword
                }
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <AppButton
                variant="outline"
                onClick={closePasswordModal}
                className="h-11 rounded-xl px-5 text-sm"
              >
                {t.cancel}
              </AppButton>

              <AppButton
                variant="primary"
                onClick={handlePasswordSubmit}
                className="h-11 rounded-xl px-5 text-sm"
              >
                <ShieldCheck size={16} />
                {t.updatePassword}
              </AppButton>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* =======================================================
          TOAST
      ======================================================= */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-xl">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold">
            ✓
          </span>

          {toastMessage}
        </div>
      )}
    </div>
  );
}