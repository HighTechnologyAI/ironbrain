import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children, url }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const reconnectTimeoutRef = useRef(null)
  const maxReconnectAttempts = 10
  const reconnectDelay = 3000 // 3 seconds

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing socket connection to:', url)
    
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay,
      forceNew: true
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
      setConnectionError(null)
      setReconnectAttempts(0)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect()
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error.message)
      setConnectionError(error.message)
      setIsConnected(false)
      
      setReconnectAttempts(prev => {
        const attempts = prev + 1
        console.log(`🔄 Reconnect attempt ${attempts}/${maxReconnectAttempts}`)
        return attempts
      })
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      setConnectionError(null)
      setReconnectAttempts(0)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('💥 Socket reconnection failed after maximum attempts')
      setConnectionError('Failed to reconnect after maximum attempts')
    })

    // GCS specific events
    newSocket.on('connection_status', (data) => {
      console.log('📡 GCS connection status:', data)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      newSocket.close()
    }
  }, [url])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socket && !isConnected) {
      console.log('🔄 Manual reconnect attempt')
      socket.connect()
    }
  }, [socket, isConnected])

  // Emit event with error handling
  const emit = useCallback((event, data, callback) => {
    if (socket && isConnected) {
      try {
        socket.emit(event, data, callback)
        console.log(`📤 Emitted event: ${event}`, data)
      } catch (error) {
        console.error(`❌ Failed to emit event ${event}:`, error)
      }
    } else {
      console.warn(`⚠️ Cannot emit event ${event}: socket not connected`)
    }
  }, [socket, isConnected])

  // Subscribe to event with cleanup
  const on = useCallback((event, handler) => {
    if (socket) {
      socket.on(event, handler)
      console.log(`👂 Subscribed to event: ${event}`)
      
      // Return cleanup function
      return () => {
        socket.off(event, handler)
        console.log(`🔇 Unsubscribed from event: ${event}`)
      }
    }
    return () => {}
  }, [socket])

  // Unsubscribe from event
  const off = useCallback((event, handler) => {
    if (socket) {
      socket.off(event, handler)
      console.log(`🔇 Unsubscribed from event: ${event}`)
    }
  }, [socket])

  // Get connection statistics
  const getConnectionStats = useCallback(() => {
    if (!socket) return null
    
    return {
      id: socket.id,
      connected: socket.connected,
      disconnected: socket.disconnected,
      transport: socket.io.engine?.transport?.name,
      reconnectAttempts,
      maxReconnectAttempts,
      url: socket.io.uri
    }
  }, [socket, reconnectAttempts])

  const value = {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    emit,
    on,
    off,
    reconnect,
    getConnectionStats
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

