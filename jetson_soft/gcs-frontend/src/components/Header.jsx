import React, { useState, useCallback } from 'react'
import { useTelemetry } from './useTelemetry'

const Header = ({ onSidebarToggle, sidebarCollapsed, isConnected, systemStats }) => {
  const { telemetry, connection, derivedValues } = useTelemetry()
  const [showSystemInfo, setShowSystemInfo] = useState(false)

  const handleSystemInfoToggle = useCallback(() => {
    setShowSystemInfo(prev => !prev)
  }, [])

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'var(--error)'
    if (derivedValues.signalQuality === 'EXCELLENT') return 'var(--success)'
    if (derivedValues.signalQuality === 'GOOD') return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <>
      <header className="header">
        {/* Left Section */}
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={onSidebarToggle}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="logo">
            <div className="logo-icon">🚁</div>
            <div className="logo-text">
              <div className="logo-title">Pro Mega Spot Technology AI</div>
              <div className="logo-subtitle">Ground Control Station</div>
            </div>
          </div>
        </div>

        {/* Center Section - Flight Status */}
        <div className="header-center">
          <div className="flight-status">
            <div className="status-item">
              <span className="status-label">Mode:</span>
              <span className={`status-value mode-${telemetry.mode.toLowerCase()}`}>
                {telemetry.mode}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Armed:</span>
              <span className={`status-value ${telemetry.armed ? 'armed' : 'disarmed'}`}>
                {telemetry.armed ? 'ARMED' : 'DISARMED'}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Battery:</span>
              <span className={`status-value battery-${derivedValues.batteryPercent > 50 ? 'good' : derivedValues.batteryPercent > 20 ? 'warning' : 'critical'}`}>
                {derivedValues.batteryPercent.toFixed(0)}%
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">GPS:</span>
              <span className={`status-value gps-${derivedValues.gpsStatus.toLowerCase().replace('_', '-')}`}>
                {telemetry.gps_satellites} sats
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Connection Status */}
          <div className="connection-status">
            <div 
              className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
              style={{ backgroundColor: getConnectionStatusColor() }}
            />
            <span className="connection-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* System Stats Button */}
          <button 
            className="system-stats-btn"
            onClick={handleSystemInfoToggle}
            title="System Information"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </button>

          {/* Current Time */}
          <div className="current-time">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* System Info Dropdown */}
      {showSystemInfo && (
        <div className="system-info-dropdown">
          <div className="system-info-content">
            <h3>System Information</h3>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Connection:</span>
                <span className="info-value">
                  {connection.messages_received} msgs received
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Uptime:</span>
                <span className="info-value">
                  {formatUptime(derivedValues.flightTime)}
                </span>
              </div>
              
              {systemStats && (
                <>
                  <div className="info-item">
                    <span className="info-label">CPU:</span>
                    <span className="info-value">
                      {systemStats.cpu_percent?.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Memory:</span>
                    <span className="info-value">
                      {systemStats.memory_percent?.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Temperature:</span>
                    <span className="info-value">
                      {systemStats.cpu_temp_c?.toFixed(1)}°C
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header {
          height: 60px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: var(--z-sticky);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all var(--transition-fast);
        }

        .sidebar-toggle:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.2;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .flight-status {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .status-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-value {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: var(--bg-tertiary);
        }

        .status-value.armed {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .status-value.disarmed {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }

        .status-value.battery-good {
          color: var(--success);
        }

        .status-value.battery-warning {
          color: var(--warning);
        }

        .status-value.battery-critical {
          color: var(--error);
        }

        .status-value.gps-gps-ok {
          color: var(--success);
        }

        .status-value.gps-gps-2d,
        .status-value.gps-gps-no-fix {
          color: var(--warning);
        }

        .status-value.gps-gps-no-gps {
          color: var(--error);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 20px;
          border: 1px solid var(--border-primary);
        }

        .connection-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .connection-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .system-stats-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all var(--transition-fast);
        }

        .system-stats-btn:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .current-time {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .system-info-dropdown {
          position: absolute;
          top: 100%;
          right: 1rem;
          width: 300px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
          z-index: var(--z-dropdown);
          animation: slideDown 0.2s ease-out;
        }

        .system-info-content {
          padding: 1rem;
        }

        .system-info-content h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .info-grid {
          display: grid;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 0.75rem;
          }

          .logo-text {
            display: none;
          }

          .flight-status {
            gap: 1rem;
          }

          .status-item {
            gap: 0.125rem;
          }

          .status-label {
            font-size: 0.625rem;
          }

          .status-value {
            font-size: 0.75rem;
            padding: 0.125rem 0.375rem;
          }

          .system-info-dropdown {
            right: 0.75rem;
            width: 250px;
          }
        }
      `}</style>
    </>
  )
}

export default React.memo(Header)

