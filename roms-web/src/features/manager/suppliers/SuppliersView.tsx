import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  suppliersService,
  type Supplier,
  type CreateSupplierPayload,
  type UpdateSupplierPayload,
} from "@/services/modules/suppliersService";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

const CATEGORIES = [
  { key: "ALL", vi: "Tất cả danh mục", en: "All Categories" },
  { key: "Rau củ quả tươi", vi: "Rau củ quả tươi", en: "Fresh Produce" },
  { key: "Hải sản tươi", vi: "Hải sản tươi", en: "Fresh Seafood" },
  { key: "Gia cầm & Trứng", vi: "Gia cầm & Trứng", en: "Poultry & Eggs" },
  { key: "Thịt bò & Heo", vi: "Thịt bò & Heo", en: "Meat & Pork" },
  { key: "Bơ sữa & Phô mai", vi: "Bơ sữa & Phô mai", en: "Dairy & Cheese" },
  { key: "Gia vị & Thảo mộc", vi: "Gia vị & Thảo mộc", en: "Herbs & Spices" },
  { key: "Đồ khô & Gia vị truyền thống", vi: "Đồ khô & Bột", en: "Dry Goods & Seasoning" },
  { key: "Vật tư tiêu hao", vi: "Vật tư tiêu hao", en: "Disposables & Packaging" },
];

export default function SuppliersView() {
  const { isEn, t } = useManagerLocale();
  const queryClient = useQueryClient();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals & form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<CreateSupplierPayload>({
    name: "",
    category: "Rau củ quả tươi",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "ACTIVE",
    rating: 5.0,
    inFlightOrders: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Queries
  const {
    data: suppliers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", searchTerm, selectedCategory],
    queryFn: () => suppliersService.getAll(searchTerm, selectedCategory),
  });

  const { data: stats } = useQuery({
    queryKey: ["suppliers-stats"],
    queryFn: suppliersService.getStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplierPayload) => suppliersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-stats"] });
      setIsAddModalOpen(false);
      resetForm();
      showToast(t("Đăng ký nhà cung cấp thành công!", "Supplier registered successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể thêm nhà cung cấp.", "Failed to add supplier.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      suppliersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-stats"] });
      setEditTarget(null);
      resetForm();
      showToast(t("Cập nhật nhà cung cấp thành công!", "Supplier updated successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể cập nhật nhà cung cấp.", "Failed to update supplier.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-stats"] });
      setDeleteTarget(null);
      showToast(t("Đã xóa nhà cung cấp.", "Supplier deleted successfully."), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể xóa nhà cung cấp.", "Failed to delete supplier.");
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Rau củ quả tươi",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      status: "ACTIVE",
      rating: 5.0,
      inFlightOrders: 0,
    });
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supplier) => {
    setEditTarget(sup);
    setFormData({
      name: sup.name,
      category: sup.category,
      contactPerson: sup.contactPerson || "",
      phone: sup.phone || "",
      email: sup.email || "",
      address: sup.address || "",
      status: sup.status || "ACTIVE",
      rating: sup.rating ?? 5.0,
      inFlightOrders: sup.inFlightOrders ?? 0,
    });
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError(t("Vui lòng nhập tên nhà cung cấp.", "Please enter supplier name."));
      return;
    }
    if (!formData.category.trim()) {
      setFormError(t("Vui lòng chọn danh mục nguyên liệu.", "Please select category."));
      return;
    }

    if (editTarget) {
      updateMutation.mutate({
        id: editTarget.id,
        payload: {
          name: formData.name.trim(),
          category: formData.category.trim(),
          contactPerson: formData.contactPerson?.trim() || undefined,
          phone: formData.phone?.trim() || undefined,
          email: formData.email?.trim() || undefined,
          address: formData.address?.trim() || undefined,
          status: formData.status,
          rating: Number(formData.rating),
          inFlightOrders: Number(formData.inFlightOrders),
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name.trim(),
        category: formData.category.trim(),
        contactPerson: formData.contactPerson?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        status: formData.status,
        rating: Number(formData.rating),
        inFlightOrders: Number(formData.inFlightOrders),
      });
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!suppliers.length) return;
    const headers = [
      "ID",
      "Supplier Name",
      "Category",
      "Contact Person",
      "Phone",
      "Email",
      "Address",
      "Status",
      "Rating",
      "In Flight Orders",
    ];
    const rows = suppliers.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      `"${(s.contactPerson || "").replace(/"/g, '""')}"`,
      `"${s.phone || ""}"`,
      `"${s.email || ""}"`,
      `"${(s.address || "").replace(/"/g, '""')}"`,
      s.status,
      s.rating,
      s.inFlightOrders,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROMS_Suppliers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t("Đã xuất danh sách nhà cung cấp CSV!", "Suppliers CSV exported!"), "success");
  };

  return (
    <div className="min-h-full bg-[#f7f5f2] text-[#1a1714] p-7 sm:p-9 font-sans space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-900/10"
              : "bg-red-50 border-red-200 text-red-800 shadow-red-900/10"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1">
        <div>
          <p className="text-[#ea580c] text-[11.5px] font-extrabold tracking-[0.12em] uppercase mb-1">
            {t("ĐỐI TÁC VẬN HÀNH & NGUỒN CUNG", "SUPPLY CHAIN & LOGISTICS")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1714] tracking-tight flex items-center gap-2.5">
            <Store className="text-[#ea580c]" size={28} />
            {t("Nhà Cung Cấp & Đối Tác", "Suppliers & Vendors")}
          </h1>
          <p className="text-sm text-[#7a736c] mt-1 max-w-2xl leading-relaxed">
            {t(
              "Quản lý hợp đồng đối tác, phân loại ngành hàng nguyên liệu và theo dõi tiến độ giao nhận trong hệ thống ROMS.",
              "Manage vendor agreements, contact records, and monitor in-flight orders with live database records."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            disabled={suppliers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white hover:bg-[#faf8f5] text-sm font-semibold text-[#423d37] shadow-sm transition cursor-pointer disabled:opacity-40"
          >
            <Download size={16} />
            <span>{t("Xuất CSV", "Export CSV")}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-sm font-semibold text-white shadow-md shadow-orange-900/15 transition cursor-pointer"
          >
            <Plus size={18} />
            <span>{t("Đăng ký nhà cung cấp", "Register Supplier")}</span>
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c] flex-shrink-0">
            <Store size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Tổng nhà cung cấp", "Total Suppliers")}
            </p>
            <p className="text-2xl font-black text-[#1a1714] mt-0.5">
              {stats?.totalSuppliers ?? suppliers.length}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              {t("Hoạt động", "Active")}: {stats?.activeSuppliers ?? suppliers.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <ShoppingBasket size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Đơn chờ giao", "Pending Deliveries")}
            </p>
            <p className="text-2xl font-black text-[#1a1714] mt-0.5">
              {stats?.pendingDeliveries ?? 0}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">{t("Đang vận chuyển", "In-flight orders")}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Đối tác ưu tiên", "Preferred Vendors")}
            </p>
            <p className="text-2xl font-black text-[#1a1714] mt-0.5">
              {stats?.preferredVendors ?? suppliers.filter((s) => s.rating >= 4.8).length}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">≥ 4.8 ⭐ {t("chất lượng cao", "top rated")}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Tỷ lệ đáp ứng", "Fulfillment Rate")}
            </p>
            <p className="text-2xl font-black text-[#1a1714] mt-0.5">99.2%</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">{t("Chuẩn chỉ cam kết", "On-time delivery")}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e7e2dc] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("Tìm theo tên nhà cung cấp, người liên hệ, SĐT...", "Search vendor by name, contact, phone...")}
              className="w-full pl-10 pr-9 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-sm text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-sm font-medium text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {isEn ? cat.en : cat.vi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-[#e7e2dc] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e7e2dc] bg-[#faf8f5] text-xs font-bold text-[#7a736c] uppercase tracking-wider">
                <th className="py-4 px-5">{t("Nhà cung cấp", "Supplier Name")}</th>
                <th className="py-4 px-4">{t("Danh mục", "Category")}</th>
                <th className="py-4 px-4">{t("Người liên hệ & SĐT", "Contact Person & Phone")}</th>
                <th className="py-4 px-4">{t("Email / Địa chỉ", "Email & Address")}</th>
                <th className="py-4 px-3 text-center">{t("Đơn chờ", "In-Flight")}</th>
                <th className="py-4 px-4 text-center">{t("Đánh giá", "Rating")}</th>
                <th className="py-4 px-3 text-center">{t("Trạng thái", "Status")}</th>
                <th className="py-4 px-5 text-right">{t("Thao tác", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#7a736c]">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#ea580c] mb-2" />
                    <span>{t("Đang tải dữ liệu nhà cung cấp từ database...", "Loading suppliers from database...")}</span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-600">
                    <p>{t("Lỗi tải dữ liệu. Vui lòng thử lại.", "Failed to load suppliers.")}</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800"
                    >
                      {t("Thử lại", "Retry")}
                    </button>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#7a736c]">
                    <Store size={38} className="mx-auto text-stone-300 mb-2 stroke-[1.5]" />
                    <p className="text-base font-bold text-[#1a1714]">
                      {t("Không tìm thấy nhà cung cấp nào", "No suppliers found")}
                    </p>
                    <p className="text-xs text-[#7a736c] mt-1">
                      {searchTerm
                        ? t("Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc danh mục", "Try adjusting your search query or category filter")
                        : t("Bấm nút 'Đăng ký nhà cung cấp' để tạo đối tác đầu tiên", "Click 'Register Supplier' to add your first vendor")}
                    </p>
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-[#fbf9f6] transition-colors group text-[#1a1714]"
                  >
                    {/* Name & Badge */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center font-extrabold text-[#ea580c] text-sm flex-shrink-0">
                          {sup.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#1a1714] group-hover:text-[#ea580c] transition truncate max-w-[210px]">
                            {sup.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <Check size={11} /> {t("Đã xác thực", "Verified Vendor")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category Tag */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f5f2ed] text-[#5c544d] border border-[#e5e0d8]">
                        {sup.category}
                      </span>
                    </td>

                    {/* Contact Person & Phone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-[#1a1714]">{sup.contactPerson || "---"}</p>
                      {sup.phone ? (
                        <a
                          href={`tel:${sup.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs text-[#7a736c] hover:text-[#ea580c] transition font-medium"
                        >
                          <Phone size={12} /> {sup.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400">---</span>
                      )}
                    </td>

                    {/* Email / Address */}
                    <td className="py-4 px-4 max-w-[230px]">
                      {sup.email && (
                        <p className="text-xs text-[#423d37] flex items-center gap-1.5 truncate">
                          <Mail size={12} className="text-[#8c827a] flex-shrink-0" />
                          <span className="truncate">{sup.email}</span>
                        </p>
                      )}
                      {sup.address && (
                        <p className="text-xs text-[#7a736c] flex items-center gap-1.5 truncate mt-0.5">
                          <MapPin size={12} className="text-[#8c827a] flex-shrink-0" />
                          <span className="truncate">{sup.address}</span>
                        </p>
                      )}
                      {!sup.email && !sup.address && <span className="text-xs text-stone-400">---</span>}
                    </td>

                    {/* In-Flight Orders */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-extrabold ${
                          sup.inFlightOrders > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {sup.inFlightOrders}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        {Number(sup.rating || 5).toFixed(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          sup.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {sup.status === "ACTIVE" ? t("Hoạt động", "Active") : t("Tạm dừng", "Inactive")}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(sup)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-[#ea580c] hover:bg-orange-50 transition"
                          title={t("Chỉnh sửa", "Edit")}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sup)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition"
                          title={t("Xóa nhà cung cấp", "Delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3.5 bg-[#faf8f5] border-t border-[#e7e2dc] flex items-center justify-between text-xs text-[#7a736c]">
          <span>
            {t("Tổng cộng", "Total")}: <strong className="text-[#1a1714]">{suppliers.length}</strong>{" "}
            {t("nhà cung cấp", "suppliers")}
          </span>
          <span className="text-[#8c827a]">
            {t("Đồng bộ trực tiếp với Database PostgreSQL", "Synced with PostgreSQL database")}
          </span>
        </div>
      </div>

      {/* ── Modal Add / Edit Supplier ── */}
      {(isAddModalOpen || editTarget) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsAddModalOpen(false);
            setEditTarget(null);
          }}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#e7e2dc] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ea580c]" />

            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2dc] mb-4">
              <h3 className="text-lg font-bold text-[#1a1714] flex items-center gap-2">
                <Store size={20} className="text-[#ea580c]" />
                {editTarget
                  ? t("Chỉnh sửa Nhà cung cấp", "Edit Supplier")
                  : t("Đăng ký Nhà cung cấp mới", "Register New Supplier")}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditTarget(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Tên nhà cung cấp *", "Supplier Name *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Green Meadow Farms"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Danh mục nguyên liệu *", "Category *")}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                  >
                    {CATEGORIES.filter((c) => c.key !== "ALL").map((c) => (
                      <option key={c.key} value={c.key}>
                        {isEn ? c.en : c.vi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Người liên hệ", "Contact Person")}
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Số điện thoại", "Phone Number")}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Email liên hệ", "Email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@supplier.com"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Địa chỉ trụ sở / kho", "Address")}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="VD: 123 Đường Nông Trại, Đà Lạt"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Đánh giá sao (1.0 - 5.0)", "Rating")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Đơn hàng đang giao", "In-Flight Orders")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.inFlightOrders}
                    onChange={(e) => setFormData({ ...formData, inFlightOrders: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Trạng thái hợp tác", "Status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="ACTIVE">{t("Hoạt động bình thường (ACTIVE)", "Active Vendor")}</option>
                    <option value="INACTIVE">{t("Tạm ngừng hợp tác (INACTIVE)", "Inactive Vendor")}</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#e7e2dc] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditTarget(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-[#423d37] hover:bg-[#f5f2ed] transition cursor-pointer font-semibold"
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold shadow-md shadow-orange-900/15 transition cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t("Đang lưu...", "Saving...")}</span>
                    </>
                  ) : (
                    <span>{editTarget ? t("Lưu thay đổi", "Save Changes") : t("Đăng ký ngay", "Register")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Delete Confirmation ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !deleteMutation.isPending && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-[#e7e2dc] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                <Trash2 size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1a1714]">
                  {t("Xác nhận xóa nhà cung cấp", "Delete Supplier")}
                </h3>
                <p className="text-sm text-[#7a736c] mt-1">
                  {t(
                    `Bạn có chắc chắn muốn xóa "${deleteTarget.name}" không? Thao tác này sẽ xóa vĩnh viễn nhà cung cấp khỏi hệ thống.`,
                    `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#e7e2dc]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-sm font-semibold text-[#423d37] hover:bg-[#f5f2ed]"
              >
                {t("Hủy bỏ", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-md shadow-red-900/20"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t("Đang xóa...", "Deleting...")}</span>
                  </>
                ) : (
                  <span>{t("Xác nhận xóa", "Confirm Delete")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}