import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Performance monitoring
if (import.meta.env.DEV) {
  console.log('🚀 Pro Mega Spot Technology AI GCS - Development Mode')
} else {
  console.log('🚀 Pro Mega Spot Technology AI GCS - Production Mode')
}

// Create React root with concurrent features
const root = ReactDOM.createRoot(document.getElementById('root'))

// Render app with error boundary
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`📊 ${entry.name}: ${Math.round(entry.duration)}ms`)
      }
    }
  })
  
  observer.observe({ entryTypes: ['measure'] })
}

// Memory usage monitoring (development only)
if (import.meta.env.DEV && 'memory' in performance) {
  setInterval(() => {
    const memory = performance.memory
    console.log(`💾 Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB used, ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB total`)
  }, 30000) // Every 30 seconds
}

