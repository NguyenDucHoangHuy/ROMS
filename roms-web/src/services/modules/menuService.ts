import apiClient from '@/services/api.client'
import type { MenuItem, MenuCategory, RecommendedItem, CreateMenuItemPayload } from '@/types/menu.types'

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)) {
    return payload.data as T[]
  }
  if (payload && typeof payload === 'object' && 'items' in payload && Array.isArray(payload.items)) {
    return payload.items as T[]
  }
  return []
}

export const menuService = {
  getAll: () =>
    apiClient.get<unknown>('/menu-items').then((r) => toList<MenuItem>(r.data)),

  getByCategory: (categoryId: string) =>
    apiClient.get<unknown>(`/menu-items?categoryId=${categoryId}`).then((r) => toList<MenuItem>(r.data)),

  getById: (id: string) =>
    apiClient.get<MenuItem>(`/menu-items/${id}`).then((r) => r.data),

  create: (payload: CreateMenuItemPayload) =>
    apiClient.post<MenuItem>('/menu-items', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateMenuItemPayload>) =>
    apiClient.patch<MenuItem>(`/menu-items/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/menu-items/${id}`).then((r) => r.data),

  toggleAvailability: (id: string, isAvailable: boolean) =>
    apiClient
      .patch<MenuItem>(`/menu-items/${id}/availability`, { isAvailable })
      .then((r) => r.data),

  // Categories
  getCategories: () =>
    apiClient.get<unknown>('/categories').then((r) => toList<MenuCategory>(r.data)),

  // AI Recommendation
  getRecommendations: (menuItemIds: string[]) =>
    apiClient
      .post<RecommendedItem[]>('/menu-items/recommendations', { menuItemIds })
      .then((r) => r.data),
}
