import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '@/types'

interface WaiterAuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => Promise<void>
  logout: () => Promise<void>
  loadStoredAuth: () => Promise<void>
}

export const useWaiterAuthStore = create<WaiterAuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('accessToken', token)
    await AsyncStorage.setItem('userData', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('userData')
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadStoredAuth: async () => {
    const token = await AsyncStorage.getItem('accessToken')
    const userData = await AsyncStorage.getItem('userData')
    if (token && userData) {
      set({ user: JSON.parse(userData), token, isAuthenticated: true })
    }
  },
}))
