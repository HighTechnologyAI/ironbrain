import React, { useState, useEffect } from 'react'
import { useTelemetry } from './useTelemetry'
import { useVideo } from './useVideo'

const StatusBar = ({ isConnected, systemStats, currentView }) => {
  const { telemetry, updateRate, getStats } = useTelemetry()
  const { videoStats, isStreaming } = useVideo()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Format coordinates
  const formatCoordinate = (value, type) => {
    if (!value) return '---'
    const abs = Math.abs(value)
    const deg = Math.floor(abs)
    const min = ((abs - deg) * 60).toFixed(4)
    const dir = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W')
    return `${deg}°${min}'${dir}`
  }

  // Format altitude
  const formatAltitude = (alt) => {
    return alt ? `${alt.toFixed(1)}m` : '---'
  }

  // Format speed
  const formatSpeed = (speed) => {
    return speed ? `${speed.toFixed(1)} m/s` : '---'
  }

  // Get performance status color
  const getPerformanceColor = (value, thresholds) => {
    if (value < thresholds.good) return 'var(--success)'
    if (value < thresholds.warning) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <div className="status-bar">
      {/* Left Section - Connection & Telemetry */}
      <div className="status-section">
        <div className="status-group">
          <div className="status-item">
            <span className="status-label">Connection:</span>
            <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          
          {isConnected && (
            <div className="status-item">
              <span className="status-label">Rate:</span>
              <span className="status-value">{updateRate} Hz</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Position & Navigation */}
      <div className="status-section center">
        <div className="status-group">
          <div className="status-item">
            <span className="status-label">Lat:</span>
            <span className="status-value coordinate">
              {formatCoordinate(telemetry.gps_lat, 'lat')}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Lon:</span>
            <span className="status-value coordinate">
              {formatCoordinate(telemetry.gps_lon, 'lon')}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Alt:</span>
            <span className="status-value">
              {formatAltitude(telemetry.altitude)}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Speed:</span>
            <span className="status-value">
              {formatSpeed(telemetry.groundspeed)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - System & Performance */}
      <div className="status-section">
        <div className="status-group">
          {/* Video Status */}
          {currentView === 'video' && (
            <div className="status-item">
              <span className="status-label">Video:</span>
              <span className={`status-value ${isStreaming ? 'streaming' : 'stopped'}`}>
                {isStreaming ? `${videoStats.fps.toFixed(0)} FPS` : 'STOPPED'}
              </span>
            </div>
          )}
          
          {/* System Performance */}
          {systemStats && (
            <>
              <div className="status-item">
                <span className="status-label">CPU:</span>
                <span 
                  className="status-value"
                  style={{ 
                    color: getPerformanceColor(systemStats.cpu_percent, { good: 50, warning: 80 })
                  }}
                >
                  {systemStats.cpu_percent?.toFixed(0)}%
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-label">RAM:</span>
                <span 
                  className="status-value"
                  style={{ 
                    color: getPerformanceColor(systemStats.memory_percent, { good: 60, warning: 80 })
                  }}
                >
                  {systemStats.memory_percent?.toFixed(0)}%
                </span>
              </div>
              
              {systemStats.cpu_temp_c > 0 && (
                <div className="status-item">
                  <span className="status-label">Temp:</span>
                  <span 
                    className="status-value"
                    style={{ 
                      color: getPerformanceColor(systemStats.cpu_temp_c, { good: 60, warning: 75 })
                    }}
                  >
                    {systemStats.cpu_temp_c?.toFixed(0)}°C
                  </span>
                </div>
              )}
            </>
          )}
          
          {/* Current Time */}
          <div className="status-item">
            <span className="status-label">Time:</span>
            <span className="status-value time">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-bar {
          height: 32px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          font-size: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .status-section {
          display: flex;
          align-items: center;
        }

        .status-section.center {
          flex: 1;
          justify-content: center;
        }

        .status-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }

        .status-label {
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-value {
          color: var(--text-primary);
          font-weight: 600;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .status-value.connected {
          color: var(--success);
        }

        .status-value.disconnected {
          color: var(--error);
        }

        .status-value.streaming {
          color: var(--success);
        }

        .status-value.stopped {
          color: var(--text-secondary);
        }

        .status-value.coordinate {
          font-size: 0.7rem;
        }

        .status-value.time {
          font-size: 0.7rem;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .status-group {
            gap: 1rem;
          }
          
          .status-item {
            gap: 0.125rem;
          }
        }

        @media (max-width: 768px) {
          .status-bar {
            height: 28px;
            padding: 0 0.75rem;
            font-size: 0.7rem;
          }
          
          .status-group {
            gap: 0.75rem;
          }
          
          .status-value.coordinate {
            font-size: 0.65rem;
          }
          
          .status-value.time {
            font-size: 0.65rem;
          }
          
          /* Hide some items on mobile */
          .status-section:not(.center) .status-item:nth-child(n+3) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .status-section:not(.center) .status-item:nth-child(n+2) {
            display: none;
          }
          
          .status-section.center .status-item:nth-child(n+3) {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(StatusBar)

