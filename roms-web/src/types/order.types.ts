import type { MenuItem } from './menu.types'
import type { Table } from './table.types'
import type { User } from './user.types'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED'
export type OrderItemStatus = 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'SERVED' | 'REJECTED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'E_WALLET'

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  note: string | null
  status: OrderItemStatus
  rejectedReason: string | null
  isPriority: boolean
}

export interface Order {
  id: string
  tableId: string
  table: Table
  customerId: string | null
  waiterId: string | null
  waiter: User | null
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

/** Payload gọi món từ Client QR hoặc Waiter */
export interface CreateOrderPayload {
  tableId: string
  items: {
    menuItemId: string
    quantity: number
    note?: string
  }[]
}

/** Payload thêm item vào order đang mở */
export interface AddOrderItemsPayload {
  items: {
    menuItemId: string
    quantity: number
    note?: string
  }[]
}

/** Payload thanh toán */
export interface ProcessPaymentPayload {
  paymentMethod: PaymentMethod
  memberPhone?: string
  couponCode?: string
  splitCount?: number
}

/** Response KDS — simplified order for kitchen display */
export interface KitchenOrderItem {
  id: string
  orderId: string
  tableId: string
  tableName: string
  menuItemName: string
  quantity: number
  note: string | null
  status: OrderItemStatus
  isPriority: boolean
  createdAt: string
}
