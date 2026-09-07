import apiClient from '@/services/api.client'

export interface InventoryItem {
  id: string
  name: string
  unit: string
  currentStock: number
  minStockLevel: number
  unitCost: number
  isLow: boolean
  updatedAt: string
}

export interface StockReceipt {
  id: string
  receiptCode: string
  details: {
    id: string
    inventoryItemId: string
    itemName: string
    unit: string
    quantity: number
    unitPrice: number
  }[]
  totalCost: number
  supplierName: string | null
  createdAt: string
  managerName: string
}

export interface CreateStockReceiptPayload {
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

  updateMinLevel: (id: string, minStockLevel: number) =>
    apiClient
      .patch<InventoryItem>(`/inventory/${id}/min-level`, { minStockLevel })
      .then((r) => r.data),

  // Phiếu nhập kho
  getReceipts: () =>
    apiClient.get<StockReceipt[]>('/inventory/receipts').then((r) => r.data),

  createReceipt: (payload: CreateStockReceiptPayload) =>
    apiClient.post<StockReceipt>('/inventory/receipts', payload).then((r) => r.data),

  approveReceipt: (receiptId: string) =>
    apiClient.patch<StockReceipt>(`/inventory/receipts/${receiptId}/approve`).then((r) => r.data),
}
