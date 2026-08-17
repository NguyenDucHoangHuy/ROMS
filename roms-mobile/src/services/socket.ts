import { io, type Socket } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SOCKET_URL = 'http://10.0.2.2:3000'

let socket: Socket | null = null

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return socket
}

export async function connectSocketClient(): Promise<void> {
  const token = await AsyncStorage.getItem('accessToken')
  const s = getSocketClient()
  s.auth = { token }
  if (!s.connected) {
    s.connect()
  }
}

export function disconnectSocketClient(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}
