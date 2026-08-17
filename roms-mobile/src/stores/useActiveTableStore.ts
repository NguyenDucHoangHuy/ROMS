import { create } from 'zustand'
import type { Table, OrderItemPayload, MenuItem } from '@/types'

interface ActiveTableState {
  activeTable: Table | null
  cartItems: OrderItemPayload[]
  setActiveTable: (table: Table | null) => void
  addItem: (menuItem: MenuItem, quantity?: number, note?: string) => void
  removeItem: (menuItemId: string) => void
  clearCart: () => void
  getTotalAmount: () => number
}

export const useActiveTableStore = create<ActiveTableState>()((set, get) => ({
  activeTable: null,
  cartItems: [],

  setActiveTable: (table) => set({ activeTable: table, cartItems: [] }),

  addItem: (menuItem, quantity = 1, note = '') => {
    const { cartItems } = get()
    const existing = cartItems.find((i) => i.menuItem.id === menuItem.id)
    if (existing) {
      set({
        cartItems: cartItems.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
            : i,
        ),
      })
    } else {
      set({ cartItems: [...cartItems, { menuItemId: menuItem.id, menuItem, quantity, note }] })
    }
  },

  removeItem: (menuItemId) =>
    set({ cartItems: get().cartItems.filter((i) => i.menuItem.id !== menuItemId) }),

  clearCart: () => set({ cartItems: [] }),

  getTotalAmount: () =>
    get().cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
}))
