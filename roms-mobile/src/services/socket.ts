import { io, type Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEV_LAN_IP = '172.16.0.188';

const getSocketUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  return `http://${DEV_LAN_IP}:3000`;
};

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export async function connectSocketClient(): Promise<void> {
  const token = await AsyncStorage.getItem('accessToken');
  const s = getSocketClient();
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocketClient(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
