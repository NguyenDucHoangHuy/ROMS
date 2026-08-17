/** Centralized route paths — tránh magic strings rải rác trong code */
export const ROUTES = {
  // Public / Auth
  LOGIN: '/login',

  // Customer (QR)
  CLIENT: {
    ROOT: '/table/:tableId',
    MENU: '/table/:tableId/menu',
    CART: '/table/:tableId/cart',
    ORDER_STATUS: '/table/:tableId/order-status',
  },
  RESERVATION: '/reservation',

  // Kitchen Dashboard (Chef)
  KITCHEN: '/kitchen',

  // Cashier POS
  CASHIER: {
    ROOT: '/cashier',
    BILL: '/cashier/bill/:orderId',
  },

  // Manager / Admin
  MANAGER: {
    ROOT: '/manager',
    ANALYTICS: '/manager/analytics',
    MENU: '/manager/menu',
    INVENTORY: '/manager/inventory',
    HR: '/manager/hr',
    SCHEDULING: '/manager/hr/scheduling',
    TABLES: '/manager/tables',
    PROMOTIONS: '/manager/promotions',
    LOYALTY: '/manager/loyalty',
    AUDIT_LOGS: '/manager/audit-logs',
    SETTINGS: '/manager/settings',
  },
} as const
