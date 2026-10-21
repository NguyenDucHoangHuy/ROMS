import apiClient from '@/services/api.client'
import type { Table, TableMapData } from '@/types/table.types'

export const tableService = {
  getAll: () =>
    apiClient.get<any[]>('/tables').then((r) => {
      const data = Array.isArray(r.data) ? r.data : []
      return data.map((t) => ({
        ...t,
        name: t.name || t.tableNumber,
        tableNumber: t.tableNumber || t.name,
        zone: t.zone || (t.tableNumber?.toUpperCase().includes('VIP') ? 'VIP' : t.tableNumber?.toUpperCase().includes('BAR') ? 'BAR' : 'INDOOR'),
      })) as Table[]
    }),

  getMap: () =>
    apiClient.get<TableMapData>('/tables/map').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Table>(`/tables/${id}`).then((r) => r.data),

  create: (payload: { tableNumber: string; floor?: number; capacity?: number }) =>
    apiClient.post<Table>('/tables', payload).then((r) => r.data),

  updateStatus: (id: string, status: Table['status']) =>
    apiClient.patch<Table>(`/tables/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tables/${id}`).then((r) => r.data),

  mergeTables: (sourceIds: string[], targetId: string) =>
    apiClient
      .post('/tables/merge', { sourceTableIds: sourceIds, targetTableId: targetId })
      .then((r) => r.data),

  splitTable: (tableId: string) =>
    apiClient.post(`/tables/${tableId}/split`).then((r) => r.data),
}
