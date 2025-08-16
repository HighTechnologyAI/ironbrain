import React, { useState, useEffect } from 'react'

const SettingsView = ({ isConnected, onSystemStatsUpdate }) => {
  const [systemStats, setSystemStats] = useState(null)
  const [settings, setSettings] = useState({
    mavlink: {
      connection_string: 'udp:0.0.0.0:14550',
      heartbeat_rate: 1.0,
      timeout: 10
    },
    video: {
      hardware_accel: true,
      target_fps: 30,
      bitrate: 2000000,
      quality: 'medium'
    },
    system: {
      monitor_interval: 1.0,
      history_size: 300,
      enable_optimization: true
    }
  })
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Fetch system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/system/stats')
        if (response.ok) {
          const stats = await response.json()
          setSystemStats(stats)
          onSystemStatsUpdate(stats)
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [onSystemStatsUpdate])

  const handleOptimizeSystem = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/system/optimize', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Optimization complete: ${result.message}`)
      } else {
        alert('Optimization failed')
      }
    } catch (error) {
      alert(`Optimization error: ${error.message}`)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        alert('Settings saved successfully')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      alert(`Save error: ${error.message}`)
    }
  }

  const getPerformanceColor = (value, thresholds) => {
    if (value < thresholds.good) return 'var(--success)'
    if (value < thresholds.warning) return 'var(--warning)'
    return 'var(--error)'
  }

  const getPerformanceStatus = () => {
    if (!systemStats) return 'unknown'
    
    const cpuOk = systemStats.cpu_percent < 80
    const memOk = systemStats.memory_percent < 80
    const tempOk = systemStats.cpu_temp_c < 75
    
    if (cpuOk && memOk && tempOk) return 'good'
    if (systemStats.cpu_percent > 95 || systemStats.memory_percent > 95 || systemStats.cpu_temp_c > 85) return 'critical'
    return 'warning'
  }

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>System Settings</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleOptimizeSystem}
            disabled={isOptimizing}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize System'}
          </button>
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            Save Settings
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* System Performance */}
        <div className="settings-section">
          <h3>System Performance</h3>
          
          {systemStats ? (
            <div className="performance-grid">
              <div className="perf-card">
                <div className="perf-header">
                  <span className="perf-label">CPU Usage</span>
                  <span 
                    className="perf-value"
                    style={{ color: getPerformanceColor(systemStats.cpu_percent, { good: 50, warning: 80 }) }}
                  >
                    {systemStats.cpu_percent?.toFixed(1)}%
                  </span>
                </div>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${systemStats.cpu_percent}%`,
                      backgroundColor: getPerformanceColor(systemStats.cpu_percent, { good: 50, warning: 80 })
                    }}
                  />
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-header">
                  <span className="perf-label">Memory Usage</span>
                  <span 
                    className="perf-value"
                    style={{ color: getPerformanceColor(systemStats.memory_percent, { good: 60, warning: 80 }) }}
                  >
                    {systemStats.memory_percent?.toFixed(1)}%
                  </span>
                </div>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${systemStats.memory_percent}%`,
                      backgroundColor: getPerformanceColor(systemStats.memory_percent, { good: 60, warning: 80 })
                    }}
                  />
                </div>
                <div className="perf-details">
                  {(systemStats.memory_used_mb / 1024).toFixed(1)}GB / {(systemStats.memory_total_mb / 1024).toFixed(1)}GB
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-header">
                  <span className="perf-label">Temperature</span>
                  <span 
                    className="perf-value"
                    style={{ color: getPerformanceColor(systemStats.cpu_temp_c, { good: 60, warning: 75 }) }}
                  >
                    {systemStats.cpu_temp_c?.toFixed(1)}°C
                  </span>
                </div>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${Math.min(systemStats.cpu_temp_c, 100)}%`,
                      backgroundColor: getPerformanceColor(systemStats.cpu_temp_c, { good: 60, warning: 75 })
                    }}
                  />
                </div>
              </div>

              <div className="perf-card">
                <div className="perf-header">
                  <span className="perf-label">Storage</span>
                  <span 
                    className="perf-value"
                    style={{ color: getPerformanceColor(systemStats.storage_percent, { good: 70, warning: 85 }) }}
                  >
                    {systemStats.storage_percent?.toFixed(1)}%
                  </span>
                </div>
                <div className="perf-bar">
                  <div 
                    className="perf-fill"
                    style={{ 
                      width: `${systemStats.storage_percent}%`,
                      backgroundColor: getPerformanceColor(systemStats.storage_percent, { good: 70, warning: 85 })
                    }}
                  />
                </div>
                <div className="perf-details">
                  {systemStats.storage_available_gb?.toFixed(1)}GB free
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-stats">Loading system statistics...</div>
          )}

          <div className={`system-status ${getPerformanceStatus()}`}>
            <div className="status-icon">
              {getPerformanceStatus() === 'good' ? '✅' : 
               getPerformanceStatus() === 'warning' ? '⚠️' : '🔥'}
            </div>
            <div className="status-text">
              System Status: {getPerformanceStatus().toUpperCase()}
            </div>
          </div>
        </div>

        {/* MAVLink Settings */}
        <div className="settings-section">
          <h3>MAVLink Configuration</h3>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Connection String:</label>
              <input
                type="text"
                value={settings.mavlink.connection_string}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mavlink: { ...prev.mavlink, connection_string: e.target.value }
                }))}
                placeholder="udp:0.0.0.0:14550"
              />
            </div>

            <div className="setting-item">
              <label>Heartbeat Rate (Hz):</label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={settings.mavlink.heartbeat_rate}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mavlink: { ...prev.mavlink, heartbeat_rate: parseFloat(e.target.value) }
                }))}
              />
            </div>

            <div className="setting-item">
              <label>Timeout (seconds):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.mavlink.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mavlink: { ...prev.mavlink, timeout: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="settings-section">
          <h3>Video Configuration</h3>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Hardware Acceleration:</label>
              <input
                type="checkbox"
                checked={settings.video.hardware_accel}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  video: { ...prev.video, hardware_accel: e.target.checked }
                }))}
              />
            </div>

            <div className="setting-item">
              <label>Target FPS:</label>
              <select
                value={settings.video.target_fps}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  video: { ...prev.video, target_fps: parseInt(e.target.value) }
                }))}
              >
                <option value="15">15 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Quality:</label>
              <select
                value={settings.video.quality}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  video: { ...prev.video, quality: e.target.value }
                }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Bitrate (Mbps):</label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={settings.video.bitrate / 1000000}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  video: { ...prev.video, bitrate: parseFloat(e.target.value) * 1000000 }
                }))}
              />
              <span className="range-value">
                {(settings.video.bitrate / 1000000).toFixed(1)} Mbps
              </span>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <h3>System Configuration</h3>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label>Monitor Interval (seconds):</label>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={settings.system.monitor_interval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, monitor_interval: parseFloat(e.target.value) }
                }))}
              />
            </div>

            <div className="setting-item">
              <label>History Size:</label>
              <input
                type="number"
                min="100"
                max="1000"
                step="50"
                value={settings.system.history_size}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, history_size: parseInt(e.target.value) }
                }))}
              />
            </div>

            <div className="setting-item">
              <label>Auto Optimization:</label>
              <input
                type="checkbox"
                checked={settings.system.enable_optimization}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, enable_optimization: e.target.checked }
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-view {
          padding: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          overflow-y: auto;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .settings-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .settings-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .settings-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1.5rem 0;
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .perf-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: 8px;
          padding: 1rem;
        }

        .perf-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .perf-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .perf-value {
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .perf-bar {
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .perf-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .perf-details {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .loading-stats {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .system-status.good {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .system-status.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .system-status.critical {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-item label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .setting-item input,
        .setting-item select {
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .setting-item input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .setting-item input[type="range"] {
          margin-bottom: 0.25rem;
        }

        .range-value {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        @media (max-width: 768px) {
          .settings-view {
            padding: 0.75rem;
          }

          .settings-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-actions {
            justify-content: center;
          }

          .performance-grid,
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .settings-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(SettingsView)

