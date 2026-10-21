import { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  History,
  Layers,
  Loader2,
  Package,
  PackageCheck,
  PackagePlus,
  PackageX,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryService,
  type InventoryItem,
  type CreateInventoryPayload,
  type UpdateInventoryPayload,
  type AdjustStockPayload,
  type CreateReceiptPayload,
} from "@/services/modules/inventoryService";
import { suppliersService } from "@/services/modules/suppliersService";
import { useManagerLocale } from "@/contexts/ManagerLocaleContext";

const CATEGORIES = [
  { key: "ALL", vi: "Tất cả danh mục", en: "All Categories" },
  { key: "Hải sản tươi", vi: "Hải sản tươi", en: "Fresh Seafood" },
  { key: "Thịt các loại", vi: "Thịt các loại", en: "Meats & Beef" },
  { key: "Gia cầm & Trứng", vi: "Gia cầm & Trứng", en: "Poultry & Eggs" },
  { key: "Rau củ & Nấm", vi: "Rau củ & Nấm", en: "Vegetables & Mushrooms" },
  { key: "Bơ sữa & Phô mai", vi: "Bơ sữa & Phô mai", en: "Dairy & Cheese" },
  { key: "Đồ khô & Bột", vi: "Đồ khô & Bột", en: "Dry Goods & Flour" },
  { key: "Gia vị & Sốt", vi: "Gia vị & Sốt", en: "Spices & Sauces" },
  { key: "Khác", vi: "Khác", en: "Other" },
];

const STATUS_FILTERS = [
  { key: "ALL", vi: "Tất cả trạng thái", en: "All Statuses" },
  { key: "OK", vi: "Còn hàng", en: "In Stock" },
  { key: "LOW", vi: "Sắp hết", en: "Low Stock" },
  { key: "OUT", vi: "Hết hàng", en: "Out of Stock" },
];

export default function InventoryView() {
  const { isEn, t } = useManagerLocale();
  const queryClient = useQueryClient();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState<CreateInventoryPayload>({
    itemName: "",
    unit: "kg",
    currentStock: 10,
    minAlertThreshold: 5,
    category: "Rau củ & Nấm",
    sku: "",
  });

  const [adjustForm, setAdjustForm] = useState<{ delta: number; type: string; note: string }>({
    delta: 5,
    type: "IN_RECEIPT",
    note: "",
  });

  const [receiptForm, setReceiptForm] = useState<{
    supplierName: string;
    items: { inventoryItemId: string; quantity: number; unitPrice: number }[];
  }>({
    supplierName: "",
    items: [{ inventoryItemId: "", quantity: 10, unitPrice: 50000 }],
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Queries
  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: inventoryService.getAll,
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["inventory-receipts"],
    queryFn: inventoryService.getReceipts,
  });

  const { data: suppliersList = [] } = useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => suppliersService.getAll(),
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (payload: CreateInventoryPayload) => inventoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsAddModalOpen(false);
      resetItemForm();
      showToast(t("Thêm nguyên liệu thành công!", "Ingredient added successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể thêm nguyên liệu.", "Failed to add ingredient.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInventoryPayload }) =>
      inventoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setEditTarget(null);
      resetItemForm();
      showToast(t("Cập nhật nguyên liệu thành công!", "Ingredient updated successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể cập nhật nguyên liệu.", "Failed to update ingredient.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setDeleteTarget(null);
      showToast(t("Đã xóa nguyên liệu.", "Ingredient deleted successfully."), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể xóa nguyên liệu.", "Failed to delete ingredient.");
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdjustStockPayload }) =>
      inventoryService.adjustStock(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setAdjustTarget(null);
      showToast(t("Điều chỉnh số lượng tồn kho thành công!", "Stock level adjusted successfully!"), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể điều chỉnh tồn kho.", "Failed to adjust stock.");
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: (payload: CreateReceiptPayload) => inventoryService.createReceipt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] });
      setIsReceiptModalOpen(false);
      showToast(t("Tạo phiếu nhập kho thành công! Tồn kho đã được cộng dồn.", "Stock receipt created successfully! Inventory updated."), "success");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t("Không thể tạo phiếu nhập kho.", "Failed to create stock receipt.");
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const resetItemForm = () => {
    setItemForm({
      itemName: "",
      unit: "kg",
      currentStock: 10,
      minAlertThreshold: 5,
      category: "Rau củ & Nấm",
      sku: "",
    });
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetItemForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditTarget(item);
    setItemForm({
      itemName: item.itemName || item.name,
      unit: item.unit,
      minAlertThreshold: item.minAlertThreshold,
      category: item.category || "Khác",
      sku: item.sku || "",
    });
    setFormError(null);
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setAdjustTarget(item);
    setAdjustForm({
      delta: 5,
      type: "IN_RECEIPT",
      note: "",
    });
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!itemForm.itemName.trim()) {
      setFormError(t("Vui lòng nhập tên nguyên liệu.", "Please enter ingredient name."));
      return;
    }
    if (!itemForm.unit.trim()) {
      setFormError(t("Vui lòng nhập đơn vị tính (kg, g, lít...).", "Please enter measurement unit."));
      return;
    }

    if (editTarget) {
      updateItemMutation.mutate({
        id: editTarget.id,
        payload: {
          itemName: itemForm.itemName.trim(),
          unit: itemForm.unit.trim(),
          minAlertThreshold: Number(itemForm.minAlertThreshold),
          category: itemForm.category,
          sku: itemForm.sku?.trim() || undefined,
        },
      });
    } else {
      createItemMutation.mutate({
        itemName: itemForm.itemName.trim(),
        unit: itemForm.unit.trim(),
        currentStock: Number(itemForm.currentStock) || 0,
        minAlertThreshold: Number(itemForm.minAlertThreshold) || 0,
        category: itemForm.category,
        sku: itemForm.sku?.trim() || undefined,
      });
    }
  };

  const handleSubmitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    let delta = Number(adjustForm.delta);
    if (adjustForm.type === "WASTE_SPOILED") {
      delta = -Math.abs(delta);
    } else if (adjustForm.type === "IN_RECEIPT") {
      delta = Math.abs(delta);
    }

    adjustStockMutation.mutate({
      id: adjustTarget.id,
      payload: {
        deltaQuantity: delta,
        movementType: adjustForm.type as any,
        note: adjustForm.note.trim() || undefined,
      },
    });
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validItems = receiptForm.items.filter((it) => it.inventoryItemId && it.quantity > 0);
    if (validItems.length === 0) {
      setFormError(t("Vui lòng chọn ít nhất 1 nguyên liệu hợp lệ để nhập kho.", "Please select at least 1 valid ingredient."));
      return;
    }

    createReceiptMutation.mutate({
      supplierName: receiptForm.supplierName.trim() || undefined,
      details: validItems.map((it) => ({
        inventoryItemId: it.inventoryItemId,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice) || 0,
      })),
    });
  };

  const handleAddReceiptItem = () => {
    setReceiptForm({
      ...receiptForm,
      items: [...receiptForm.items, { inventoryItemId: "", quantity: 5, unitPrice: 50000 }],
    });
  };

  const handleRemoveReceiptItem = (index: number) => {
    setReceiptForm({
      ...receiptForm,
      items: receiptForm.items.filter((_, idx) => idx !== index),
    });
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch =
        !q ||
        item.itemName?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q);
      const catMatch = selectedCategory === "ALL" || item.category === selectedCategory;

      let statusMatch = true;
      if (selectedStatus === "OK") {
        statusMatch = item.currentStock > item.minAlertThreshold;
      } else if (selectedStatus === "LOW") {
        statusMatch = item.currentStock > 0 && item.currentStock <= item.minAlertThreshold;
      } else if (selectedStatus === "OUT") {
        statusMatch = item.currentStock <= 0;
      }

      return nameMatch && catMatch && statusMatch;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    let low = 0;
    let out = 0;
    let ok = 0;

    for (const it of items) {
      if (it.currentStock <= 0) out++;
      else if (it.currentStock <= it.minAlertThreshold) low++;
      else ok++;
    }

    return { total, low, out, ok };
  }, [items]);

  // CSV Export
  const handleExportCsv = () => {
    if (!items.length) return;
    const headers = ["ID", "SKU", "Ingredient Name", "Category", "Current Stock", "Unit", "Min Alert Threshold", "Status"];
    const rows = items.map((it) => {
      let st = "In Stock";
      if (it.currentStock <= 0) st = "Out of Stock";
      else if (it.currentStock <= it.minAlertThreshold) st = "Low Stock";

      return [
        it.id,
        `"${it.sku || ""}"`,
        `"${(it.itemName || it.name).replace(/"/g, '""')}"`,
        `"${(it.category || "").replace(/"/g, '""')}"`,
        it.currentStock,
        it.unit,
        it.minAlertThreshold,
        st,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROMS_Inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t("Đã xuất danh sách kho ra file CSV!", "Inventory CSV exported!"), "success");
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
            {t("QUẢN LÝ KHO & ĐỊNH LƯỢNG NGUYÊN LIỆU", "INVENTORY & INGREDIENTS TRACKING")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1714] tracking-tight flex items-center gap-2.5">
            <Package className="text-[#ea580c]" size={28} />
            {t("Kho Nguyên Liệu & Tồn Kho", "Inventory & Stock Levels")}
          </h1>
          <p className="text-sm text-[#7a736c] mt-1 max-w-2xl leading-relaxed">
            {t(
              "Giám sát số lượng tồn kho theo thời gian thực, thiết lập cảnh báo nguyên liệu sắp hết và quản lý phiếu nhập hàng trực tiếp với cơ sở dữ liệu.",
              "Monitor live ingredient stock balances, minimum alert thresholds, and process warehouse inbound receipts with real-time database sync."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#d5cec5] bg-white hover:bg-[#faf8f5] text-sm font-semibold text-[#423d37] shadow-sm transition cursor-pointer"
          >
            <History size={16} />
            <span>{t("Lịch sử nhập kho", "Receipts Log")}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#d5cec5] bg-white hover:bg-[#faf8f5] text-sm font-semibold text-[#423d37] shadow-sm transition cursor-pointer disabled:opacity-40"
          >
            <Download size={16} />
            <span>{t("Xuất CSV", "Export CSV")}</span>
          </button>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition cursor-pointer"
          >
            <PackagePlus size={18} />
            <span>{t("Nhập kho", "Stock In")}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-sm font-semibold text-white shadow-md shadow-orange-900/15 transition cursor-pointer"
          >
            <Plus size={18} />
            <span>{t("Thêm nguyên liệu", "Add Item")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c] flex-shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Tổng mặt hàng", "Total Ingredients")}
            </p>
            <p className="text-2xl font-black text-[#1a1714] mt-0.5">{stats.total}</p>
            <p className="text-xs text-[#7a736c] mt-0.5">{t("Đang quản lý", "In catalog")}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Cảnh báo sắp hết", "Low Stock Alert")}
            </p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{stats.low}</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">{t("Cần nhập thêm", "Needs reorder")}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
            <PackageX size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Hết hàng", "Out of Stock")}
            </p>
            <p className="text-2xl font-black text-red-600 mt-0.5">{stats.out}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">{t("Tồn kho = 0", "Zero balance")}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e7e2dc] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <PackageCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a736c] uppercase tracking-wider">
              {t("Đủ tồn kho", "Healthy Stock")}
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.ok}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">{t("Đạt ngưỡng an toàn", "Above threshold")}</p>
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
              placeholder={t("Tìm theo tên nguyên liệu, mã SKU...", "Search by ingredient name, SKU code...")}
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

          <div className="flex items-center gap-2.5 overflow-x-auto">
            {/* Category Filter */}
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-sm font-medium text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
            >
              {STATUS_FILTERS.map((st) => (
                <option key={st.key} value={st.key}>
                  {isEn ? st.en : st.vi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-[#e7e2dc] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e7e2dc] bg-[#faf8f5] text-xs font-bold text-[#7a736c] uppercase tracking-wider">
                <th className="py-4 px-5">{t("Nguyên liệu", "Ingredient")}</th>
                <th className="py-4 px-4">{t("Danh mục", "Category")}</th>
                <th className="py-4 px-4">{t("Mã SKU", "SKU")}</th>
                <th className="py-4 px-4 text-right">{t("Tồn kho hiện tại", "Current Stock")}</th>
                <th className="py-4 px-3 text-center">{t("Đơn vị", "Unit")}</th>
                <th className="py-4 px-4 text-right">{t("Cảnh báo tối thiểu", "Min Alert")}</th>
                <th className="py-4 px-4 text-center">{t("Trạng thái", "Status")}</th>
                <th className="py-4 px-5 text-right">{t("Thao tác", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#7a736c]">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#ea580c] mb-2" />
                    <span>{t("Đang tải dữ liệu nguyên liệu từ database...", "Loading inventory from database...")}</span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-600">
                    <p>{t("Lỗi tải dữ liệu kho. Vui lòng thử lại.", "Failed to load inventory.")}</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800"
                    >
                      {t("Thử lại", "Retry")}
                    </button>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#7a736c]">
                    <Package size={38} className="mx-auto text-stone-300 mb-2 stroke-[1.5]" />
                    <p className="text-base font-bold text-[#1a1714]">
                      {t("Không tìm thấy nguyên liệu nào", "No ingredients found")}
                    </p>
                    <p className="text-xs text-[#7a736c] mt-1">
                      {searchTerm
                        ? t("Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc", "Try adjusting search query or filters")
                        : t("Bấm nút 'Thêm nguyên liệu' để tạo bản ghi đầu tiên", "Click 'Add Item' to create an ingredient")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOutOfStock = item.currentStock <= 0;
                  const isLowStock = !isOutOfStock && item.currentStock <= item.minAlertThreshold;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#fbf9f6] transition-colors group text-[#1a1714]"
                    >
                      {/* Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center font-extrabold text-[#ea580c] text-xs flex-shrink-0">
                            {(item.itemName || item.name)?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#1a1714] group-hover:text-[#ea580c] transition">
                              {item.itemName || item.name}
                            </p>
                            <span className="text-[11px] text-stone-400 font-mono">
                              ID: {item.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f5f2ed] text-[#5c544d] border border-[#e5e0d8]">
                          {item.category || "Khác"}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-4 font-mono text-xs font-medium text-[#7a736c] whitespace-nowrap">
                        {item.sku || `ING-${item.id.slice(0, 6).toUpperCase()}`}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`text-base font-extrabold ${
                            isOutOfStock
                              ? "text-red-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {Number(item.currentStock).toFixed(2)}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold">
                          {item.unit}
                        </span>
                      </td>

                      {/* Min Alert */}
                      <td className="py-4 px-4 text-right font-mono text-[#7a736c] whitespace-nowrap">
                        {Number(item.minAlertThreshold).toFixed(2)} {item.unit}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {t("Hết hàng", "Out of Stock")}
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            {t("Sắp hết", "Low Stock")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {t("Còn hàng", "In Stock")}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-xs font-bold text-[#ea580c] transition border border-orange-200"
                            title={t("Điều chỉnh tồn kho", "Quick Adjust Stock")}
                          >
                            <RefreshCw size={13} />
                            <span>{t("Kiểm kê", "Adjust")}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-[#ea580c] hover:bg-orange-50 transition"
                            title={t("Chỉnh sửa", "Edit")}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition"
                            title={t("Xóa nguyên liệu", "Delete")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3.5 bg-[#faf8f5] border-t border-[#e7e2dc] flex items-center justify-between text-xs text-[#7a736c]">
          <span>
            {t("Hiển thị", "Showing")}: <strong className="text-[#1a1714]">{filteredItems.length}</strong> /{" "}
            {items.length} {t("nguyên liệu", "ingredients")}
          </span>
          <span className="text-[#8c827a]">
            {t("Đồng bộ trực tiếp với Database PostgreSQL", "Real-time PostgreSQL sync")}
          </span>
        </div>
      </div>

      {/* ── Modal Add / Edit Ingredient ── */}
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
                <Package size={20} className="text-[#ea580c]" />
                {editTarget
                  ? t("Chỉnh sửa Nguyên liệu", "Edit Ingredient")
                  : t("Thêm Nguyên liệu mới", "Add New Ingredient")}
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

            <form onSubmit={handleSubmitItem} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Tên nguyên liệu *", "Ingredient Name *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                    placeholder="VD: Thịt thăn bò Úc Premium"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Danh mục *", "Category *")}
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
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
                    {t("Đơn vị tính *", "Unit *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="kg, gram, lon, chai, gói..."
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                {!editTarget && (
                  <div>
                    <label className="block text-xs font-bold text-[#423d37] mb-1">
                      {t("Tồn kho ban đầu", "Initial Stock")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemForm.currentStock}
                      onChange={(e) => setItemForm({ ...itemForm, currentStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Ngưỡng cảnh báo tối thiểu", "Min Alert Threshold")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.minAlertThreshold}
                    onChange={(e) => setItemForm({ ...itemForm, minAlertThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#423d37] mb-1">
                    {t("Mã SKU (tùy chọn)", "SKU Code (optional)")}
                  </label>
                  <input
                    type="text"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    placeholder="VD: ING-BEEF-01"
                    className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-[#ea580c] font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e7e2dc] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditTarget(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-[#423d37] hover:bg-[#f5f2ed] transition font-semibold"
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold shadow-md shadow-orange-900/15 transition disabled:opacity-50"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t("Đang lưu...", "Saving...")}</span>
                    </>
                  ) : (
                    <span>{editTarget ? t("Lưu thay đổi", "Save Changes") : t("Thêm nguyên liệu", "Add Item")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Quick Adjust Stock ── */}
      {adjustTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setAdjustTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-[#e7e2dc] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2dc] mb-4">
              <h3 className="text-lg font-bold text-[#1a1714] flex items-center gap-2">
                <RefreshCw size={18} className="text-amber-600" />
                {t("Kiểm kê / Điều chỉnh tồn kho", "Adjust Stock Level")}
              </h3>
              <button onClick={() => setAdjustTarget(null)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-[#faf8f5] border border-[#e7e2dc] rounded-xl mb-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1a1714]">{adjustTarget.itemName || adjustTarget.name}</p>
                <p className="text-xs text-[#7a736c]">{adjustTarget.category} · {adjustTarget.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#7a736c] uppercase">{t("Hiện tại", "Current")}</p>
                <p className="text-lg font-extrabold text-[#ea580c] font-mono">
                  {Number(adjustTarget.currentStock).toFixed(2)} {adjustTarget.unit}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjust} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#423d37] mb-1">
                  {t("Loại điều chỉnh", "Adjustment Type")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: "IN_RECEIPT" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustForm.type === "IN_RECEIPT"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white border-[#d5cec5] text-[#7a736c]"
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    <span>{t("+ Nhập thêm", "+ Stock In")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: "WASTE_SPOILED" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustForm.type === "WASTE_SPOILED"
                        ? "bg-red-50 border-red-300 text-red-800"
                        : "bg-white border-[#d5cec5] text-[#7a736c]"
                    }`}
                  >
                    <ArrowDownRight size={14} />
                    <span>{t("- Hủy / Hao hụt", "- Waste / Spoiled")}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423d37] mb-1">
                  {t(`Số lượng (${adjustTarget.unit}) *`, `Quantity (${adjustTarget.unit}) *`)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={adjustForm.delta}
                  onChange={(e) => setAdjustForm({ ...adjustForm, delta: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] font-mono text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#423d37] mb-1">
                  {t("Lý do / Ghi chú", "Reason / Notes")}
                </label>
                <input
                  type="text"
                  value={adjustForm.note}
                  onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                  placeholder={t("VD: Kiểm kê định kỳ, bù hao hụt...", "E.g. Daily recount, damaged box...")}
                  className="w-full px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-[#e7e2dc] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-[#423d37] hover:bg-[#f5f2ed] font-semibold"
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-900/15 transition disabled:opacity-50"
                >
                  {adjustStockMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t("Đang cập nhật...", "Updating...")}</span>
                    </>
                  ) : (
                    <span>{t("Xác nhận kiểm kê", "Confirm Adjustment")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Inbound Stock Receipt ── */}
      {isReceiptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#e7e2dc] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2dc] mb-4">
              <h3 className="text-lg font-bold text-[#1a1714] flex items-center gap-2">
                <PackagePlus size={22} className="text-emerald-600" />
                {t("Tạo Phiếu Nhập Kho", "Create Stock In Receipt")}
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReceipt} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-[#423d37] mb-1">
                  {t("Nhà cung cấp (Chọn hoặc nhập tên)", "Supplier / Vendor")}
                </label>
                <div className="flex gap-2">
                  <select
                    value={receiptForm.supplierName}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">{t("-- Chọn Nhà cung cấp --", "-- Select Supplier --")}</option>
                    {suppliersList.map((sup) => (
                      <option key={sup.id} value={sup.name}>
                        {sup.name} ({sup.category})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t("Hoặc tự nhập tên NCC...", "Or type supplier name...")}
                    value={receiptForm.supplierName}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-[#fbf9f6] border border-[#d9d2c9] rounded-xl text-[#1a1714] placeholder-[#8c827a] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#423d37]">
                    {t("Danh sách nguyên liệu nhập kho *", "Receipt Items *")}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddReceiptItem}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> {t("Thêm dòng", "Add Line")}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {receiptForm.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#faf8f5] border border-[#e7e2dc] rounded-xl flex items-center gap-3"
                    >
                      <select
                        required
                        value={it.inventoryItemId}
                        onChange={(e) => {
                          const updated = [...receiptForm.items];
                          updated[idx].inventoryItemId = e.target.value;
                          setReceiptForm({ ...receiptForm, items: updated });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-[#d9d2c9] rounded-lg text-xs text-[#1a1714] focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">{t("-- Chọn nguyên liệu --", "-- Select Item --")}</option>
                        {items.map((raw) => (
                          <option key={raw.id} value={raw.id}>
                            {raw.itemName || raw.name} ({raw.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder={t("Số lượng", "Qty")}
                          value={it.quantity}
                          onChange={(e) => {
                            const updated = [...receiptForm.items];
                            updated[idx].quantity = parseFloat(e.target.value) || 0;
                            setReceiptForm({ ...receiptForm, items: updated });
                          }}
                          className="w-full px-2.5 py-2 bg-white border border-[#d9d2c9] rounded-lg text-xs text-[#1a1714] font-mono text-right"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          placeholder={t("Đơn giá", "Unit Price")}
                          value={it.unitPrice}
                          onChange={(e) => {
                            const updated = [...receiptForm.items];
                            updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                            setReceiptForm({ ...receiptForm, items: updated });
                          }}
                          className="w-full px-2.5 py-2 bg-white border border-[#d9d2c9] rounded-lg text-xs text-[#1a1714] font-mono text-right"
                        />
                      </div>

                      {receiptForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReceiptItem(idx)}
                          className="text-stone-400 hover:text-red-600 p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#5c544d] font-semibold">{t("Tổng tiền phiếu nhập:", "Total Receipt Cost:")}</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {receiptForm.items
                    .reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0)
                    .toLocaleString("vi-VN")}{" "}
                  VNĐ
                </span>
              </div>

              <div className="pt-4 border-t border-[#e7e2dc] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-[#423d37] hover:bg-[#f5f2ed] font-semibold"
                >
                  {t("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createReceiptMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-900/15 transition disabled:opacity-50"
                >
                  {createReceiptMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t("Đang tạo phiếu...", "Creating...")}</span>
                    </>
                  ) : (
                    <span>{t("Xác nhận nhập kho", "Confirm Stock Receipt")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Receipts History Log ── */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white border border-[#e7e2dc] rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2dc] mb-4 flex-shrink-0">
              <h3 className="text-lg font-bold text-[#1a1714] flex items-center gap-2">
                <History size={20} className="text-blue-600" />
                {t("Lịch sử Phiếu Nhập Kho", "Stock Inbound History")}
              </h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {receipts.length === 0 ? (
                <div className="py-12 text-center text-[#7a736c]">
                  <FileText size={38} className="mx-auto text-stone-300 mb-2 stroke-[1.5]" />
                  <p>{t("Chưa có phiếu nhập kho nào được tạo.", "No stock receipts recorded yet.")}</p>
                </div>
              ) : (
                receipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-[#faf8f5] border border-[#e7e2dc] rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.receiptCode}
                        </span>
                        <span className="font-bold text-[#1a1714] text-sm">
                          {rec.supplierName || t("Nhập kho nội bộ", "Internal Restock")}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 font-mono">
                        {Number(rec.totalCost).toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#7a736c]">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={12} /> {new Date(rec.createdAt).toLocaleString("vi-VN")}
                      </span>
                      {rec.managerName && (
                        <span>
                          {t("Người tạo", "Created by")}: <strong className="text-[#1a1714]">{rec.managerName}</strong>
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#e7e2dc] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rec.details.map((dt) => (
                        <div key={dt.id} className="p-2 bg-white rounded-lg border border-[#e7e2dc] flex justify-between">
                          <span className="text-[#423d37] font-medium">{dt.itemName}</span>
                          <span className="font-mono font-bold text-[#ea580c]">
                            +{dt.quantity} {dt.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#e7e2dc] flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#423d37] text-sm font-semibold"
              >
                {t("Đóng", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Delete Confirmation ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !deleteItemMutation.isPending && setDeleteTarget(null)}
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
                  {t("Xác nhận xóa nguyên liệu", "Delete Ingredient")}
                </h3>
                <p className="text-sm text-[#7a736c] mt-1">
                  {t(
                    `Bạn có chắc chắn muốn xóa "${deleteTarget.itemName || deleteTarget.name}" không? Thao tác này sẽ xóa vĩnh viễn khỏi kho.`,
                    `Are you sure you want to delete "${deleteTarget.itemName || deleteTarget.name}"? This cannot be undone.`
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#e7e2dc]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteItemMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-[#d5cec5] bg-white text-sm font-semibold text-[#423d37] hover:bg-[#f5f2ed]"
              >
                {t("Hủy bỏ", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => deleteItemMutation.mutate(deleteTarget.id)}
                disabled={deleteItemMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-md shadow-red-900/20"
              >
                {deleteItemMutation.isPending ? (
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