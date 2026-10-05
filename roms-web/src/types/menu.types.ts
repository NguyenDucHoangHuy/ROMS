export interface MenuCategory {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

export interface MenuRecipe {
  id: string
  inventoryItemId: string
  itemName: string
  unit: string
  quantityRequired: number
  currentStock: number
  minAlertThreshold: number
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  costPrice?: number
  margin?: number
  imageUrl: string | null
  categoryId: string
  category: MenuCategory
  isAvailable: boolean
  isRecommendable?: boolean
  isLowStock?: boolean
  lowStockWarning?: string | null
  preparationTime?: number
  tags?: string[]
  avgRating?: number
  recipes?: MenuRecipe[]
}

export interface RecommendedItem {
  menuItemId: string
  score: number
  reason?: string
}

export interface CreateMenuItemPayload {
  name: string
  description?: string
  price: number
  costPrice?: number
  imageUrl?: string
  categoryId: string
  isAvailable?: boolean
  isRecommendable?: boolean
}
