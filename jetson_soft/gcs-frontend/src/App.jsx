import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SocketProvider } from './useSocket'
import { TelemetryProvider } from './useTelemetry'
import { VideoProvider } from './useVideo'
import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import StatusBar from './StatusBar'
import ErrorBoundary from './ErrorBoundary'

// Performance monitoring
const performanceMarks = {
  appStart: 'app-start',
  appReady: 'app-ready',
  firstRender: 'first-render'
}

function App() {
  // Performance mark
  useEffect(() => {
    performance.mark(performanceMarks.appStart)
    return () => {
      performance.mark(performanceMarks.appReady)
      performance.measure('app-initialization', performanceMarks.appStart, performanceMarks.appReady)
    }
  }, [])

  // App state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState('flight')
  const [isConnected, setIsConnected] = useState(false)
  const [systemStats, setSystemStats] = useState(null)

  // Memoized handlers for performance
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const handleViewChange = useCallback((view) => {
    setCurrentView(view)
  }, [])

  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected)
  }, [])

  const handleSystemStatsUpdate = useCallback((stats) => {
    setSystemStats(stats)
  }, [])

  // Memoized app configuration
  const appConfig = useMemo(() => ({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    videoUrl: import.meta.env.VITE_VIDEO_URL || 'http://localhost:5000',
    enablePerformanceMonitoring: import.meta.env.DEV,
    enableDebugMode: import.meta.env.DEV
  }), [])

  // Performance monitoring effect
  useEffect(() => {
    if (appConfig.enablePerformanceMonitoring) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('app-')) {
            console.log(`📊 ${entry.name}: ${Math.round(entry.duration)}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure'] })
      
      return () => observer.disconnect()
    }
  }, [appConfig.enablePerformanceMonitoring])

  // First render performance mark
  useEffect(() => {
    performance.mark(performanceMarks.firstRender)
  }, [])

  return (
    <ErrorBoundary>
      <SocketProvider url={appConfig.socketUrl}>
        <TelemetryProvider onConnectionChange={handleConnectionChange}>
          <VideoProvider>
            <div className="app">
              {/* Header */}
              <Header
                onSidebarToggle={handleSidebarToggle}
                sidebarCollapsed={sidebarCollapsed}
                isConnected={isConnected}
                systemStats={systemStats}
              />

              {/* Main Layout */}
              <div className="main-layout">
                {/* Sidebar */}
                <Sidebar
                  collapsed={sidebarCollapsed}
                  currentView={currentView}
                  onViewChange={handleViewChange}
                  isConnected={isConnected}
                />

                {/* Main Content */}
                <div className="content">
                  <MainContent
                    currentView={currentView}
                    isConnected={isConnected}
                    onSystemStatsUpdate={handleSystemStatsUpdate}
                  />

                  {/* Status Bar */}
                  <StatusBar
                    isConnected={isConnected}
                    systemStats={systemStats}
                    currentView={currentView}
                  />
                </div>
              </div>
            </div>
          </VideoProvider>
        </TelemetryProvider>
      </SocketProvider>
    </ErrorBoundary>
  )
}

export default React.memo(App)


// CSS Styles for App component
const appStyles = `
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  }

  .main-layout {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Global button styles */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    user-select: none;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-glass-hover);
    border-color: var(--border-hover);
  }

  .btn-success {
    background: var(--success);
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: var(--success-hover);
    transform: translateY(-1px);
  }

  .btn-error {
    background: var(--error);
    color: white;
  }

  .btn-error:hover:not(:disabled) {
    background: var(--error-hover);
    transform: translateY(-1px);
  }

  .btn-warning {
    background: var(--warning);
    color: white;
  }

  .btn-warning:hover:not(:disabled) {
    background: var(--warning-hover);
    transform: translateY(-1px);
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .main-layout {
      position: relative;
    }
  }

  @media (max-width: 768px) {
    .app {
      font-size: 0.9rem;
    }
  }

  /* Performance optimizations */
  .app * {
    box-sizing: border-box;
  }

  .app *:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Scrollbar styling */
  .app ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .app ::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  .app ::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 4px;
  }

  .app ::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = appStyles
  document.head.appendChild(styleElement)
}

