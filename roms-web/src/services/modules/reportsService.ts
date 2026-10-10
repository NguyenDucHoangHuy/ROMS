import apiClient from '@/services/api.client'

export type RevenuePeriod = 'day' | 'week' | 'month'

export interface RevenueSummaryResponse {
  period: string
  from: string
  to: string
  summary: {
    grossRevenue: number
    discountAmount: number
    refundAmount: number
    netRevenue: number
    totalOrders: number
    paidOrders: number
    averageOrderValue: number
  }
  paymentMethods: Array<{
    method: 'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO'
    amount: number
    count: number
    percentage: number
  }>
  dailyRevenue: Array<{
    date: string
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    date: string
    time: string
    status: 'Completed' | 'Refunded'
    payment: 'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO'
    amount: number
  }>
}

export interface EndOfDayReportResponse {
  date: string
  summary: RevenueSummaryResponse['summary']
  paymentMethods: RevenueSummaryResponse['paymentMethods']
  salesByCategory: Array<{
    name: string
    percentage: number
    revenue: number
    quantity: number
  }>
  topItems: Array<{
    rank: number
    name: string
    quantity: number
    unit: string
    revenue: number
  }>
  inventoryAlerts: Array<{
    name: string
    status: 'OUT OF STOCK' | 'LOW STOCK (<5)'
    severity: 'danger' | 'warning'
    quantity: number
  }>
  shiftSummary: Array<{
    staffName: string
    role: string
    shiftTime: string
    totalSales: number
    status: 'Closed' | 'Open'
  }>
  recentTransactions: RevenueSummaryResponse['recentTransactions']
}

export interface CashierShiftStatusResponse {
  hasShift: boolean
  assignmentId?: string
  shiftId?: string
  shiftName: string | null
  startTime: string | null
  endTime: string | null
  status: 'OPEN' | 'CLOSED' | 'NOT_STARTED' | 'NO_ASSIGNMENT'
  checkInTime: string | null
  checkOutTime: string | null
  totalSales: number
}

export const reportsService = {
  getRevenueSummary: (params?: { period?: string; from?: string; to?: string }) =>
    apiClient.get<RevenueSummaryResponse>('/cashier/revenue', { params }).then((response) => {
      const payload = response.data as RevenueSummaryResponse & { data?: RevenueSummaryResponse }
      return payload?.data ?? payload
    }),

  getAuditLogs: (params?: Record<string, string | number | undefined>) =>
    apiClient.get('/cashier/audit-logs', { params }).then((response) => {
      const payload = response.data as { data?: unknown } & Record<string, unknown>
      return payload?.data ?? payload
    }),

  getEndOfDayReport: (date: string) =>
    apiClient.get<EndOfDayReportResponse>('/cashier/end-of-day', { params: { date } }).then((response) => {
      const payload = response.data as EndOfDayReportResponse & { data?: EndOfDayReportResponse }
      return payload?.data ?? payload
    }),

  getCurrentShift: () =>
    apiClient.get<CashierShiftStatusResponse>('/cashier/shifts/current').then((response) => {
      const payload = response.data as CashierShiftStatusResponse & { data?: CashierShiftStatusResponse }
      return payload?.data ?? payload
    }),

  startShift: () =>
    apiClient.post('/cashier/shifts/start').then((response) => response.data),

  closeShift: () =>
    apiClient.post('/cashier/shifts/close').then((response) => response.data),
}
