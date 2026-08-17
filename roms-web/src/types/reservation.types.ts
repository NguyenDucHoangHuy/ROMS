import type { Table } from './table.types'
import type { User } from './user.types'
import type { MenuItem } from './menu.types'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED'

export interface ReservationItem {
  id: string
  reservationId: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  unitPrice: number
}

export interface Reservation {
  id: string
  customerId: string
  customer: User
  tableId: string | null
  table: Table | null
  partySize: number
  reservationDate: string    // ISO datetime
  durationMinutes: number    // Mặc định 90 phút
  status: ReservationStatus
  depositAmount: number      // Số tiền đặt cọc
  depositPaid: boolean
  items: ReservationItem[]   // Món ăn đặt trước
  notes: string | null
  confirmationCode: string   // Mã xác nhận gửi SMS/Email
  createdAt: string
  updatedAt: string
}

/** Payload tạo đặt bàn mới */
export interface CreateReservationPayload {
  tableId?: string
  partySize: number
  reservationDate: string
  notes?: string
  items?: {
    menuItemId: string
    quantity: number
  }[]
}

/** Payload check-in bởi Waiter */
export interface CheckInPayload {
  confirmationCode: string
  tableId: string
}
