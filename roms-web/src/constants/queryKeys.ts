/**
 * TanStack Query key factories
 * Dùng để đồng bộ cache keys, tránh typo và dễ invalidate
 */
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Tables
  tables: {
    all: () => ['tables'] as const,
    byId: (id: string) => ['tables', id] as const,
    map: () => ['tables', 'map'] as const,
  },

  // Menu
  menu: {
    all: () => ['menu'] as const,
    categories: () => ['menu', 'categories'] as const,
    byCategory: (categoryId: string) => ['menu', 'category', categoryId] as const,
    byId: (id: string) => ['menu', id] as const,
  },

  // Orders
  orders: {
    all: () => ['orders'] as const,
    byId: (id: string) => ['orders', id] as const,
    byTable: (tableId: string) => ['orders', 'table', tableId] as const,
    kitchenQueue: () => ['orders', 'kitchen-queue'] as const,
    pendingPayment: () => ['orders', 'pending-payment'] as const,
  },

  // Reservations
  reservations: {
    all: () => ['reservations'] as const,
    byId: (id: string) => ['reservations', id] as const,
    today: () => ['reservations', 'today'] as const,
  },

  // Inventory
  inventory: {
    all: () => ['inventory'] as const,
    byId: (id: string) => ['inventory', id] as const,
    lowStock: () => ['inventory', 'low-stock'] as const,
    receipts: () => ['inventory', 'receipts'] as const,
  },

  // HR
  hr: {
    staff: () => ['hr', 'staff'] as const,
    schedules: () => ['hr', 'schedules'] as const,
    attendance: () => ['hr', 'attendance'] as const,
  },

  // Analytics
  analytics: {
    revenue: (params: Record<string, unknown>) => ['analytics', 'revenue', params] as const,
    topItems: () => ['analytics', 'top-items'] as const,
    forecast: () => ['analytics', 'forecast'] as const,
  },

  // Audit Logs
  auditLogs: {
    all: (params?: Record<string, unknown>) => ['audit-logs', params] as const,
  },
} as const
