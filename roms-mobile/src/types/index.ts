import type { UserRole } from '@/constants/roles'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  isActive: boolean
}

export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING'

export interface Table {
  id: string
  name: string
  capacity: number
  floor: number
  zone: string
  status: TableStatus
  currentOrderId: string | null
  xPosition: number
  yPosition: number
}

export interface MenuItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
  isAvailable: boolean
  categoryId: string
}

export interface OrderItemPayload {
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  note?: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  checkInTime: string
  checkOutTime?: string
  latitude: number
  longitude: number
  isValidLocation: boolean
}
