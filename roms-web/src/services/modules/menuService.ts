import apiClient from '@/services/api.client'
import type { MenuItem, MenuCategory, RecommendedItem, CreateMenuItemPayload } from '@/types/menu.types'

export const menuService = {
  getAll: () =>
    apiClient.get<MenuItem[]>('/menu-items').then((r) => r.data),

  getByCategory: (categoryId: string) =>
    apiClient.get<MenuItem[]>(`/menu-items?categoryId=${categoryId}`).then((r) => r.data),

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
    apiClient.get<MenuCategory[]>('/categories').then((r) => r.data),

  // AI Recommendation
  getRecommendations: (menuItemIds: string[]) =>
    apiClient
      .post<RecommendedItem[]>('/menu-items/recommendations', { menuItemIds })
      .then((r) => r.data),
}
