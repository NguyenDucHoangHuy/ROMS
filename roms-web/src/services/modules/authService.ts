import apiClient from '@/services/api.client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/user.types'

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),

  getMe: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    apiClient
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
      .then((r) => r.data),
}
