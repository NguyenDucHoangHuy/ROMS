import apiClient from '@/services/api.client'
import type { Table, TableMapData } from '@/types/table.types'

export const tableService = {
  getAll: () =>
    apiClient.get<Table[]>('/tables').then((r) => r.data),

  getMap: () =>
    apiClient.get<TableMapData>('/tables/map').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Table>(`/tables/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: Table['status']) =>
    apiClient.patch<Table>(`/tables/${id}/status`, { status }).then((r) => r.data),

  mergeTables: (sourceIds: string[], targetId: string) =>
    apiClient
      .post('/tables/merge', { sourceTableIds: sourceIds, targetTableId: targetId })
      .then((r) => r.data),

  splitTable: (tableId: string) =>
    apiClient.post(`/tables/${tableId}/split`).then((r) => r.data),
}
