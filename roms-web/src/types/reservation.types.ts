import type { Table } from './table.types'
import type { User } from './user.types'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type DepositStatus = 'PENDING' | 'PAID' | 'REFUNDED'

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
}

/** Payload check-in */
export interface CheckInPayload {
  id: string
  tableId?: string
}
