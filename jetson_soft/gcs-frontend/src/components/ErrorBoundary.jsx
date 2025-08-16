import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🔥 Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Report error to monitoring service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo)
    }
  }

  reportError = (error, errorInfo) => {
    // In production, send error to monitoring service
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(err => {
        console.error('Failed to report error:', err)
      })
    } catch (err) {
      console.error('Error in error reporting:', err)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              ⚠️
            </div>
            
            <h1 className="error-title">
              Oops! Something went wrong
            </h1>
            
            <p className="error-message">
              The Pro Mega Spot Technology AI Ground Control Station encountered an unexpected error.
            </p>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={this.handleReload}
              >
                Reload Application
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-stack">
                  <h3>Error:</h3>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
          
          <style jsx>{`
            .error-boundary {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: 'Inter', sans-serif;
            }
            
            .error-container {
              max-width: 600px;
              padding: 3rem;
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1.5rem;
              animation: pulse 2s infinite;
            }
            
            .error-title {
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 1rem;
              color: white;
            }
            
            .error-message {
              font-size: 1.1rem;
              margin-bottom: 2rem;
              opacity: 0.9;
              line-height: 1.6;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
            }
            
            .btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            
            .btn-primary {
              background: white;
              color: #667eea;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            
            .btn-secondary {
              background: transparent;
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.5);
            }
            
            .btn-secondary:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: white;
            }
            
            .error-details {
              text-align: left;
              margin-top: 2rem;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 8px;
              padding: 1rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 1rem;
            }
            
            .error-stack {
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            
            .error-stack h3 {
              margin: 1rem 0 0.5rem 0;
              font-size: 1rem;
              color: #fbbf24;
            }
            
            .error-stack pre {
              background: rgba(0, 0, 0, 0.5);
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.875rem;
              line-height: 1.4;
              white-space: pre-wrap;
              word-break: break-word;
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
              .error-container {
                margin: 1rem;
                padding: 2rem;
              }
              
              .error-title {
                font-size: 1.5rem;
              }
              
              .error-actions {
                flex-direction: column;
              }
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

