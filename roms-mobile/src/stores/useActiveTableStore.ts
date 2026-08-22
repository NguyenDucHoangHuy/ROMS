import { create } from 'zustand';
import type { Table, OrderItemPayload, MenuItem } from '@/types';

interface ActiveTableState {
  activeTable: Table | null;
  cartItems: OrderItemPayload[];
  setActiveTable: (table: Table | null) => void;
  addItem: (menuItem: MenuItem, quantity?: number, note?: string) => void;
  updateItemQuantity: (menuItemId: string, delta: number) => void;
  removeItem: (menuItemId: string) => void;
  updateItemNote: (menuItemId: string, note: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalQuantity: () => number;
}

export const useActiveTableStore = create<ActiveTableState>()((set, get) => ({
  activeTable: null,
  cartItems: [],

  setActiveTable: (table) => set({ activeTable: table, cartItems: [] }),

  addItem: (menuItem, quantity = 1, note = '') => {
    const { cartItems } = get();
    const existing = cartItems.find((i) => i.menuItem.id === menuItem.id);
    if (existing) {
      set({
        cartItems: cartItems.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
            : i
        ),
      });
    } else {
      set({
        cartItems: [...cartItems, { menuItemId: menuItem.id, menuItem, quantity, note }],
      });
    }
  },

  updateItemQuantity: (menuItemId, delta) => {
    const { cartItems } = get();
    const target = cartItems.find((i) => i.menuItem.id === menuItemId);
    if (!target) return;

    const nextQty = target.quantity + delta;
    if (nextQty <= 0) {
      set({ cartItems: cartItems.filter((i) => i.menuItem.id !== menuItemId) });
    } else {
      set({
        cartItems: cartItems.map((i) =>
          i.menuItem.id === menuItemId ? { ...i, quantity: nextQty } : i
        ),
      });
    }
  },

  removeItem: (menuItemId) =>
    set({ cartItems: get().cartItems.filter((i) => i.menuItem.id !== menuItemId) }),

  updateItemNote: (menuItemId, note) =>
    set({
      cartItems: get().cartItems.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, note } : i
      ),
    }),

  clearCart: () => set({ cartItems: [] }),

  getTotalAmount: () =>
    get().cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),

  getTotalQuantity: () =>
    get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
}));