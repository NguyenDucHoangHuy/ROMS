import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MenuItem } from '@/types/menu.types'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (menuItem: MenuItem, quantity?: number) => void
  removeItem: (menuItem_id: string) => void
  updateQuantity: (menuItem_id: string, quantity: number) => void
  clearCart: () => void
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000 // 1 tuần tính theo milliseconds

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Thêm món vào giỏ hàng (từ Menu hoặc Icon Add to cart)
      addItem: (menuItem, quantity = 1) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex(
          (item) => item.menuItem.id === menuItem.id
        )

        if (existingIndex > -1) {
          const updatedItems = [...currentItems]
          updatedItems[existingIndex].quantity += quantity
          set({ items: updatedItems })
        } else {
          set({ items: [...currentItems, { menuItem, quantity }] })
        }
      },

      // Xóa món khỏi giỏ
      removeItem: (menuItem_id) => {
        set({ items: get().items.filter((item) => item.menuItem.id !== menuItem_id) })
      },

      // Cập nhật số lượng
      updateQuantity: (menuItem_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItem_id)
        } else {
          set({
            items: get().items.map((item) =>
              item.menuItem.id === menuItem_id ? { ...item, quantity } : item
            ),
          })
        }
      },

      // Xóa sạch giỏ hàng (Gọi hàm này sau khi đặt bàn / thanh toán thành công)
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'restaurant_cart_storage',
      storage: createJSONStorage(() => localStorage),
      
      // Xử lý tự động xóa giỏ hàng sau 1 tuần
      onRehydrateStorage: () => (state) => {
        if (!state) return

        const storedData = localStorage.getItem('restaurant_cart_storage')
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData)
            const updatedAt = parsed?.state?.updatedAt || Date.now()
            
            // Kiểm tra xem đã quá 1 tuần chưa
            if (Date.now() - updatedAt > ONE_WEEK_MS) {
              state.clearCart()
              localStorage.removeItem('restaurant_cart_storage')
            }
          } catch (e) {
            console.error('Error parsing cart expiration:', e)
          }
        }
      },
    }
  )
)