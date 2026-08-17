import { useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

type SocketEvent = string
type SocketCallback = (...args: unknown[]) => void

/**
 * Hook lắng nghe các Socket.IO events.
 * Tự động cleanup listener khi component unmount hoặc eventName thay đổi.
 *
 * @example
 * useSocket('order:new', (data) => {
 *   kitchenStore.addToQueue(data)
 * })
 */
export function useSocket(eventName: SocketEvent, callback: SocketCallback): void {
  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    const socket: Socket = getSocket()

    socket.on(eventName, stableCallback)

    return () => {
      socket.off(eventName, stableCallback)
    }
  }, [eventName, stableCallback])
}

/**
 * Hook lắng nghe nhiều events cùng lúc.
 * Dùng ở Kitchen Dashboard hoặc Manager.
 */
export function useSocketMultiple(
  events: Array<{ name: SocketEvent; handler: SocketCallback }>,
): void {
  useEffect(() => {
    const socket: Socket = getSocket()

    events.forEach(({ name, handler }) => {
      socket.on(name, handler)
    })

    return () => {
      events.forEach(({ name, handler }) => {
        socket.off(name, handler)
      })
    }
  }, [events])
}
