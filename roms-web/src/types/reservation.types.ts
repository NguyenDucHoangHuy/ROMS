import type { Table } from './table.types'
import type { User } from './user.types'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type DepositStatus = 'PENDING' | 'PAID' | 'REFUNDED'

export interface ReservationItem {
  id: string
  reservationId: string
  menuItemId: string
  quantity: number
  unitPrice: number | string
  notes?: string | null
  menuItem?: {
    id: string
    name: string
    price: number | string
    imageUrl?: string | null
    description?: string | null
  }
}

export interface Reservation {
  id: string
  customerId?: string | null
  customer?: User | null
  guestName: string
  guestPhone: string
  specialRequest?: string | null
  tableId?: string | null
  table?: Table | null
  partySize: number
  reservationTime: string // ISO datetime từ backend
  depositAmount: number | string
  depositStatus: DepositStatus
  status: ReservationStatus
  createdAt: string
  updatedAt?: string
  reservationItems?: ReservationItem[]
}

/** Payload tạo đặt bàn mới */
export interface CreateReservationPayload {
  guestName: string
  guestPhone: string
  reservationTime: string // ISO datetime
  partySize: number
  specialRequest?: string
  tableId?: string
  depositAmount?: number
  depositStatus?: DepositStatus
  items?: {
    menuItemId: string
    quantity: number
    unitPrice?: number
    notes?: string
  }[]
}

/** Payload check-in */
export interface CheckInPayload {
  id: string
  tableId?: string
}
