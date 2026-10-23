import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// IP máy tính trong mạng Wi-Fi LAN (Dùng cho cả Điện thoại thật qua Expo Go và Máy ảo)
const DEV_LAN_IP = '172.16.0.188'

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/v1'
  }
  // Cho phép kết nối trực tiếp từ điện thoại thật lẫn máy ảo Android
  return `http://${DEV_LAN_IP}:3000/api/v1`
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default api
