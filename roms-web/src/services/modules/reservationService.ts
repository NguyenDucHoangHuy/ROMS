import apiClient from '@/services/api.client'
import type { Reservation, CreateReservationPayload, CheckInPayload } from '@/types/reservation.types'

export const reservationService = {
  create: (payload: CreateReservationPayload) =>
    apiClient.post<Reservation>('/reservations', payload).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Reservation>(`/reservations/${id}`).then((r) => r.data),

  getByConfirmationCode: (code: string) =>
    apiClient.get<Reservation>(`/reservations/code/${code}`).then((r) => r.data),

  getToday: () =>
    apiClient.get<Reservation[]>('/reservations/today').then((r) => r.data),

  getAll: (params?: { status?: string; date?: string }) =>
    apiClient.get<Reservation[]>('/reservations', { params }).then((r) => r.data),

  checkIn: (payload: CheckInPayload) =>
    apiClient.post<Reservation>('/reservations/check-in', payload).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    apiClient.patch<Reservation>(`/reservations/${id}/cancel`, { reason }).then((r) => r.data),

  assignTable: (id: string, tableId: string) =>
    apiClient
      .patch<Reservation>(`/reservations/${id}/table`, { tableId })
      .then((r) => r.data),
}
