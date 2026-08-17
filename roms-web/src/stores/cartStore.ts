import { create } from 'zustand'
import type { MenuItem } from '@/types/menu.types'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  note: string
}

interface CartState {
  tableId: string | null
  items: CartItem[]
  isOpen: boolean

  // Actions
  setTableId: (tableId: string) => void
  addItem: (menuItem: MenuItem, quantity?: number) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  updateNote: (menuItemId: string, note: string) => void
  clearCart: () => void
  toggleCart: () => void

  // Computed getters
  getTotalItems: () => number
  getTotalAmount: () => number
}

export const useCartStore = create<CartState>()((set, get) => ({
  tableId: null,
  items: [],
  isOpen: false,

  setTableId: (tableId) => set({ tableId }),

  addItem: (menuItem, quantity = 1) => {
    const { items } = get()
    const existing = items.find((i) => i.menuItem.id === menuItem.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        ),
      })
    } else {
      set({ items: [...items, { menuItem, quantity, note: '' }] })
    }
  },

  removeItem: (menuItemId) =>
    set({ items: get().items.filter((i) => i.menuItem.id !== menuItemId) }),

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i,
      ),
    })
  },

  updateNote: (menuItemId, note) =>
    set({
      items: get().items.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, note } : i,
      ),
    }),

  clearCart: () => set({ items: [], tableId: null }),

  toggleCart: () => set({ isOpen: !get().isOpen }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getTotalAmount: () =>
    get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}))
