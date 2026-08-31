import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface WaiterAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (role?: string) => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useWaiterAuthStore = create<WaiterAuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Hàm login nhanh hỗ trợ test UI không cần Backend
  login: async (role = 'WAITER') => {
    const mockUser: User = {
      id: 'waiter-001',
      name: 'Nguyễn Văn Phục Vụ',
      phone: '0905123456',
      role: role as any,
      isActive: true,
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
    };
    const mockToken = 'mock-jwt-access-token';

    await AsyncStorage.setItem('accessToken', mockToken);
    await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
    set({ user: mockUser, token: mockToken, isAuthenticated: true });
  },

  // Hàm setAuth dùng khi có API Response thực tế từ Backend
  setAuth: async (user, token) => {
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userData');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        set({ user: JSON.parse(userData), token, isAuthenticated: true });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));