import React, { useState, useMemo } from 'react'
import {
  Plus,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Utensils,
  TrendingUp,
  Eye,
  EyeOff,
  Percent,
  ChefHat,
  Package,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuService } from '../../../services/modules/menuService'
import { inventoryService } from '../../../services/modules/inventoryService'
import { useManagerLocale } from '../../../contexts/ManagerLocaleContext'
import type { MenuItem, MenuCategory, CreateMenuItemPayload, MenuRecipe } from '../../../types/menu.types'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'

interface RecipeDraftItem {
  inventoryItemId: string
  itemName: string
  unit: string
  currentStock: number
  minAlertThreshold: number
  quantityRequired: number
}

function MenuView() {
  const queryClient = useQueryClient()
  const { t, isEn } = useManagerLocale()

  // 1. Fetch Dishes & Categories
  const {
    data: dishes = [],
    isLoading: loadingDishes,
    isError: errorDishes,
    refetch: refetchDishes,
  } = useQuery<MenuItem[]>({
    queryKey: ['menu-items'],
    queryFn: menuService.getAll,
  })

  const { data: categories = [] } = useQuery<MenuCategory[]>({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  })

  // Fetch Inventory items for Recipe BOM
  const { data: rawInventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () =>
      inventoryService.getAll().then((res) => {
        return Array.isArray(res) ? res : ((res as any).data || [])
      }),
  })

  // Normalize inventory items
  const inventoryItems = useMemo(() => {
    return (rawInventoryItems as any[]).map((item) => ({
      id: item.id,
      name: item.itemName || item.name || (isEn ? 'Ingredient' : 'Nguyên liệu'),
      unit: item.unit || (isEn ? 'unit' : 'đơn vị'),
      currentStock: Number(item.currentStock || 0),
      minAlertThreshold: Number(item.minAlertThreshold || item.minStockLevel || 0),
    }))
  }, [rawInventoryItems, isEn])

  // 2. States for Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'LOW_STOCK' | 'RECOMMENDED'>('ALL')

  // 3. Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)

  // Recipe (BOM) Modal State
  const [recipeModalItem, setRecipeModalItem] = useState<MenuItem | null>(null)
  const [recipeDraft, setRecipeDraft] = useState<RecipeDraftItem[]>([])
  const [newIngredientId, setNewIngredientId] = useState<string>('')
  const [newIngredientQuantity, setNewIngredientQuantity] = useState<number>(0.1)
  const [recipeError, setRecipeError] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formPrice, setFormPrice] = useState<number>(0)
  const [formCostPrice, setFormCostPrice] = useState<number>(0)
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsAvailable, setFormIsAvailable] = useState(true)
  const [formIsRecommendable, setFormIsRecommendable] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // 4. Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => menuService.create(payload),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      showToast(
        t(`Đã thêm món "${newItem.name}" thành công!`, `Menu item "${newItem.name}" created successfully!`),
        'success'
      )
      closeFormModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || (isEn ? 'Failed to create menu item' : 'Không thể tạo món mới')
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMenuItemPayload> }) =>
      menuService.update(id, payload),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      showToast(
        t(`Đã cập nhật món "${updatedItem.name}" thành công!`, `Menu item "${updatedItem.name}" updated successfully!`),
        'success'
      )
      closeFormModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || (isEn ? 'Failed to update menu item' : 'Không thể cập nhật món ăn')
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      showToast(t('Đã xóa món ăn khỏi thực đơn!', 'Item deleted from menu successfully!'), 'success')
      setDeletingItem(null)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || (isEn ? 'Failed to delete menu item' : 'Không thể xóa món ăn')
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error')
    },
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuService.toggleAvailability(id, isAvailable),
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: ['menu-items'] })
      const previousDishes = queryClient.getQueryData<MenuItem[]>(['menu-items'])
      queryClient.setQueryData<MenuItem[]>(['menu-items'], (old = []) =>
        old.map((d) => (d.id === id ? { ...d, isAvailable } : d))
      )
      return { previousDishes }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDishes) {
        queryClient.setQueryData(['menu-items'], context.previousDishes)
      }
      showToast(isEn ? 'Error updating item availability' : 'Lỗi khi đổi trạng thái món ăn', 'error')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      showToast(
        data.isAvailable
          ? t(`Đã bật phục vụ món "${data.name}"`, `"${data.name}" is now marked as In Stock`)
          : t(`Đã chuyển "${data.name}" sang trạng thái hết món`, `"${data.name}" is now marked as Out of Stock`),
        'success'
      )
    },
  })

  const updateRecipesMutation = useMutation({
    mutationFn: ({
      id,
      recipes,
    }: {
      id: string
      recipes: { inventoryItemId: string; quantityRequired: number }[]
    }) => menuService.updateRecipes(id, recipes),
    onSuccess: (updatedDish) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      showToast(
        t(
          `Đã lưu công thức định lượng cho món "${updatedDish.name}" thành công!`,
          `BOM recipes for "${updatedDish.name}" saved successfully!`
        ),
        'success'
      )
      closeRecipeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || (isEn ? 'Failed to save BOM recipe' : 'Không thể lưu công thức món ăn')
      setRecipeError(Array.isArray(msg) ? msg.join(', ') : msg)
    },
  })

  // 5. Open Modal Helpers
  const openCreateModal = () => {
    setEditingItem(null)
    setFormName('')
    setFormCategoryId(categories[0]?.id || '')
    setFormPrice(0)
    setFormCostPrice(0)
    setFormImageUrl('')
    setFormDescription('')
    setFormIsAvailable(true)
    setFormIsRecommendable(false)
    setFormError(null)
    setIsFormModalOpen(true)
  }

  const openEditModal = (dish: MenuItem) => {
    setEditingItem(dish)
    setFormName(dish.name)
    setFormCategoryId(dish.categoryId || dish.category?.id || '')
    setFormPrice(dish.price || 0)
    setFormCostPrice(dish.costPrice || 0)
    setFormImageUrl(dish.imageUrl || '')
    setFormDescription(dish.description || '')
    setFormIsAvailable(dish.isAvailable ?? true)
    setFormIsRecommendable(dish.isRecommendable ?? false)
    setFormError(null)
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    setIsFormModalOpen(false)
    setEditingItem(null)
    setFormError(null)
  }

  // Recipe Modal Helpers
  const openRecipeModal = (dish: MenuItem) => {
    setRecipeModalItem(dish)
    setRecipeError(null)
    setNewIngredientId('')
    setNewIngredientQuantity(0.1)

    // Populate current draft
    const draft: RecipeDraftItem[] = (dish.recipes || []).map((r: MenuRecipe) => ({
      inventoryItemId: r.inventoryItemId,
      itemName: r.itemName,
      unit: r.unit,
      currentStock: r.currentStock,
      minAlertThreshold: r.minAlertThreshold,
      quantityRequired: r.quantityRequired,
    }))
    setRecipeDraft(draft)
  }

  const closeRecipeModal = () => {
    setRecipeModalItem(null)
    setRecipeDraft([])
    setRecipeError(null)
  }

  const handleAddIngredientToDraft = () => {
    if (!newIngredientId) {
      setRecipeError(isEn ? 'Please choose an ingredient from inventory' : 'Vui lòng chọn một nguyên liệu từ kho')
      return
    }
    if (newIngredientQuantity <= 0) {
      setRecipeError(isEn ? 'Portion quantity must be greater than 0' : 'Định lượng phải lớn hơn 0')
      return
    }
    const inv = inventoryItems.find((i) => i.id === newIngredientId)
    if (!inv) return

    // Check duplicate
    if (recipeDraft.some((r) => r.inventoryItemId === newIngredientId)) {
      setRecipeError(isEn ? 'This ingredient is already in the recipe' : 'Nguyên liệu này đã có trong công thức')
      return
    }

    setRecipeDraft([
      ...recipeDraft,
      {
        inventoryItemId: inv.id,
        itemName: inv.name,
        unit: inv.unit,
        currentStock: inv.currentStock,
        minAlertThreshold: inv.minAlertThreshold,
        quantityRequired: Number(newIngredientQuantity),
      },
    ])
    setNewIngredientId('')
    setNewIngredientQuantity(0.1)
    setRecipeError(null)
  }

  const handleRemoveIngredientFromDraft = (inventoryItemId: string) => {
    setRecipeDraft(recipeDraft.filter((r) => r.inventoryItemId !== inventoryItemId))
  }

  const handleQuantityChangeInDraft = (inventoryItemId: string, newQty: number) => {
    setRecipeDraft(
      recipeDraft.map((r) =>
        r.inventoryItemId === inventoryItemId ? { ...r, quantityRequired: Number(newQty) } : r
      )
    )
  }

  const handleSaveRecipes = () => {
    if (!recipeModalItem) return
    for (const r of recipeDraft) {
      if (r.quantityRequired <= 0) {
        setRecipeError(
          isEn
            ? `Portion quantity for "${r.itemName}" must be > 0`
            : `Định lượng của "${r.itemName}" phải lớn hơn 0`
        )
        return
      }
    }

    updateRecipesMutation.mutate({
      id: recipeModalItem.id,
      recipes: recipeDraft.map((r) => ({
        inventoryItemId: r.inventoryItemId,
        quantityRequired: Number(r.quantityRequired),
      })),
    })
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError(isEn ? 'Please enter dish name' : 'Vui lòng nhập tên món ăn')
      return
    }
    if (!formCategoryId) {
      setFormError(isEn ? 'Please select category' : 'Vui lòng chọn danh mục món')
      return
    }
    if (formPrice < 0) {
      setFormError(isEn ? 'Price cannot be negative' : 'Giá bán không thể âm')
      return
    }
    if (formCostPrice < 0) {
      setFormError(isEn ? 'Cost price cannot be negative' : 'Giá vốn không thể âm')
      return
    }

    const payload: CreateMenuItemPayload = {
      name: formName.trim(),
      categoryId: formCategoryId,
      price: Number(formPrice),
      costPrice: Number(formCostPrice),
      imageUrl: formImageUrl.trim() || undefined,
      description: formDescription.trim() || undefined,
      isAvailable: formIsAvailable,
      isRecommendable: formIsRecommendable,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // 6. Dynamic KPIs
  const kpis = useMemo(() => {
    if (!dishes.length) {
      return {
        avgMargin: 0,
        totalItems: 0,
        availableCount: 0,
        lowStockCount: 0,
        recommendedCount: 0,
      }
    }

    const totalItems = dishes.length
    const availableCount = dishes.filter((d) => d.isAvailable).length
    const lowStockCount = dishes.filter((d) => d.isLowStock).length
    const recommendedCount = dishes.filter((d) => d.isRecommendable).length

    // Average Margin
    let marginSum = 0
    let validCount = 0
    dishes.forEach((d) => {
      const price = Number(d.price) || 0
      const cost = Number(d.costPrice) || 0
      const margin = typeof d.margin === 'number' ? d.margin : price > 0 ? Math.round(((price - cost) / price) * 100) : 0
      marginSum += margin
      validCount++
    })
    const avgMargin = validCount > 0 ? (marginSum / validCount).toFixed(1) : '0'

    return {
      avgMargin,
      totalItems,
      availableCount,
      lowStockCount,
      recommendedCount,
    }
  }, [dishes])

  // Lowest margin dishes for side card
  const lowMarginDishes = useMemo(() => {
    return [...dishes]
      .map((d) => {
        const price = Number(d.price) || 0
        const cost = Number(d.costPrice) || 0
        const margin = typeof d.margin === 'number' ? d.margin : price > 0 ? Math.round(((price - cost) / price) * 100) : 0
        return { ...d, calculatedMargin: margin }
      })
      .sort((a, b) => a.calculatedMargin - b.calculatedMargin)
      .slice(0, 4)
  }, [dishes])

  // 7. Dishes filtered by Status and Search (for category counts & category filtering)
  const statusFilteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Status Filter
      if (selectedStatusFilter === 'AVAILABLE' && !dish.isAvailable) return false
      if (selectedStatusFilter === 'UNAVAILABLE' && dish.isAvailable) return false
      if (selectedStatusFilter === 'LOW_STOCK' && !dish.isLowStock) return false
      if (selectedStatusFilter === 'RECOMMENDED' && !dish.isRecommendable) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = dish.name.toLowerCase().includes(q)
        const matchDesc = dish.description?.toLowerCase().includes(q)
        const matchCat = dish.category?.name.toLowerCase().includes(q)
        if (!matchName && !matchDesc && !matchCat) return false
      }

      return true
    })
  }, [dishes, selectedStatusFilter, searchQuery])

  // Category counts: dynamically computed based on selected status & search
  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = { ALL: statusFilteredDishes.length }
    statusFilteredDishes.forEach((d) => {
      const catId = d.categoryId || d.category?.id
      if (catId) {
        map[catId] = (map[catId] || 0) + 1
      }
    })
    return map
  }, [statusFilteredDishes])

  // Final Filtered Dishes (applying Category filter on top of status & search)
  const filteredDishes = useMemo(() => {
    if (selectedCategoryId === 'ALL') return statusFilteredDishes

    return statusFilteredDishes.filter((dish) => {
      return dish.categoryId === selectedCategoryId || dish.category?.id === selectedCategoryId
    })
  }, [statusFilteredDishes, selectedCategoryId])

  // Calculated form margin preview
  const liveFormMargin = useMemo(() => {
    const p = Number(formPrice) || 0
    const c = Number(formCostPrice) || 0
    if (p <= 0) return 0
    return Math.round(((p - c) / p) * 100)
  }, [formPrice, formCostPrice])

  // Available inventory items not already in draft
  const availableInventoryOptions = useMemo(() => {
    const draftIds = new Set(recipeDraft.map((r) => r.inventoryItemId))
    return inventoryItems.filter((i) => !draftIds.has(i.id))
  }, [inventoryItems, recipeDraft])

  return (
    <>
      <style>{`
        .menu-view {
          min-height: 100%;
          background: #f7f5f2;
          color: #1f1c1a;
          padding: 28px 32px 50px;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .menu-view-inner {
          max-width: 1360px;
          margin: 0 auto;
        }

        /* ================= HEADER ================= */
        .menu-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .menu-eyebrow {
          margin: 0 0 6px;
          color: #e0611d;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .menu-title {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #1a1714;
        }

        .menu-description {
          margin: 0;
          max-width: 640px;
          color: #7a736c;
          font-size: 13.5px;
          line-height: 1.6;
        }

        .menu-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .menu-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: all .18s ease;
          border: none;
        }

        .menu-button-secondary {
          background: #fff;
          border: 1px solid #e2dbd3;
          color: #2b2623;
          box-shadow: 0 1px 2px rgba(0,0,0,.03);
        }

        .menu-button-secondary:hover {
          background: #f1ede8;
          border-color: #d8cfc5;
        }

        .menu-button-primary {
          background: #1a1714;
          color: #fff;
          box-shadow: 0 2px 6px rgba(26,23,20,.15);
        }

        .menu-button-primary:hover {
          background: #e0611d;
          box-shadow: 0 3px 10px rgba(224,97,29,.25);
        }

        /* ================= KPIS ================= */
        .menu-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .menu-kpi {
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow:
            0 1px 2px rgba(26, 23, 20, .04),
            0 2px 8px rgba(26, 23, 20, .025);
          position: relative;
          overflow: hidden;
        }

        .menu-kpi-label {
          display: block;
          margin-bottom: 10px;
          color: #8c837a;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .menu-kpi-value {
          display: block;
          margin-bottom: 5px;
          color: #1f1c1a;
          font-size: 26px;
          line-height: 1;
          font-weight: 800;
        }

        .menu-kpi-value.green { color: #1e8a4c; }
        .menu-kpi-value.orange { color: #e0611d; }
        .menu-kpi-value.red { color: #d1372f; }

        .menu-kpi-note {
          color: #7a736c;
          font-size: 11.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .menu-kpi-note.green { color: #1e8a4c; font-weight: 600; }
        .menu-kpi-note.red { color: #d1372f; font-weight: 600; }

        /* ================= FILTER TOOLBAR ================= */
        .menu-toolbar {
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 1px 3px rgba(0,0,0,.02);
        }

        .menu-category-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .menu-cat-tab {
          border: none;
          background: #f7f5f2;
          color: #5c554e;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 650;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all .15s ease;
        }

        .menu-cat-tab:hover {
          background: #eee8e0;
          color: #1a1714;
        }

        .menu-cat-tab.active {
          background: #1a1714;
          color: #fff;
        }

        .menu-cat-count {
          font-size: 10.5px;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(0,0,0,.08);
          font-weight: 700;
        }

        .menu-cat-tab.active .menu-cat-count {
          background: rgba(255,255,255,.2);
          color: #fff;
        }

        .menu-search-filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-grow: 1;
          justify-content: flex-end;
          min-width: 280px;
        }

        .menu-search-box {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        .menu-search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8c837a;
          pointer-events: none;
        }

        .menu-search-input {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 36px;
          border: 1px solid #dfd8cf;
          border-radius: 8px;
          background: #fdfdfd;
          font-family: inherit;
          font-size: 13px;
          color: #1f1c1a;
          outline: none;
          transition: border-color .15s ease;
        }

        .menu-search-input:focus {
          border-color: #e0611d;
          background: #fff;
        }

        .menu-status-select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #dfd8cf;
          border-radius: 8px;
          background: #fdfdfd;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          color: #3b3530;
          cursor: pointer;
          outline: none;
        }

        .menu-status-select:focus {
          border-color: #e0611d;
        }

        /* ================= MAIN GRID ================= */
        .menu-main-grid {
          display: grid;
          grid-template-columns: 310px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        /* SIDEBAR */
        .menu-side {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .menu-ai-card {
          background: #1a1714;
          color: #fff;
          border-radius: 14px;
          padding: 22px;
          box-shadow: 0 4px 14px rgba(0,0,0,.08);
          border: 1px solid #2a2522;
        }

        .menu-ai-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 14px;
          color: #e0611d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .menu-ai-title {
          margin: 0 0 10px;
          color: #fff;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 750;
        }

        .menu-ai-text {
          margin: 0 0 16px;
          color: #b7b0a8;
          font-size: 12.5px;
          line-height: 1.6;
        }

        .menu-ai-button {
          width: 100%;
          min-height: 38px;
          border: none;
          border-radius: 8px;
          background: #e0611d;
          color: #fff;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s ease;
        }

        .menu-ai-button:hover {
          background: #c85315;
        }

        .menu-margin-card {
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,.03);
        }

        .menu-margin-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          color: #1f1c1a;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .menu-margin-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 0;
          border-top: 1px solid #f0ebe4;
          cursor: pointer;
          transition: transform .12s ease;
        }

        .menu-margin-item:first-of-type {
          border-top: none;
          padding-top: 0;
        }

        .menu-margin-item:hover {
          transform: translateX(2px);
        }

        .menu-margin-name {
          color: #1f1c1a;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .menu-margin-note {
          color: #8c837a;
          font-size: 11px;
        }

        .menu-margin-percent {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 800;
        }

        .menu-margin-percent.low { color: #d1372f; }
        .menu-margin-percent.mid { color: #d97706; }
        .menu-margin-percent.good { color: #1e8a4c; }

        /* DISH GRID */
        .menu-dish-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .menu-dish-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #ece7e1;
          border-radius: 14px;
          box-shadow:
            0 1px 2px rgba(26, 23, 20, .04),
            0 2px 7px rgba(26, 23, 20, .03);
          transition: all .2s ease;
          display: flex;
          flex-direction: column;
        }

        .menu-dish-card:hover {
          border-color: #ded7cf;
          box-shadow:
            0 4px 12px rgba(26, 23, 20, .06),
            0 2px 6px rgba(26, 23, 20, .03);
        }

        .menu-dish-card.unavailable {
          opacity: 0.72;
          background: #faf8f5;
        }

        .menu-dish-image-wrap {
          position: relative;
          height: 145px;
          background-color: #eee7df;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .menu-dish-image-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%);
          pointer-events: none;
        }

        .menu-dish-badge-left {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }

        .menu-dish-badge-right {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
        }

        .menu-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3.5px 9px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 750;
          color: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,.15);
        }

        .menu-badge.recommend { background: #e0611d; }
        .menu-badge.low-stock { background: #d1372f; }
        .menu-badge.unavailable { background: #55504a; }
        .menu-badge.category { background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }

        .menu-dish-body {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .menu-dish-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }

        .menu-dish-name {
          color: #1a1714;
          font-size: 14.5px;
          font-weight: 750;
          line-height: 1.3;
        }

        .menu-dish-price {
          flex-shrink: 0;
          color: #1a1714;
          font-size: 15px;
          font-weight: 800;
        }

        .menu-dish-desc {
          margin: 0 0 14px;
          color: #7a736c;
          font-size: 12px;
          line-height: 1.5;
          min-height: 36px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .menu-dish-financials {
          margin-top: auto;
          background: #faf7f2;
          border-radius: 8px;
          padding: 10px 12px;
          border: 1px solid #f0ebe4;
          margin-bottom: 12px;
        }

        .menu-food-cost {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 11px;
        }

        .menu-food-cost span {
          color: #7a736c;
          font-weight: 700;
          letter-spacing: .03em;
        }

        .menu-food-cost b {
          font-size: 12px;
        }

        .menu-food-cost b.good { color: #1e8a4c; }
        .menu-food-cost b.warning { color: #d1372f; }
        .menu-food-cost b.mid { color: #d97706; }

        .menu-cost-line {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: #e6dfd6;
        }

        .menu-cost-fill {
          height: 100%;
          border-radius: inherit;
          transition: width .3s ease;
        }

        .menu-cost-fill.good { background: #1e8a4c; }
        .menu-cost-fill.mid { background: #d97706; }
        .menu-cost-fill.warning { background: #d1372f; }

        .menu-dish-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .menu-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex: 1;
          min-width: 80px;
          min-height: 34px;
          padding: 0 8px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all .15s ease;
        }

        .menu-toggle-btn.active {
          background: #e8f5e9;
          color: #1e8a4c;
          border-color: #c8e6c9;
        }

        .menu-toggle-btn.active:hover {
          background: #ffebee;
          color: #d1372f;
          border-color: #ffcdd2;
        }

        .menu-toggle-btn.inactive {
          background: #ffebee;
          color: #d1372f;
          border-color: #ffcdd2;
        }

        .menu-toggle-btn.inactive:hover {
          background: #e8f5e9;
          color: #1e8a4c;
          border-color: #c8e6c9;
        }

        .menu-recipe-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 34px;
          padding: 0 10px;
          border-radius: 8px;
          background: #fdfaf6;
          border: 1px solid #eadcd0;
          color: #a34812;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s ease;
          white-space: nowrap;
        }

        .menu-recipe-btn:hover {
          background: #fbf0e8;
          border-color: #e0611d;
          color: #e0611d;
        }

        .menu-card-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #f7f5f2;
          border: 1px solid #ece7e1;
          color: #4a453f;
          cursor: pointer;
          transition: all .15s ease;
        }

        .menu-card-icon-btn:hover {
          background: #eee8e0;
          color: #1a1714;
        }

        .menu-card-icon-btn.danger:hover {
          background: #fee2e2;
          color: #d1372f;
          border-color: #fca5a5;
        }

        /* NEW CARD PLACEHOLDER */
        .menu-new-card {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px 24px;
          border: 2px dashed #ded7cf;
          border-radius: 14px;
          background: transparent;
          cursor: pointer;
          transition: all .2s ease;
        }

        .menu-new-card:hover {
          border-color: #e0611d;
          background: rgba(224,97,29,.02);
          transform: translateY(-2px);
        }

        .menu-new-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-bottom: 12px;
          border-radius: 50%;
          background: #fff;
          color: #e0611d;
          border: 1px solid #ece7e1;
          box-shadow: 0 2px 6px rgba(0,0,0,.04);
        }

        .menu-new-title {
          margin-bottom: 6px;
          color: #1f1c1a;
          font-size: 14px;
          font-weight: 750;
        }

        .menu-new-text {
          max-width: 220px;
          margin: 0;
          color: #7a736c;
          font-size: 12px;
          line-height: 1.5;
        }

        /* ================= MODAL ================= */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 13, 11, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          border: 1px solid #eae5df;
        }

        .modal-content.wide {
          max-width: 680px;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0ebe4;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #1a1714;
        }

        .modal-subtitle {
          margin: 4px 0 0;
          font-size: 12.5px;
          color: #7a736c;
        }

        .modal-close-btn {
          border: none;
          background: transparent;
          color: #8c837a;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background: #f5efe8;
          color: #1a1714;
        }

        .modal-body {
          padding: 24px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #3f3934;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          border: 1px solid #d8cfc5;
          border-radius: 9px;
          padding: 9px 12px;
          font-family: inherit;
          font-size: 13.5px;
          color: #1a1714 !important;
          background-color: #ffffff !important;
          outline: none;
          box-sizing: border-box;
          transition: border-color .15s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #e0611d;
          background: #fff;
        }

        .form-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .modal-margin-preview {
          background: #faf7f2;
          border: 1px solid #e8dfd5;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-margin-tag {
          font-weight: 800;
          font-size: 14px;
        }

        .form-checkbox-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #3b3530;
          cursor: pointer;
        }

        .modal-footer {
          padding: 18px 24px;
          border-top: 1px solid #f0ebe4;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .image-preview-box {
          margin-top: 8px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          border: 1px solid #e4ded6;
        }

        /* RECIPE BOM TABLE STYLES */
        .recipe-table-wrap {
          border: 1px solid #ece7e1;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .recipe-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .recipe-table th {
          background: #f7f5f2;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 800;
          color: #6a635c;
          text-align: left;
          letter-spacing: .04em;
          text-transform: uppercase;
          border-bottom: 1px solid #ece7e1;
        }

        .recipe-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #f2ede6;
          vertical-align: middle;
        }

        .recipe-table tr:last-child td {
          border-bottom: none;
        }

        .recipe-qty-input {
          width: 86px;
          padding: 6px 10px;
          border: 1px solid #d8cfc5;
          border-radius: 6px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1714 !important;
          background-color: #ffffff !important;
          outline: none;
        }

        .recipe-qty-input:focus {
          border-color: #e0611d;
          box-shadow: 0 0 0 2px rgba(224,97,29,0.15);
        }

        .recipe-add-bar {
          background: #fdfaf6;
          border: 1.5px dashed #ded3c5;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 18px;
        }

        .recipe-add-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .recipe-add-select {
          flex: 1;
          height: 40px;
          border: 1.5px solid #d8cfc5;
          border-radius: 8px;
          padding: 0 12px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #1a1714 !important;
          background-color: #ffffff !important;
          outline: none;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .recipe-add-select:focus {
          border-color: #e0611d;
          box-shadow: 0 0 0 2px rgba(224,97,29,0.15);
        }

        .recipe-add-select option {
          color: #1a1714 !important;
          background-color: #ffffff !important;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 12px;
        }

        .recipe-add-qty {
          width: 96px;
          height: 40px;
          border: 1.5px solid #d8cfc5;
          border-radius: 8px;
          padding: 0 12px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1714 !important;
          background-color: #ffffff !important;
          outline: none;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .recipe-add-qty:focus {
          border-color: #e0611d;
          box-shadow: 0 0 0 2px rgba(224,97,29,0.15);
        }

        /* TOAST */
        .toast-popup {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2000;
          padding: 12px 18px;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
          animation: toastIn 0.2s ease-out;
        }

        @keyframes toastIn {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .toast-popup.success {
          background: #1e8a4c;
          color: #fff;
        }

        .toast-popup.error {
          background: #d1372f;
          color: #fff;
        }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 1100px) {
          .menu-kpis {
            grid-template-columns: repeat(2, 1fr);
          }
          .menu-main-grid {
            grid-template-columns: 1fr;
          }
          .menu-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .menu-view {
            padding: 18px 16px;
          }
          .menu-header {
            flex-direction: column;
          }
          .menu-header-actions {
            width: 100%;
          }
          .menu-button {
            flex: 1;
          }
          .menu-kpis {
            grid-template-columns: 1fr;
          }
          .menu-dish-grid {
            grid-template-columns: 1fr;
          }
          .menu-side {
            grid-template-columns: 1fr;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
          .recipe-add-row {
            flex-direction: column;
            align-items: stretch;
          }
          .recipe-add-qty {
            width: 100%;
          }
        }
      `}</style>

      <div className="menu-view">
        <div className="menu-view-inner">

          {/* ================= HEADER ================= */}
          <section className="menu-header">
            <div>
              <h1 className="menu-title">
                {t('Quản lý Thực đơn & Định lượng', 'Menu Management & Engineering')}
              </h1>
              <p className="menu-description">
                {t(
                  'Định vị phong cách ẩm thực, thiết lập công thức nấu (BOM), cân đối giá vốn và biên lợi nhuận. Đồng bộ tức thời trạng thái còn món và trừ kho nguyên liệu thời gian thực.',
                  'Curate your restaurant portfolio, configure recipes (BOM), balance margins and food cost. Real-time availability sync and kitchen stock deduction.'
                )}
              </p>
            </div>

            <div className="menu-header-actions">
              <button
                className="menu-button menu-button-secondary"
                onClick={() => refetchDishes()}
                title={t('Làm mới dữ liệu từ máy chủ', 'Refresh data from server')}
              >
                <SlidersHorizontal size={15} />
                {t('Làm mới', 'Refresh')}
              </button>

              <button
                className="menu-button menu-button-primary"
                onClick={openCreateModal}
                id="btn-add-menu-item"
              >
                <Plus size={16} />
                {t('+ Thêm món mới', '+ New Menu Item')}
              </button>
            </div>
          </section>

          {/* ================= KPIS ================= */}
          <section className="menu-kpis">
            <div className="menu-kpi">
              <span className="menu-kpi-label">
                {t('BIÊN LỢI NHUẬN TRUNG BÌNH', 'AVERAGE PLATE MARGIN')}
              </span>
              <strong className="menu-kpi-value green">
                {kpis.avgMargin}%
              </strong>
              <span className="menu-kpi-note green">
                <TrendingUp size={14} /> {t('Mức sinh lời tổng quan', 'Overall profitability')}
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                {t('TỔNG MÓN TRÊN MENU', 'TOTAL MENU ITEMS')}
              </span>
              <strong className="menu-kpi-value">
                {kpis.totalItems}
              </strong>
              <span className="menu-kpi-note">
                {t(`${kpis.availableCount} món đang phục vụ`, `${kpis.availableCount} active dishes`)}
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                {t('CẢNH BÁO NGUYÊN LIỆU KHO', 'CRITICAL STOCK ALERTS')}
              </span>
              <strong className={`menu-kpi-value ${kpis.lowStockCount > 0 ? 'red' : 'green'}`}>
                {kpis.lowStockCount < 10 ? `0${kpis.lowStockCount}` : kpis.lowStockCount}
              </strong>
              <span className={`menu-kpi-note ${kpis.lowStockCount > 0 ? 'red' : 'green'}`}>
                {kpis.lowStockCount > 0
                  ? t('Cần nhập thêm nguyên liệu', 'Requires restock action')
                  : t('Kho hàng ổn định', 'Inventory optimal')}
              </span>
            </div>

            <div className="menu-kpi">
              <span className="menu-kpi-label">
                {t('MÓN ĐỀ XUẤT (RECOMMENDED)', 'RECOMMENDED CREATIONS')}
              </span>
              <strong className="menu-kpi-value orange">
                {kpis.recommendedCount}
              </strong>
              <span className="menu-kpi-note">
                {t('Ưu tiên gợi ý cho thực khách', 'Highlighted for guests')}
              </span>
            </div>
          </section>

          {/* ================= FILTER TOOLBAR ================= */}
          <section className="menu-toolbar">
            <div className="menu-category-tabs">
              <button
                className={`menu-cat-tab ${selectedCategoryId === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId('ALL')}
              >
                {t('Tất cả', 'All')}
                <span className="menu-cat-count">{categoryCountMap['ALL'] || 0}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`menu-cat-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                  <span className="menu-cat-count">{categoryCountMap[cat.id] || 0}</span>
                </button>
              ))}
            </div>

            <div className="menu-search-filter-group">
              <div className="menu-search-box">
                <Search size={15} />
                <input
                  type="text"
                  className="menu-search-input"
                  placeholder={t('Tìm kiếm theo tên món...', 'Search dishes by name...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="menu-status-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              >
                <option value="ALL">{t('Mọi trạng thái', 'All Statuses')}</option>
                <option value="AVAILABLE">{t('Còn món (Đang bán)', 'Available (In Stock)')}</option>
                <option value="UNAVAILABLE">{t('Tạm hết món', 'Out of Stock')}</option>
                <option value="LOW_STOCK">{t('Kho sắp hết', 'Low Stock Alert')}</option>
                <option value="RECOMMENDED">{t('Món đề xuất', 'Recommended')}</option>
              </select>
            </div>
          </section>

          {/* ================= MAIN CONTENT ================= */}
          <section className="menu-main-grid">

            {/* ---------- SIDEBAR INSIGHTS ---------- */}
            <aside className="menu-side">
              {/* AI Insight Card */}
              <article className="menu-ai-card">
                <div className="menu-ai-label">
                  <Sparkles size={14} />
                  {t('Gợi ý Tối ưu Thực đơn', 'Menu Intelligence Prompt')}
                </div>
                <h2 className="menu-ai-title">
                  {kpis.lowStockCount > 0
                    ? t(`Có ${kpis.lowStockCount} món có nguyên liệu dưới ngưỡng`, `${kpis.lowStockCount} items have ingredients below threshold`)
                    : t('Thực đơn & Công thức đang tối ưu', 'Menu & Recipes are fully optimized')}
                </h2>
                <p className="menu-ai-text">
                  {kpis.lowStockCount > 0
                    ? t(
                      'Một số món có nguyên liệu trong kho đang chạm ngưỡng cảnh báo. Nhấn nút "BOM" trên thẻ món để kiểm tra công thức hoặc nhập hàng thêm.',
                      'Certain dishes have ingredients below the safety threshold. Click "BOM" on the dish card to review recipes or restock.'
                    )
                    : t(
                      'Các món đều có công thức định lượng chuẩn xác. Bạn có thể bấm vào nút "BOM" của bất kỳ món nào để điều chỉnh định mức nguyên liệu theo ý Bếp.',
                      'All menu items have accurate BOM recipes configured. You can click "BOM" on any dish to adjust ingredient portions anytime.'
                    )}
                </p>
                <button
                  className="menu-ai-button"
                  onClick={() => setSelectedStatusFilter(kpis.lowStockCount > 0 ? 'LOW_STOCK' : 'RECOMMENDED')}
                >
                  {kpis.lowStockCount > 0
                    ? t('Xem món thiếu kho', 'Review Low-Stock Items')
                    : t('Xem các món đề xuất', 'View Recommendations')}
                </button>
              </article>

              {/* Margin Compression Card */}
              <article className="menu-margin-card">
                <div className="menu-margin-title">
                  <span>{t('Món có margin thấp nhất', 'Lowest Margin Dishes')}</span>
                  <Percent size={14} color="#d1372f" />
                </div>

                {lowMarginDishes.map((dish) => {
                  const m = dish.calculatedMargin
                  const marginClass = m < 55 ? 'low' : m < 68 ? 'mid' : 'good'
                  return (
                    <div
                      key={dish.id}
                      className="menu-margin-item"
                      onClick={() => openEditModal(dish)}
                      title={t('Nhấn để chỉnh sửa giá bán hoặc công thức', 'Click to edit price or recipe')}
                    >
                      <div>
                        <div className="menu-margin-name">{dish.name}</div>
                        <div className="menu-margin-note">
                          {t(`Giá $${dish.price.toFixed(2)} | Vốn ${(dish.costPrice || 0).toFixed(2)}`, `Price $${dish.price.toFixed(2)} | Cost $${(dish.costPrice || 0).toFixed(2)}`)}
                        </div>
                      </div>
                      <div className={`menu-margin-percent ${marginClass}`}>
                        {m}%
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  )
                })}
              </article>
            </aside>

            {/* ---------- DISHES GRID ---------- */}
            <main className="menu-dish-grid">
              {loadingDishes ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#7a736c' }}>
                  <Utensils size={32} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
                  <p>{t('Đang tải thực đơn từ máy chủ...', 'Loading menu items from server...')}</p>
                </div>
              ) : errorDishes ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#d1372f' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                  <p>{t('Lỗi tải dữ liệu thực đơn. Vui lòng thử lại!', 'Failed to load menu items. Please try again!')}</p>
                  <button className="menu-button menu-button-secondary" onClick={() => refetchDishes()} style={{ marginTop: 12 }}>
                    {t('Thử lại', 'Retry')}
                  </button>
                </div>
              ) : filteredDishes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#7a736c' }}>
                  <p style={{ fontSize: 16, fontWeight: 650, color: '#1a1714' }}>
                    {t('Không tìm thấy món ăn nào', 'No dishes found')}
                  </p>
                  <p style={{ fontSize: 13 }}>
                    {t('Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.', 'Try refining your search keyword or clearing filters.')}
                  </p>
                </div>
              ) : (
                filteredDishes.map((dish) => {
                  const price = Number(dish.price) || 0
                  const cost = Number(dish.costPrice) || 0
                  const margin = typeof dish.margin === 'number' ? dish.margin : price > 0 ? Math.round(((price - cost) / price) * 100) : 0
                  const marginStatus = margin >= 65 ? 'good' : margin >= 50 ? 'mid' : 'warning'
                  const recipeCount = dish.recipes?.length || 0

                  return (
                    <article
                      key={dish.id}
                      className={`menu-dish-card ${!dish.isAvailable ? 'unavailable' : ''}`}
                    >
                      {/* Image Banner */}
                      <div
                        className="menu-dish-image-wrap"
                        style={{
                          backgroundImage: `url(${dish.imageUrl || FALLBACK_IMAGE})`,
                        }}
                      >
                        <div className="menu-dish-badge-left">
                          {dish.category?.name && (
                            <span className="menu-badge category">
                              {dish.category.name}
                            </span>
                          )}
                          {dish.isRecommendable && (
                            <span className="menu-badge recommend">
                              <Sparkles size={11} /> {t('Đề xuất', 'Recommended')}
                            </span>
                          )}
                        </div>

                        <div className="menu-dish-badge-right">
                          {dish.isLowStock && (
                            <span className="menu-badge low-stock">
                              <AlertTriangle size={11} /> {t('Kho thấp', 'Low Stock')}
                            </span>
                          )}
                          {!dish.isAvailable && (
                            <span className="menu-badge unavailable">
                              {t('Tạm hết', 'Out of Stock')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="menu-dish-body">
                        <div className="menu-dish-title-row">
                          <span className="menu-dish-name">{dish.name}</span>
                          <span className="menu-dish-price">${price.toFixed(2)}</span>
                        </div>

                        <p className="menu-dish-desc">
                          {dish.description || (isEn ? 'No description available for this dish.' : 'Chưa có mô tả chi tiết cho món ăn này.')}
                        </p>

                        {/* Financials / Margin bar */}
                        <div className="menu-dish-financials">
                          <div className="menu-food-cost">
                            <span>{t('VỐN', 'COST')}: ${cost.toFixed(2)}</span>
                            <b className={marginStatus}>
                              MARGIN: {margin}%
                            </b>
                          </div>

                          <div className="menu-cost-line">
                            <div
                              className={`menu-cost-fill ${marginStatus}`}
                              style={{ width: `${Math.min(100, Math.max(5, margin))}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="menu-dish-actions">
                          <button
                            className={`menu-toggle-btn ${dish.isAvailable ? 'active' : 'inactive'}`}
                            onClick={() =>
                              toggleAvailabilityMutation.mutate({
                                id: dish.id,
                                isAvailable: !dish.isAvailable,
                              })
                            }
                            title={dish.isAvailable ? t('Nhấn để chuyển sang Hết món', 'Click to mark as Out of Stock') : t('Nhấn để chuyển sang Còn món', 'Click to mark as In Stock')}
                          >
                            {dish.isAvailable ? (
                              <>
                                <Eye size={13} /> {t('Còn món', 'In Stock')}
                              </>
                            ) : (
                              <>
                                <EyeOff size={13} /> {t('Hết món', 'Out of Stock')}
                              </>
                            )}
                          </button>

                          {/* RECIPE BOM BUTTON */}
                          <button
                            className="menu-recipe-btn"
                            onClick={() => openRecipeModal(dish)}
                            title={t('Xem và chỉnh sửa công thức định lượng nguyên liệu (BOM)', 'View and configure Recipe BOM ingredients')}
                          >
                            <ChefHat size={14} />
                            <span>{t(`${recipeCount} ng.liệu`, `${recipeCount} ingred.`)}</span>
                          </button>

                          <button
                            className="menu-card-icon-btn"
                            onClick={() => openEditModal(dish)}
                            title={t('Chỉnh sửa thông tin món', 'Edit dish')}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            className="menu-card-icon-btn danger"
                            onClick={() => setDeletingItem(dish)}
                            title={t('Xóa món khỏi thực đơn', 'Delete item')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}

              {/* Add New Creation Card Button */}
              <article className="menu-new-card" onClick={openCreateModal}>
                <div className="menu-new-icon">
                  <Plus size={20} />
                </div>
                <div className="menu-new-title">{t('Thêm Món Ăn Mới', 'Add New Menu Item')}</div>
                <p className="menu-new-text">
                  {t(
                    'Thiết lập giá bán, giá vốn dự kiến và đồng bộ tức thời tới quầy thu ngân và máy tính bảng khách hàng.',
                    'Define ingredients, calculate margins, and publish instantly to floor terminals.'
                  )}
                </p>
              </article>
            </main>
          </section>

        </div>
      </div>

      {/* ================= MODAL: QUẢN LÝ CÔNG THỨC & ĐỊNH LƯỢNG (RECIPE BOM) ================= */}
      {recipeModalItem && (
        <div className="modal-overlay" onClick={closeRecipeModal}>
          <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChefHat size={20} color="#e0611d" />
                  {t('Định Lượng & Công Thức Nấu (BOM)', 'Recipe & Bill of Materials (BOM)')}
                </h3>
                <p className="modal-subtitle">
                  {t('Món', 'Dish')}: <strong>{recipeModalItem.name}</strong> • {t('Giá bán', 'Price')}: <strong>${recipeModalItem.price.toFixed(2)}</strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeRecipeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {recipeError && (
                <div
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{recipeError}</span>
                </div>
              )}

              {/* BẢNG NGUYÊN LIỆU HIỆN CÓ TRONG CÔNG THỨC */}
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 750, color: '#1a1714' }}>
                  {t('Danh sách nguyên liệu cấu thành (1 phần ăn):', 'Portion recipe ingredients (1 serving):')}
                </span>
                <span style={{ fontSize: 12, color: '#7a736c' }}>
                  {t(`${recipeDraft.length} loại nguyên liệu`, `${recipeDraft.length} ingredients`)}
                </span>
              </div>

              {recipeDraft.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: '#faf7f2',
                    borderRadius: 10,
                    border: '1px dashed #ded7cf',
                    color: '#7a736c',
                    marginBottom: 18,
                  }}
                >
                  <Package size={24} style={{ margin: '0 auto 8px', color: '#a89f94' }} />
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>
                    {t('Món này chưa có công thức định lượng.', 'No ingredients defined for this dish yet.')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                    {t('Chọn nguyên liệu từ kho bên dưới để bắt đầu thêm.', 'Select an inventory item below to start adding.')}
                  </p>
                </div>
              ) : (
                <div className="recipe-table-wrap">
                  <table className="recipe-table">
                    <thead>
                      <tr>
                        <th>{t('Tên Nguyên liệu', 'Ingredient Name')}</th>
                        <th>{t('Đơn vị', 'Unit')}</th>
                        <th>{t('Tồn kho hiện tại', 'Current Stock')}</th>
                        <th>{t('Định mức / 1 suất', 'Portion / 1 Serving')}</th>
                        <th style={{ textAlign: 'center', width: 60 }}>{t('Gỡ', 'Remove')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeDraft.map((r) => {
                        const isStockLow = r.currentStock <= r.minAlertThreshold
                        return (
                          <tr key={r.inventoryItemId}>
                            <td>
                              <strong style={{ color: '#1a1714' }}>{r.itemName}</strong>
                            </td>
                            <td style={{ color: '#7a736c' }}>{r.unit}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 12,
                                  fontWeight: 650,
                                  color: isStockLow ? '#d1372f' : '#1e8a4c',
                                  background: isStockLow ? '#fee2e2' : '#e8f5e9',
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                }}
                              >
                                {isStockLow && <AlertTriangle size={11} />}
                                {r.currentStock} {r.unit}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0.001"
                                  className="recipe-qty-input"
                                  style={{ color: '#1a1714', backgroundColor: '#ffffff' }}
                                  value={r.quantityRequired}
                                  onChange={(e) =>
                                    handleQuantityChangeInDraft(r.inventoryItemId, Number(e.target.value))
                                  }
                                />
                                <span style={{ fontSize: 12, color: '#7a736c', fontWeight: 600 }}>{r.unit}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="menu-card-icon-btn danger"
                                style={{ width: 28, height: 28, margin: '0 auto' }}
                                onClick={() => handleRemoveIngredientFromDraft(r.inventoryItemId)}
                                title={t('Xóa nguyên liệu này khỏi công thức', 'Remove from recipe')}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* THÊM NGUYÊN LIỆU MỚI VÀO CÔNG THỨC */}
              <div className="recipe-add-bar">
                <label className="form-label" style={{ marginBottom: 8 }}>
                  {t('+ Thêm nguyên liệu từ kho vào công thức:', '+ Add inventory ingredient to recipe:')}
                </label>
                <div className="recipe-add-row">
                  <select
                    className="recipe-add-select"
                    style={{ color: '#1a1714', backgroundColor: '#ffffff' }}
                    value={newIngredientId}
                    onChange={(e) => setNewIngredientId(e.target.value)}
                  >
                    <option value="" style={{ color: '#666059', backgroundColor: '#ffffff' }}>
                      {t(`-- Chọn nguyên liệu kho (${availableInventoryOptions.length} có sẵn) --`, `-- Select inventory item (${availableInventoryOptions.length} available) --`)}
                    </option>
                    {availableInventoryOptions.map((inv) => (
                      <option key={inv.id} value={inv.id} style={{ color: '#1a1714', backgroundColor: '#ffffff' }}>
                        {inv.name} ({t('Tồn', 'Stock')}: {inv.currentStock} {inv.unit})
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      className="recipe-add-qty"
                      style={{ color: '#1a1714', backgroundColor: '#ffffff' }}
                      placeholder={t('Số lượng', 'Qty')}
                      value={newIngredientQuantity}
                      onChange={(e) => setNewIngredientQuantity(Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="menu-button menu-button-primary"
                      style={{ minHeight: 40, padding: '0 16px', fontSize: 13 }}
                      onClick={handleAddIngredientToDraft}
                    >
                      <Plus size={14} /> {t('Thêm vào', 'Add')}
                    </button>
                  </div>
                </div>
              </div>

              {/* LƯU Ý HỆ THỐNG */}
              <div
                style={{
                  background: '#f7f5f2',
                  borderRadius: 8,
                  padding: '10px 14px',
                  border: '1px solid #ece7e1',
                  fontSize: 12,
                  color: '#7a736c',
                  lineHeight: 1.5,
                }}
              >
                💡 <strong>{t('Cơ chế tự động:', 'Automation Rule:')}</strong>{' '}
                {t(
                  'Mỗi khi có order món này được Bếp (KDS) xác nhận, hệ thống sẽ tự động trừ kho nguyên liệu theo đúng số lượng định mức trên. Khi nguyên liệu chạm ngưỡng tối thiểu, món sẽ tự động kích hoạt cảnh báo tồn kho thấp.',
                  'When this item is confirmed by the kitchen, stock is deducted in real-time according to this portion. Alerts fire automatically if threshold is crossed.'
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="menu-button menu-button-secondary"
                onClick={closeRecipeModal}
              >
                {t('Hủy bỏ', 'Cancel')}
              </button>
              <button
                type="button"
                className="menu-button menu-button-primary"
                onClick={handleSaveRecipes}
                disabled={updateRecipesMutation.isPending}
              >
                {updateRecipesMutation.isPending
                  ? t('Đang lưu công thức...', 'Saving Recipe...')
                  : t(`Lưu công thức (${recipeDraft.length} nguyên liệu)`, `Save Recipe (${recipeDraft.length} ingredients)`)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / CHỈNH SỬA MÓN ================= */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem
                  ? t(`Chỉnh sửa: ${editingItem.name}`, `Edit Item: ${editingItem.name}`)
                  : t('Thêm Món Mới Vào Thực Đơn', 'Add New Menu Item')}
              </h3>
              <button className="modal-close-btn" onClick={closeFormModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t('Tên món ăn *', 'Dish Name *')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('VD: Bò Wagyu Nướng Sốt Nấm', 'e.g. Herb-Crusted Grilled Lamb Chops')}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">{t('Danh mục món *', 'Category *')}</label>
                    <select
                      className="form-select"
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      required
                    >
                      <option value="" disabled>{t('-- Chọn danh mục --', '-- Select Category --')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('Giá bán ($) *', 'Price ($) *')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="15.99"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">{t('Giá vốn ước tính ($)', 'Est. Cost Price ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="4.50"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('Biên lợi nhuận dự kiến', 'Estimated Margin')}</label>
                    <div className="modal-margin-preview" style={{ margin: 0 }}>
                      <span style={{ fontSize: 12, color: '#7a736c', fontWeight: 600 }}>{t('Tỷ lệ lãi gộp:', 'Gross Margin:')}</span>
                      <span
                        className="modal-margin-tag"
                        style={{
                          color: liveFormMargin >= 65 ? '#1e8a4c' : liveFormMargin >= 50 ? '#d97706' : '#d1372f',
                        }}
                      >
                        {liveFormMargin}%
                      </span>
                    </div>
                  </div>
                </div>

                {editingItem && (
                  <div style={{ marginBottom: 16 }}>
                    <button
                      type="button"
                      className="menu-button menu-button-secondary"
                      style={{ width: '100%', gap: 8, borderColor: '#e0611d', color: '#e0611d' }}
                      onClick={() => {
                        const item = editingItem
                        closeFormModal()
                        openRecipeModal(item)
                      }}
                    >
                      <ChefHat size={16} />
                      {t(
                        `Định lượng công thức nấu (BOM) món này (${editingItem.recipes?.length || 0} nguyên liệu)`,
                        `Configure Recipe BOM (${editingItem.recipes?.length || 0} ingredients)`
                      )}
                    </button>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t('Hình ảnh minh họa (URL)', 'Image URL')}</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                  />
                  {formImageUrl && (
                    <div
                      className="image-preview-box"
                      style={{ backgroundImage: `url(${formImageUrl})` }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Mô tả món ăn', 'Description')}</label>
                  <textarea
                    className="form-textarea"
                    placeholder={t('Nguyên liệu chính, hương vị đặc trưng, định lượng...', 'Key ingredients, flavor profile, garnish notes...')}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="form-checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#1e8a4c' }}
                    />
                    <span>{t('Đang phục vụ (Còn món)', 'Available (In Stock)')}</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formIsRecommendable}
                      onChange={(e) => setFormIsRecommendable(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#e0611d' }}
                    />
                    <span>{t('Gợi ý nổi bật (Recommended)', 'Featured / Recommended')}</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="menu-button menu-button-secondary"
                  onClick={closeFormModal}
                >
                  {t('Hủy bỏ', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="menu-button menu-button-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t('Đang lưu...', 'Saving...')
                    : editingItem
                      ? t('Lưu thay đổi', 'Save Changes')
                      : t('Tạo món ăn', 'Create Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÁC NHẬN XÓA MÓN ================= */}
      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#d1372f', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> {t('Xác nhận xóa món', 'Confirm Item Deletion')}
              </h3>
              <button className="modal-close-btn" onClick={() => setDeletingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#3f3934', lineHeight: 1.5 }}>
                {t(
                  `Bạn có chắc chắn muốn xóa món "${deletingItem.name}" khỏi thực đơn?`,
                  `Are you sure you want to delete "${deletingItem.name}" from the menu?`
                )}
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: '#8c837a' }}>
                {t(
                  'Hành động này sẽ gỡ bỏ món ăn và toàn bộ công thức định lượng liên quan.',
                  'This action will permanently delete the item and its BOM recipe mappings.'
                )}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="menu-button menu-button-secondary"
                onClick={() => setDeletingItem(null)}
              >
                {t('Hủy bỏ', 'Cancel')}
              </button>
              <button
                className="menu-button"
                style={{ background: '#d1372f', color: '#fff' }}
                onClick={() => deleteMutation.mutate(deletingItem.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('Đang xóa...', 'Deleting...') : t('Xóa món ngay', 'Delete Item Now')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toast && (
        <div className={`toast-popup ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  )
}

export default MenuView