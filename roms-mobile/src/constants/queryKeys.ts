export const queryKeys = {
  tables: {
    all: () => ['tables'] as const,
    map: () => ['tables', 'map'] as const,
    byId: (id: string) => ['tables', id] as const,
  },
  menu: {
    all: () => ['menu'] as const,
    categories: () => ['menu', 'categories'] as const,
  },
  orders: {
    byTable: (tableId: string) => ['orders', 'table', tableId] as const,
    waiterActive: () => ['orders', 'waiter', 'active'] as const,
  },
  attendance: {
    history: () => ['attendance', 'history'] as const,
    today: () => ['attendance', 'today'] as const,
  },
} as const
