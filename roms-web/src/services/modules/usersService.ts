import apiClient from '@/services/api.client'
import type { User } from '@/types/user.types'
import { UserRole } from '@/constants/roles'

export interface CreateUserPayload {
  phone: string
  fullName: string
  role: string
  password: string
  email?: string
}

export interface UpdateUserPayload {
  phone?: string
  fullName?: string
  role?: string
  password?: string
  email?: string
  isActive?: boolean
}

export const usersService = {
  getAll: () => apiClient.get<User[]>('/users').then((r) => r.data),
  
  getEmployees: () => apiClient.get<User[]>('/users').then(r => {
    const raw = Array.isArray(r.data) ? r.data : (r.data as any).data || []
    return raw.filter((u: any) => {
      const roleStr = typeof u.role === 'object' && u.role?.name ? u.role.name : u.role
      return roleStr !== UserRole.CUSTOMER
    }).map((u: any) => ({
      ...u,
      role: typeof u.role === 'object' && u.role?.name ? u.role.name : u.role,
    }))
  }),

  create: (payload: CreateUserPayload) =>
    apiClient.post<User>('/users', payload).then((r) => r.data),

  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, payload).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/users/${id}`).then((r) => r.data),
}
