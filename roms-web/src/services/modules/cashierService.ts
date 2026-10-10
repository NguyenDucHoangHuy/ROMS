import apiClient from '@/services/api.client'

interface ApiResponse<T> {
  data: T
}

function unwrapResponse<T>(response: T | ApiResponse<T>): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<T>).data
    : (response as T)
}

export interface CashierTableItem {
  id: string
  name: string
  note?: string
  quantity: number
  price: number
  refundable: boolean
}

export interface CashierTableSummary {
  id: string
  name: string
  floor: string | number
  capacity: number
  mergedIntoTableId?: string | null
  status: 'empty' | 'occupied' | 'reserved' | 'dirty'
  guests: number
  total: number
  unpaidBill?: CashierBillSummary
  timer?: string
  reservationTime?: string
  customerName?: string
  orderId?: string
  orderItems?: CashierTableItem[]
}

export interface CashierMenuItem {
  id: string
  name: string
  categoryId: string
  category: string
  price: number
  description: string
  imageUrl: string
  isAvailable: boolean
  costPrice: number
}

export type CreateCashierOrderPayload = {
  tableId: string
  customerCount?: number
  waiterId?: string
}

export interface CashierPromotionValidation {
  promotion: { id: string; code: string; description: string | null }
  subtotal: number
  discountAmount: number
  finalAmount: number
}

export interface CashierBillSummary {
  id: string
  billCode: string
  subtotalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  promotionCode?: string | null
}

export interface CashierTableOrderResponse {
  table: Pick<CashierTableSummary, 'id' | 'name' | 'floor' | 'status'>
  diningSession: { id: string; status: string } | null
  order: { id: string; orderCode: string; status: string; totalAmount: number; createdAt: string } | null
  orderItems: Array<{
    id: string
    orderId: string
    menuItemId: string
    menuItemName: string
    quantity: number
    unitPrice: number
    notes?: string
    itemStatus: string
  }>
  menuItems: Array<{ id: string; name: string; price: number; isAvailable: boolean; category?: { name: string } }>
  bills: CashierBillSummary[]
  payments: Array<{ id: string; billId: string; paymentMethod: string; amountPaid: number; changeAmount: number; refundAmount: number; status: string }>
}

function normalizeTableOrderResponse(
  value: CashierTableOrderResponse | ApiResponse<CashierTableOrderResponse>,
): CashierTableOrderResponse {
  const response = unwrapResponse(value);
  if (
    typeof response !== 'object' ||
    response === null ||
    typeof response.table?.id !== 'string' ||
    typeof response.diningSession !== 'object' ||
    (response.diningSession !== null &&
      (typeof response.diningSession.id !== 'string' ||
        typeof response.diningSession.status !== 'string')) ||
    (response.order !== null &&
      (typeof response.order !== 'object' ||
        typeof response.order.id !== 'string')) ||
    !Array.isArray(response.bills) ||
    !Array.isArray(response.orderItems) ||
    !Array.isArray(response.payments)
  ) {
    throw new Error(
      'Cashier table-order response is invalid: expected bills, order items, and payments arrays.',
    );
  }
  if (
    response.bills.some(
      (bill) =>
        typeof bill.id !== 'string' ||
        typeof bill.status !== 'string' ||
        typeof bill.subtotalAmount !== 'number' ||
        typeof bill.discountAmount !== 'number' ||
        typeof bill.finalAmount !== 'number',
    )
  ) {
    throw new Error(
      'Cashier table-order response is invalid: bills must include status and persisted totals.',
    );
  }
  return response;
}

export interface CashierTransaction {
  id: string
  transactionCode: string | null
  billId: string
  invoiceId: string
  date: string
  time: string
  tableName: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO'
  status: 'SUCCESS' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'PENDING' | 'FAILED'
  amount: number
  refundAmount: number
  items: Array<{ id: string; name: string; quantity: number; unitPrice: number }>
  refunds: Array<{ id: string; amount: number; reason: string; createdAt: string }>
}

export interface CashierTransactionsResponse {
  data: CashierTransaction[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const cashierService = {
  getTables: () =>
    apiClient
      .get<CashierTableSummary[] | ApiResponse<CashierTableSummary[]>>('/cashier/tables')
      .then((response) => unwrapResponse(response.data)),

  getMenu: () =>
    apiClient
      .get<CashierMenuItem[] | ApiResponse<CashierMenuItem[]>>('/cashier/menu')
      .then((response) => unwrapResponse(response.data)),

  getTableOrder: (tableId: string) =>
    apiClient
      .get<CashierTableOrderResponse | ApiResponse<CashierTableOrderResponse>>(
        `/cashier/tables/${tableId}/order`,
      )
      .then((response) => {
        const tableOrder = normalizeTableOrderResponse(response.data)
        if (tableOrder.table.id !== tableId) {
          throw new Error('Cashier table-order response does not match the requested table.')
        }
        return tableOrder
      }),

  validatePromotion: (payload: { code: string; subtotal: number }) =>
    apiClient
      .post<CashierPromotionValidation | ApiResponse<CashierPromotionValidation>>(
        '/cashier/bills/validate-promotion',
        payload,
      )
      .then((response) => unwrapResponse(response.data)),

  createBill: (sessionId: string, payload: { promotionCode?: string }) =>
    apiClient
      .post<{ id: string; billCode: string; finalAmount: number } | ApiResponse<{ id: string; billCode: string; finalAmount: number }>>(
        `/cashier/sessions/${sessionId}/bill`,
        payload,
      )
      .then((response) => unwrapResponse(response.data)),

  createOrder: (payload: CreateCashierOrderPayload) =>
    apiClient
      .post('/cashier/orders', payload)
      .then((response) => unwrapResponse(response.data)),

  createPayment: (payload: { billId: string; paymentMethod: string; amountPaid: number }) =>
    apiClient
      .post('/cashier/payments', payload)
      .then((response) => unwrapResponse(response.data)),

  addOrderItem: (orderId: string, payload: { menuItemId: string; quantity: number; notes?: string }) =>
    apiClient.post(`/cashier/orders/${orderId}/items`, payload).then((response) => unwrapResponse(response.data)),

  updateOrderItem: (orderItemId: string, payload: { quantity?: number; notes?: string }) =>
    apiClient.patch(`/cashier/order-items/${orderItemId}`, payload).then((response) => unwrapResponse(response.data)),

  removeOrderItem: (orderItemId: string) =>
    apiClient.delete(`/cashier/order-items/${orderItemId}`).then((response) => unwrapResponse(response.data)),

  splitBill: (billId: string, groups: Array<{ name?: string; items: Array<{ orderItemId: string; quantity: number }> }>) =>
    apiClient.post(`/cashier/bills/${billId}/split`, { groups }).then((response) => unwrapResponse(response.data)),

  mergeTables: (targetTableId: string, sourceTableIds: string[]) =>
    apiClient.post('/cashier/tables/merge', { targetTableId, sourceTableIds }).then((response) => unwrapResponse(response.data)),

  markTableClean: (tableId: string) =>
    apiClient.post(`/cashier/tables/${tableId}/mark-clean`).then((response) => unwrapResponse(response.data)),

  getTransactions: (params?: { page?: number; limit?: number; from?: string; to?: string; search?: string }) =>
    apiClient.get<CashierTransactionsResponse | ApiResponse<CashierTransactionsResponse>>('/cashier/transactions', { params })
      .then((response) => unwrapResponse(response.data)),

  createRefund: (paymentId: string, payload: { amount: number; reason: string; note?: string }) =>
    apiClient.post(`/cashier/payments/${paymentId}/refund`, payload).then((response) => unwrapResponse(response.data)),
}
