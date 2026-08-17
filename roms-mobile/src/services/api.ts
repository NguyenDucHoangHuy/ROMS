import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// IP local hoặc API backend domain
const API_URL = 'http://10.0.2.2:3000/api/v1' // 10.0.2.2 cho Android Emulator / localhost

export const api = axios.create({
  baseURL: API_URL,
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
