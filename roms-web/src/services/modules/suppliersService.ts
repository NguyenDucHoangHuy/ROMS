import apiClient from '@/services/api.client'

export interface Supplier {
  id: string
  name: string
  category: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  status: 'ACTIVE' | 'INACTIVE' | string
  rating: number
  inFlightOrders: number
  createdAt: string
  updatedAt: string
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  preferredVendors: number
  pendingDeliveries: number
}

export interface CreateSupplierPayload {
  name: string
  category: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  status?: string
  rating?: number
  inFlightOrders?: number
}

export interface UpdateSupplierPayload {
  name?: string
  category?: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  status?: string
  rating?: number
  inFlightOrders?: number
}

export const suppliersService = {
  getAll: (search?: string, category?: string) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (category && category !== 'ALL') params.category = category
    return apiClient.get<Supplier[]>('/suppliers', { params }).then((r) => r.data)
  },

  getStats: () =>
    apiClient.get<SupplierStats>('/suppliers/stats').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),

  create: (payload: CreateSupplierPayload) =>
    apiClient.post<Supplier>('/suppliers', payload).then((r) => r.data),

  update: (id: string, payload: UpdateSupplierPayload) =>
    apiClient.patch<Supplier>(`/suppliers/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/suppliers/${id}`).then((r) => r.data),
}
