import { create } from 'zustand'
import type { KitchenOrderItem } from '@/types/order.types'

type KitchenFilter = 'ALL' | 'PENDING' | 'COOKING' | 'READY'

interface KitchenState {
  queue: KitchenOrderItem[]
  filter: KitchenFilter
  soundEnabled: boolean

  // Actions
  setQueue: (items: KitchenOrderItem[]) => void
  addToQueue: (item: KitchenOrderItem) => void
  updateItemStatus: (itemId: string, status: KitchenOrderItem['status']) => void
  removeFromQueue: (itemId: string) => void
  prioritizeItem: (itemId: string) => void
  setFilter: (filter: KitchenFilter) => void
  toggleSound: () => void

  // Computed
  getFilteredQueue: () => KitchenOrderItem[]
}

export const useKitchenStore = create<KitchenState>()((set, get) => ({
  queue: [],
  filter: 'ALL',
  soundEnabled: true,

  setQueue: (items) => set({ queue: items }),

  addToQueue: (item) =>
    set({ queue: [...get().queue, item] }),

  updateItemStatus: (itemId, status) =>
    set({
      queue: get().queue.map((item) =>
        item.id === itemId ? { ...item, status } : item,
      ),
    }),

  removeFromQueue: (itemId) =>
    set({ queue: get().queue.filter((item) => item.id !== itemId) }),

  prioritizeItem: (itemId) => {
    const { queue } = get()
    const item = queue.find((i) => i.id === itemId)
    if (!item) return
    const rest = queue.filter((i) => i.id !== itemId)
    set({ queue: [{ ...item, isPriority: true }, ...rest] })
  },

  setFilter: (filter) => set({ filter }),

  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),

  getFilteredQueue: () => {
    const { queue, filter } = get()
    if (filter === 'ALL') return queue
    return queue.filter((item) => item.status === filter)
  },
}))
