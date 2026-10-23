import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';
import { api, setOnUnauthorizedCallback } from '@/services/api';

interface WaiterAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (role?: string) => Promise<void>;
  loginWithCredentials: (phone: string, password: string) => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useWaiterAuthStore = create<WaiterAuthState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Đăng nhập nhanh tài khoản Waiter mẫu trong DB để lấy Token JWT thật
  login: async (role = 'WAITER') => {
    try {
      await get().loginWithCredentials('0905333444', 'Admin@123');
    } catch (err) {
      console.warn('Lỗi đăng nhập tài khoản mẫu qua API:', err);
      throw err;
    }
  },

  // Đăng nhập thực tế với Backend
  loginWithCredentials: async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    const data = res.data?.data || res.data;
    const user = data.user;
    const accessToken = data.accessToken;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    set({ user, token: accessToken, isAuthenticated: true });
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
      // Không chấp nhận token giả lập cũ mock-jwt-access-token
      if (token && token !== 'mock-jwt-access-token' && userData) {
        set({ user: JSON.parse(userData), token, isAuthenticated: true });
      } else {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('userData');
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

// Khi nhận lỗi 401 từ API, tự động đồng bộ logout trạng thái người dùng
setOnUnauthorizedCallback(() => {
  useWaiterAuthStore.getState().logout();
});
