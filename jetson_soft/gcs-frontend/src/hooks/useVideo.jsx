import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

const VideoContext = createContext()

export const useVideo = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}

export const VideoProvider = ({ children }) => {
  // Video state
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSource, setCurrentSource] = useState(null)
  const [videoStats, setVideoStats] = useState({
    fps: 0,
    bitrate: 0,
    resolution: '0x0',
    codec: 'unknown',
    latency_ms: 0,
    frames_processed: 0,
    frames_dropped: 0,
    bandwidth_mbps: 0.0
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Video element ref
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  
  // Supported video sources
  const supportedSources = {
    test: {
      name: 'Test Pattern',
      description: 'Built-in test pattern for testing',
      parameters: ['width', 'height', 'fps']
    },
    nighthawk: {
      name: 'Nighthawk2-UZ Camera',
      description: 'NextVision Nighthawk2-UZ professional camera',
      parameters: ['ip', 'port', 'username', 'password']
    },
    rtsp: {
      name: 'RTSP Stream',
      description: 'Generic RTSP video stream',
      parameters: ['url']
    },
    udp: {
      name: 'UDP Stream',
      description: 'UDP RTP video stream',
      parameters: ['port']
    },
    usb: {
      name: 'USB Camera',
      description: 'USB connected camera',
      parameters: ['device', 'width', 'height', 'fps']
    }
  }

  // Start video stream
  const startStream = useCallback(async (source, params = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`🎬 Starting video stream: ${source}`, params)
      
      const response = await fetch('/api/video/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source,
          ...params
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsStreaming(true)
        setCurrentSource(source)
        console.log(`✅ Video stream started: ${source}`)
        
        // Start video element if available
        if (videoRef.current) {
          await startVideoElement()
        }
        
        return true
      } else {
        throw new Error(data.message || 'Failed to start video stream')
      }
    } catch (err) {
      console.error('❌ Failed to start video stream:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Stop video stream
  const stopStream = useCallback(async () => {
    setIsLoading(true)
    
    try {
      console.log('🛑 Stopping video stream')
      
      // Stop video element
      if (videoRef.current) {
        stopVideoElement()
      }
      
      const response = await fetch('/api/video/stop', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsStreaming(false)
        setCurrentSource(null)
        setVideoStats({
          fps: 0,
          bitrate: 0,
          resolution: '0x0',
          codec: 'unknown',
          latency_ms: 0,
          frames_processed: 0,
          frames_dropped: 0,
          bandwidth_mbps: 0.0
        })
        console.log('✅ Video stream stopped')
        return true
      } else {
        throw new Error(data.message || 'Failed to stop video stream')
      }
    } catch (err) {
      console.error('❌ Failed to stop video stream:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Start video element (WebRTC or HLS)
  const startVideoElement = useCallback(async () => {
    if (!videoRef.current) return
    
    try {
      // For now, use a simple video stream URL
      // In production, this would be WebRTC or HLS stream
      const streamUrl = 'http://localhost:5600/stream'
      
      videoRef.current.src = streamUrl
      await videoRef.current.play()
      
      console.log('📺 Video element started')
    } catch (err) {
      console.error('❌ Failed to start video element:', err)
      // Fallback to test pattern or placeholder
      showTestPattern()
    }
  }, [])

  // Stop video element
  const stopVideoElement = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
      console.log('📺 Video element stopped')
    }
  }, [])

  // Show test pattern when no video available
  const showTestPattern = useCallback(() => {
    if (!videoRef.current) return
    
    // Create canvas with test pattern
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')
    
    // Draw test pattern
    const drawTestPattern = () => {
      // Background
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Grid
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      // Center circle
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI)
      ctx.stroke()
      
      // Text
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('Pro Mega Spot Technology AI', canvas.width / 2, canvas.height / 2 - 20)
      ctx.fillText('Video Stream Not Available', canvas.width / 2, canvas.height / 2 + 20)
      
      // Timestamp
      ctx.font = '16px Inter'
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 60)
    }
    
    drawTestPattern()
    
    // Convert canvas to video stream
    const stream = canvas.captureStream(30) // 30 FPS
    videoRef.current.srcObject = stream
    
    // Update test pattern every second
    const interval = setInterval(drawTestPattern, 1000)
    streamRef.current = interval
    
    console.log('📺 Test pattern displayed')
  }, [])

  // Get video status
  const getStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/video/status')
      const data = await response.json()
      
      if (data.stats) {
        setVideoStats(data.stats)
      }
      
      return data
    } catch (err) {
      console.error('❌ Failed to get video status:', err)
      return null
    }
  }, [])

  // Update video settings
  const updateSettings = useCallback(async (settings) => {
    try {
      const response = await fetch('/api/video/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      return data.success
    } catch (err) {
      console.error('❌ Failed to update video settings:', err)
      return false
    }
  }, [])

  // Capture screenshot
  const captureScreenshot = useCallback(() => {
    if (!videoRef.current) return null
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 1280
      canvas.height = videoRef.current.videoHeight || 720
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      
      return canvas.toDataURL('image/png')
    } catch (err) {
      console.error('❌ Failed to capture screenshot:', err)
      return null
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async (filename) => {
    try {
      const response = await fetch('/api/video/record/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      })
      
      const data = await response.json()
      return data.success
    } catch (err) {
      console.error('❌ Failed to start recording:', err)
      return false
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      const response = await fetch('/api/video/record/stop', {
        method: 'POST'
      })
      
      const data = await response.json()
      return data.success
    } catch (err) {
      console.error('❌ Failed to stop recording:', err)
      return false
    }
  }, [])

  // Periodic status updates
  useEffect(() => {
    if (!isStreaming) return
    
    const interval = setInterval(() => {
      getStatus()
    }, 2000) // Update every 2 seconds
    
    return () => clearInterval(interval)
  }, [isStreaming, getStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        clearInterval(streamRef.current)
      }
      stopVideoElement()
    }
  }, [stopVideoElement])

  const value = {
    // State
    isStreaming,
    currentSource,
    videoStats,
    error,
    isLoading,
    supportedSources,
    
    // Video element ref
    videoRef,
    
    // Actions
    startStream,
    stopStream,
    getStatus,
    updateSettings,
    captureScreenshot,
    startRecording,
    stopRecording,
    showTestPattern
  }

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  )
}

