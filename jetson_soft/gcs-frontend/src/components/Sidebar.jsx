import React, { useState, useCallback } from 'react'
import { useTelemetry } from './useTelemetry'

const Sidebar = ({ collapsed, currentView, onViewChange, isConnected }) => {
  const { connectMAVLink, disconnectMAVLink } = useTelemetry()
  const [connectionString, setConnectionString] = useState('udp:0.0.0.0:14550')
  const [isConnecting, setIsConnecting] = useState(false)

  const menuItems = [
    {
      id: 'flight',
      name: 'Flight',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 10l-8.2 1.8c-.5.1-.8.6-.8 1.1s.5 1 1.1.8L11 12l-1.5 2-2.3.3c-.5.1-.8.5-.8 1s.5.9 1 .8l2.3-.3L11 14l1.8 7.9c.1.6.6 1.1 1.2 1.1s1.1-.5 1-1.1Z"/>
        </svg>
      ),
      description: 'Flight instruments and controls'
    },
    {
      id: 'mission',
      name: 'Mission',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      description: 'Mission planning and waypoints'
    },
    {
      id: 'video',
      name: 'Video',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      ),
      description: 'Video streaming and camera controls'
    },
    {
      id: 'map',
      name: 'Map',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      ),
      description: 'Map view and navigation'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"/>
        </svg>
      ),
      description: 'System settings and configuration'
    }
  ]

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const success = await connectMAVLink(connectionString)
      if (!success) {
        alert('Failed to connect to MAVLink')
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }, [connectMAVLink, connectionString])

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectMAVLink()
    } catch (error) {
      alert(`Disconnect error: ${error.message}`)
    }
  }, [disconnectMAVLink])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon">🚁</div>
            <div className="logo-text">
              <div className="logo-title">Pro Mega Spot</div>
              <div className="logo-subtitle">Technology AI</div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Section */}
      <div className="connection-section">
        {!collapsed && (
          <>
            <div className="section-title">Connection</div>
            <div className="connection-controls">
              <input
                type="text"
                className="connection-input"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="Connection string"
                disabled={isConnected || isConnecting}
              />
              
              {isConnected ? (
                <button 
                  className="btn btn-error btn-sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </>
        )}
        
        {collapsed && (
          <div className="connection-indicator-collapsed">
            <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="section-title">Navigation</div>}
        
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.name : item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <div className="nav-content">
                    <span className="nav-name">{item.name}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="quick-actions">
          <div className="section-title">Quick Actions</div>
          
          <div className="action-buttons">
            <button className="action-btn emergency" title="Emergency Stop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Emergency
            </button>
            
            <button className="action-btn rtl" title="Return to Launch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18m-9-9l9 9-9 9"/>
              </svg>
              RTL
            </button>
            
            <button className="action-btn land" title="Land">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 13l3 3 7-7"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
              Land
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="footer-content">
            <div className="version-info">
              <div className="version">v1.0.0</div>
              <div className="build">Jetson Optimized</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          transition: all var(--transition-normal);
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-secondary);
          min-height: 80px;
          display: flex;
          align-items: center;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2rem;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.2;
        }

        .connection-section {
          padding: 1rem;
          border-bottom: 1px solid var(--border-secondary);
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }

        .connection-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .connection-input {
          width: 100%;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .connection-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .connection-indicator-collapsed {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .connection-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .connection-dot.connected {
          background: var(--success);
        }

        .connection-dot.disconnected {
          background: var(--error);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .sidebar-nav .section-title {
          padding: 0 1rem;
          margin-bottom: 0.75rem;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          margin: 0;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--bg-glass);
          color: var(--primary-color);
          border-left-color: var(--primary-color);
        }

        .nav-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 0;
        }

        .nav-name {
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.2;
        }

        .nav-description {
          font-size: 0.75rem;
          opacity: 0.7;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-actions {
          padding: 1rem;
          border-top: 1px solid var(--border-secondary);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--bg-glass-hover);
          transform: translateY(-1px);
        }

        .action-btn.emergency {
          border-color: var(--error);
          color: var(--error);
        }

        .action-btn.emergency:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .action-btn.rtl {
          border-color: var(--warning);
          color: var(--warning);
        }

        .action-btn.rtl:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .action-btn.land {
          border-color: var(--success);
          color: var(--success);
        }

        .action-btn.land:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-secondary);
        }

        .footer-content {
          display: flex;
          justify-content: center;
        }

        .version-info {
          text-align: center;
        }

        .version {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .build {
          font-size: 0.625rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Collapsed state adjustments */
        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 0.75rem;
        }

        .sidebar.collapsed .action-btn {
          justify-content: center;
          padding: 0.5rem;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .sidebar {
            position: absolute;
            z-index: var(--z-fixed);
            height: 100%;
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
        }

        /* Scrollbar styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--border-primary);
          border-radius: 2px;
        }
      `}</style>
    </aside>
  )
}

export default React.memo(Sidebar)

