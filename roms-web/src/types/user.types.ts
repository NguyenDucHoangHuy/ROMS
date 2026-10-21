import type { UserRole } from '@/constants/roles'

export interface User {
  id: string
  fullName: string
  name?: string
  email: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  phone?: string
  email?: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  phone: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

/** Loyalty / Membership */
export interface LoyaltyInfo {
  points: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD'
  totalSpent: number
}

export interface CustomerProfile extends User {
  loyalty: LoyaltyInfo | null
}
