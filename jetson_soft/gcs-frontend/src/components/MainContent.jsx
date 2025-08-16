import React, { Suspense, lazy, useEffect, useCallback } from 'react'

// Lazy load views for better performance
const FlightView = lazy(() => import('./FlightView'))
const MissionView = lazy(() => import('./MissionView'))
const VideoView = lazy(() => import('./VideoView'))
const MapView = lazy(() => import('./MapView'))
const SettingsView = lazy(() => import('./SettingsView'))

// Loading component
const ViewLoader = ({ viewName }) => (
  <div className="view-loader">
    <div className="loader-content">
      <div className="loader-spinner"></div>
      <div className="loader-text">Loading {viewName}...</div>
    </div>
    
    <style jsx>{`
      .view-loader {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
      }
      
      .loader-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      
      .loader-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-primary);
        border-top: 3px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .loader-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// Error fallback component
const ViewError = ({ error, retry, viewName }) => (
  <div className="view-error">
    <div className="error-content">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Failed to load {viewName}</h3>
      <p className="error-message">{error.message}</p>
      <button className="btn btn-primary" onClick={retry}>
        Try Again
      </button>
    </div>
    
    <style jsx>{`
      .view-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
      }
      
      .error-content {
        text-align: center;
        max-width: 400px;
        padding: 2rem;
      }
      
      .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      .error-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      
      .error-message {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }
    `}</style>
  </div>
)

const MainContent = ({ currentView, isConnected, onSystemStatsUpdate }) => {
  // System stats monitoring
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await fetch('/api/system/stats')
        if (response.ok) {
          const stats = await response.json()
          onSystemStatsUpdate(stats)
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error)
      }
    }

    // Fetch stats every 5 seconds
    const interval = setInterval(fetchSystemStats, 5000)
    
    // Initial fetch
    fetchSystemStats()
    
    return () => clearInterval(interval)
  }, [onSystemStatsUpdate])

  // Performance monitoring
  useEffect(() => {
    performance.mark(`view-${currentView}-start`)
    
    return () => {
      performance.mark(`view-${currentView}-end`)
      performance.measure(
        `view-${currentView}-render`,
        `view-${currentView}-start`,
        `view-${currentView}-end`
      )
    }
  }, [currentView])

  // Retry function for error boundaries
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Render appropriate view
  const renderView = () => {
    const viewProps = {
      isConnected,
      onSystemStatsUpdate
    }

    switch (currentView) {
      case 'flight':
        return (
          <Suspense fallback={<ViewLoader viewName="Flight View" />}>
            <FlightView {...viewProps} />
          </Suspense>
        )
      
      case 'mission':
        return (
          <Suspense fallback={<ViewLoader viewName="Mission View" />}>
            <MissionView {...viewProps} />
          </Suspense>
        )
      
      case 'video':
        return (
          <Suspense fallback={<ViewLoader viewName="Video View" />}>
            <VideoView {...viewProps} />
          </Suspense>
        )
      
      case 'map':
        return (
          <Suspense fallback={<ViewLoader viewName="Map View" />}>
            <MapView {...viewProps} />
          </Suspense>
        )
      
      case 'settings':
        return (
          <Suspense fallback={<ViewLoader viewName="Settings View" />}>
            <SettingsView {...viewProps} />
          </Suspense>
        )
      
      default:
        return (
          <div className="default-view">
            <div className="default-content">
              <h2>Welcome to Pro Mega Spot Technology AI GCS</h2>
              <p>Select a view from the sidebar to get started.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <main className="main-content">
      <div className="view-container">
        <ErrorBoundary
          fallback={(error) => (
            <ViewError 
              error={error} 
              retry={handleRetry} 
              viewName={currentView} 
            />
          )}
        >
          {renderView()}
        </ErrorBoundary>
      </div>
      
      <style jsx>{`
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-primary);
        }
        
        .view-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        
        .default-view {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .default-content {
          text-align: center;
          max-width: 500px;
          padding: 2rem;
        }
        
        .default-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        
        .default-content p {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
      `}</style>
    </main>
  )
}

// Simple Error Boundary for view-level errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('View Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error)
    }

    return this.props.children
  }
}

export default React.memo(MainContent)

