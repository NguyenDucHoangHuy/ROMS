import { create } from 'zustand'

export type NotificationType = 'ORDER_NEW' | 'ORDER_READY' | 'ORDER_REJECTED' | 'INVENTORY_LOW' | 'INFO' | 'ERROR'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  tableId?: string
  orderId?: string
  timestamp: Date
  isRead: boolean
}

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isRead: false,
    }
    const notifications = [newNotif, ...get().notifications].slice(0, 50) // Max 50
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    })
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    )
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length })
  },

  markAllAsRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }),

  removeNotification: (id) => {
    const notifications = get().notifications.filter((n) => n.id !== id)
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length })
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
