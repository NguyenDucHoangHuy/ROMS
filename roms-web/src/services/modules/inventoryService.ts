import apiClient from '@/services/api.client'

export interface InventoryItem {
  id: string
  name: string
  itemName: string
  unit: string
  currentStock: number
  minStockLevel: number
  minAlertThreshold: number
  category?: string
  sku?: string
  unitCost: number
  isLow: boolean
  updatedAt: string
}

export interface StockReceiptDetail {
  id: string
  inventoryItemId: string
  itemName: string
  unit: string
  quantity: number
  unitPrice: number
}

export interface StockReceipt {
  id: string
  receiptCode: string
  supplierName: string | null
  totalCost: number
  createdAt: string
  managerName?: string
  details: StockReceiptDetail[]
}

export interface CreateInventoryPayload {
  itemName: string
  unit: string
  currentStock?: number
  minAlertThreshold?: number
  category?: string
  sku?: string
}

export interface UpdateInventoryPayload {
  itemName?: string
  unit?: string
  minAlertThreshold?: number
  category?: string
  sku?: string
}

export interface AdjustStockPayload {
  deltaQuantity: number
  movementType?: 'IN_RECEIPT' | 'OUT_COOKING' | 'WASTE_SPOILED' | 'ADJUSTMENT'
  note?: string
}

export interface CreateReceiptPayload {
  supplierName?: string
  details: {
    inventoryItemId: string
    quantity: number
    unitPrice: number
  }[]
}

export const inventoryService = {
  getAll: () =>
    apiClient.get<InventoryItem[]>('/inventory').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<InventoryItem>(`/inventory/${id}`).then((r) => r.data),

  getLowStock: () =>
    apiClient.get<InventoryItem[]>('/inventory/low-stock').then((r) => r.data),

  create: (payload: CreateInventoryPayload) =>
    apiClient.post<InventoryItem>('/inventory', payload).then((r) => r.data),

  update: (id: string, payload: UpdateInventoryPayload) =>
    apiClient.patch<InventoryItem>(`/inventory/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/inventory/${id}`).then((r) => r.data),

  adjustStock: (id: string, payload: AdjustStockPayload) =>
    apiClient.post<InventoryItem>(`/inventory/${id}/adjust`, payload).then((r) => r.data),

  // Phiếu nhập kho
  getReceipts: () =>
    apiClient.get<StockReceipt[]>('/inventory/receipts').then((r) => r.data),

  createReceipt: (payload: CreateReceiptPayload) =>
    apiClient.post<StockReceipt>('/inventory/receipts', payload).then((r) => r.data),
}
