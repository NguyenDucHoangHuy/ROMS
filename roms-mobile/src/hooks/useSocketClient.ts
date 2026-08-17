import { useEffect } from 'react'
import { getSocketClient } from '@/services/socket'

export function useSocketClient(eventName: string, callback: (data: any) => void) {
  useEffect(() => {
    const socket = getSocketClient()
    socket.on(eventName, callback)

    return () => {
      socket.off(eventName, callback)
    }
  }, [eventName, callback])
}
