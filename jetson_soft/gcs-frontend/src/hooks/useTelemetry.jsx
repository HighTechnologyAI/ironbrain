import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'

const TelemetryContext = createContext()

export const useTelemetry = () => {
  const context = useContext(TelemetryContext)
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider')
  }
  return context
}

// Initial telemetry state
const initialTelemetry = {
  timestamp: 0,
  armed: false,
  mode: "UNKNOWN",
  battery_voltage: 0.0,
  battery_current: 0.0,
  battery_remaining: 0,
  gps_lat: 0.0,
  gps_lon: 0.0,
  gps_alt: 0.0,
  gps_satellites: 0,
  gps_fix_type: 0,
  altitude: 0.0,
  groundspeed: 0.0,
  airspeed: 0.0,
  roll: 0.0,
  pitch: 0.0,
  yaw: 0.0,
  climb_rate: 0.0,
  throttle: 0
}

const initialConnection = {
  connected: false,
  messages_received: 0,
  messages_sent: 0,
  connection_time: 0,
  last_heartbeat_age: 0
}

export const TelemetryProvider = ({ children, onConnectionChange }) => {
  const { socket, isConnected, emit, on } = useSocket()
  
  // Telemetry state
  const [telemetry, setTelemetry] = useState(initialTelemetry)
  const [connection, setConnection] = useState(initialConnection)
  const [history, setHistory] = useState([])
  const [isReceivingData, setIsReceivingData] = useState(false)
  
  // Performance tracking
  const [updateRate, setUpdateRate] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)
  const updateCountRef = useRef(0)
  const updateRateIntervalRef = useRef(null)
  
  // History management (keep last 300 entries = 30 seconds at 10Hz)
  const maxHistorySize = 300
  
  // Calculate update rate every second
  useEffect(() => {
    updateRateIntervalRef.current = setInterval(() => {
      setUpdateRate(updateCountRef.current)
      updateCountRef.current = 0
    }, 1000)
    
    return () => {
      if (updateRateIntervalRef.current) {
        clearInterval(updateRateIntervalRef.current)
      }
    }
  }, [])

  // Handle telemetry updates
  const handleTelemetryUpdate = useCallback((data) => {
    const now = Date.now()
    
    // Update telemetry data
    if (data.telemetry) {
      setTelemetry(prev => ({
        ...prev,
        ...data.telemetry,
        timestamp: now
      }))
      
      // Add to history (memory efficient)
      setHistory(prev => {
        const newHistory = [...prev, { ...data.telemetry, timestamp: now }]
        return newHistory.length > maxHistorySize 
          ? newHistory.slice(-maxHistorySize) 
          : newHistory
      })
    }
    
    // Update connection stats
    if (data.connection) {
      setConnection(prev => ({
        ...prev,
        ...data.connection
      }))
      
      // Notify parent about connection changes
      if (onConnectionChange) {
        onConnectionChange(data.connection.connected)
      }
    }
    
    // Update performance metrics
    setLastUpdateTime(now)
    setIsReceivingData(true)
    updateCountRef.current++
    
    // Auto-reset receiving flag if no updates for 3 seconds
    setTimeout(() => {
      setIsReceivingData(false)
    }, 3000)
    
  }, [onConnectionChange])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return

    console.log('📡 Setting up telemetry event handlers')

    // Subscribe to telemetry updates
    const unsubscribeTelemetry = on('telemetry_update', handleTelemetryUpdate)
    
    // Subscribe to system status
    const unsubscribeSystem = on('system_status', (data) => {
      console.log('📊 System status update:', data)
    })
    
    // Request initial telemetry data
    emit('request_telemetry')
    
    return () => {
      unsubscribeTelemetry()
      unsubscribeSystem()
    }
  }, [socket, isConnected, on, emit, handleTelemetryUpdate])

  // Send MAVLink command
  const sendCommand = useCallback(async (command, params = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'))
      }, 10000) // 10 second timeout

      emit('send_command', { command, params }, (response) => {
        clearTimeout(timeout)
        
        if (response && response.success) {
          console.log(`✅ Command ${command} executed successfully`)
          resolve(response)
        } else {
          console.error(`❌ Command ${command} failed:`, response?.message || 'Unknown error')
          reject(new Error(response?.message || 'Command failed'))
        }
      })
    })
  }, [socket, isConnected, emit])

  // Connect to MAVLink
  const connectMAVLink = useCallback(async (connectionString = 'udp:0.0.0.0:14550') => {
    try {
      const response = await fetch('/api/mavlink/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connection_string: connectionString })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ MAVLink connected:', connectionString)
        return true
      } else {
        console.error('❌ MAVLink connection failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('❌ MAVLink connection error:', error)
      return false
    }
  }, [])

  // Disconnect from MAVLink
  const disconnectMAVLink = useCallback(async () => {
    try {
      const response = await fetch('/api/mavlink/disconnect', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ MAVLink disconnected')
        setConnection(initialConnection)
        setTelemetry(initialTelemetry)
        setHistory([])
        return true
      } else {
        console.error('❌ MAVLink disconnect failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('❌ MAVLink disconnect error:', error)
      return false
    }
  }, [])

  // Get telemetry statistics
  const getStats = useCallback(() => {
    return {
      updateRate,
      lastUpdateTime,
      historySize: history.length,
      isReceivingData,
      connection: {
        ...connection,
        uptime: connection.connection_time > 0 ? Date.now() - connection.connection_time : 0
      }
    }
  }, [updateRate, lastUpdateTime, history.length, isReceivingData, connection])

  // Get specific telemetry values with history
  const getTelemetryHistory = useCallback((field, duration = 30) => {
    const cutoffTime = Date.now() - (duration * 1000)
    return history
      .filter(entry => entry.timestamp > cutoffTime)
      .map(entry => ({
        timestamp: entry.timestamp,
        value: entry[field] || 0
      }))
  }, [history])

  // Calculate derived values
  const derivedValues = {
    // Battery percentage (estimated)
    batteryPercent: telemetry.battery_remaining || 
      Math.max(0, Math.min(100, ((telemetry.battery_voltage - 10.5) / (12.6 - 10.5)) * 100)),
    
    // GPS status
    gpsStatus: telemetry.gps_fix_type >= 3 ? 'GPS_OK' : 
               telemetry.gps_fix_type === 2 ? 'GPS_2D' : 
               telemetry.gps_fix_type === 1 ? 'GPS_NO_FIX' : 'GPS_NO_GPS',
    
    // Distance from home (if available)
    distanceFromHome: 0, // Would calculate from home position
    
    // Flight time (estimated)
    flightTime: connection.connected ? Math.floor((Date.now() - connection.connection_time) / 1000) : 0,
    
    // Signal quality (based on heartbeat age)
    signalQuality: connection.last_heartbeat_age < 2 ? 'EXCELLENT' :
                   connection.last_heartbeat_age < 5 ? 'GOOD' :
                   connection.last_heartbeat_age < 10 ? 'POOR' : 'LOST'
  }

  const value = {
    // Current data
    telemetry,
    connection,
    derivedValues,
    
    // History and stats
    history,
    updateRate,
    isReceivingData,
    getStats,
    getTelemetryHistory,
    
    // Actions
    sendCommand,
    connectMAVLink,
    disconnectMAVLink
  }

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  )
}

