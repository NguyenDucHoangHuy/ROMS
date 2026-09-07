export interface MenuCategory {
  id: string
  name: string          // "Khai vị", "Món chính", "Đồ uống", "Tráng miệng"
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number         // $
  imageUrl: string | null
  avgRating?:number 
  categoryId: string
  category: MenuCategory
  isAvailable: boolean
  isRecommendable?: boolean
  preparationTime: number  // Phút
  tags: string[]        // ['Cay', 'Chay', 'Bán chạy']
  costPrice?: number
  margin?: number
  isLowStock?: boolean
  lowStockWarning?: string | null
  recipes?: {
    id: string
    inventoryItemId: string
    itemName: string
    unit: string
    quantityRequired: number
    currentStock: number
    minAlertThreshold: number
  }[]
  createdAt: string
  updatedAt: string
}

/** Dùng cho AI Recommendation response */
export interface RecommendedItem {
  menuItem: MenuItem
  score: number         // 0-1, độ phù hợp
  reason: string        // "Thường được gọi cùng"
}

/** Payload tạo/sửa món */
export interface CreateMenuItemPayload {
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
  preparationTime?: number
  tags?: string[]
}
