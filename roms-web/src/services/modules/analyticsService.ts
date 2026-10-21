import { apiClient } from '../api.client'

export interface OverviewStats {
  kpi: {
    revenue: {
      value: number
      growth: number
    }
    guests: {
      value: number
      capacity: number
    }
    pendingOrders: {
      value: number
      avgTime: string
    }
    inventory: {
      lowStock: number
    }
  }
  chart: {
    labels: string[]
    data: number[]
  }
  liveOrders: Array<{
    id: string
    code: string
    table: string
    time: string
    items: string[]
    status: string
  }>
}

export const analyticsService = {
  getOverview: async (): Promise<OverviewStats> => {
    const response = await apiClient.get<OverviewStats>('/analytics/overview')
    return response.data
  },
}
