import apiClient from '@/services/api.client'
import type {
  Order,
  CreateOrderPayload,
  AddOrderItemsPayload,
  ProcessPaymentPayload,
  KitchenOrderItem,
} from '@/types/order.types'

export const orderService = {
  // Customer / Waiter
  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>('/orders', payload).then((r) => r.data),

  getByTable: (tableId: string) =>
    apiClient.get<Order>(`/orders/table/${tableId}/active`).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  addItems: (orderId: string, payload: AddOrderItemsPayload) =>
    apiClient.post<Order>(`/orders/${orderId}/items`, payload).then((r) => r.data),

  cancelItem: (orderId: string, itemId: string) =>
    apiClient.delete(`/orders/${orderId}/items/${itemId}`).then((r) => r.data),

  // Kitchen (Chef)
  getKitchenQueue: () =>
    apiClient.get<KitchenOrderItem[]>('/orders/kitchen/queue').then((r) => r.data),

  updateItemStatus: (
    orderId: string,
    itemId: string,
    status: KitchenOrderItem['status'],
    rejectedReason?: string,
  ) =>
    apiClient
      .patch(`/orders/${orderId}/items/${itemId}/status`, { status, rejectedReason })
      .then((r) => r.data),

  prioritizeItem: (orderId: string, itemId: string) =>
    apiClient.patch(`/orders/${orderId}/items/${itemId}/priority`).then((r) => r.data),

  // Cashier
  getPendingPayment: () =>
    apiClient.get<Order[]>('/orders/pending-payment').then((r) => r.data),

  processPayment: (orderId: string, payload: ProcessPaymentPayload) =>
    apiClient.post<Order>(`/orders/${orderId}/payment`, payload).then((r) => r.data),

  voidOrder: (orderId: string, managerPasscode: string) =>
    apiClient
      .post(`/orders/${orderId}/void`, { managerPasscode })
      .then((r) => r.data),

  printBill: (orderId: string, isPreview?: boolean) =>
    apiClient
      .get<Blob>(`/orders/${orderId}/bill`, {
        params: { preview: isPreview },
        responseType: 'blob',
      })
      .then((r) => r.data),
}
