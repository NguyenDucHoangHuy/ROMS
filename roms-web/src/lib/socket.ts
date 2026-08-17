import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string

/**
 * Socket.IO client singleton.
 * Kết nối LAZY (chỉ connect khi gọi socket.connect() hoặc emit đầu tiên).
 * Dùng autoConnect: false để tránh kết nối vô ích ở trang public (Login, QR...).
 */
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket(token: string): void {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) {
    s.connect()
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}
