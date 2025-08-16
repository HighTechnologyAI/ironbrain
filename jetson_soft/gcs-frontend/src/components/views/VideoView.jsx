import React, { useState, useEffect, useCallback } from 'react'
import { useVideo } from './useVideo'

const VideoView = ({ isConnected }) => {
  const {
    videoRef,
    isStreaming,
    currentSource,
    videoStats,
    error,
    isLoading,
    supportedSources,
    startStream,
    stopStream,
    updateSettings,
    captureScreenshot,
    startRecording,
    stopRecording,
    showTestPattern
  } = useVideo()

  const [selectedSource, setSelectedSource] = useState('test')
  const [sourceParams, setSourceParams] = useState({})
  const [videoSettings, setVideoSettings] = useState({
    quality: 'medium',
    fps: 30,
    bitrate: 2000000
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  // Recording timer
  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  // Initialize test pattern
  useEffect(() => {
    if (!isStreaming) {
      showTestPattern()
    }
  }, [isStreaming, showTestPattern])

  const handleStartStream = useCallback(async () => {
    const success = await startStream(selectedSource, sourceParams)
    if (!success && error) {
      alert(`Failed to start stream: ${error}`)
    }
  }, [selectedSource, sourceParams, startStream, error])

  const handleStopStream = useCallback(async () => {
    await stopStream()
  }, [stopStream])

  const handleUpdateSettings = useCallback(async () => {
    const success = await updateSettings(videoSettings)
    if (!success) {
      alert('Failed to update video settings')
    }
  }, [videoSettings, updateSettings])

  const handleCaptureScreenshot = useCallback(() => {
    const screenshot = captureScreenshot()
    if (screenshot) {
      // Create download link
      const link = document.createElement('a')
      link.href = screenshot
      link.download = `screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      link.click()
    } else {
      alert('Failed to capture screenshot')
    }
  }, [captureScreenshot])

  const handleStartRecording = useCallback(async () => {
    const filename = `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`
    const success = await startRecording(filename)
    if (success) {
      setIsRecording(true)
    } else {
      alert('Failed to start recording')
    }
  }, [startRecording])

  const handleStopRecording = useCallback(async () => {
    const success = await stopRecording()
    if (success) {
      setIsRecording(false)
    } else {
      alert('Failed to stop recording')
    }
  }, [stopRecording])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'high': return 'var(--success)'
      case 'medium': return 'var(--warning)'
      case 'low': return 'var(--error)'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <div className="video-view">
      {/* Main Video Display */}
      <div className="video-main">
        <div className="video-container">
          <video
            ref={videoRef}
            className="video-player"
            autoPlay
            muted
            playsInline
            controls={false}
          />
          
          {/* Video Overlay */}
          <div className="video-overlay">
            {/* Top Overlay */}
            <div className="overlay-top">
              <div className="stream-info">
                <div className="info-badge">
                  <span className={`status-dot ${isStreaming ? 'streaming' : 'stopped'}`}></span>
                  {isStreaming ? 'LIVE' : 'STOPPED'}
                </div>
                
                {isStreaming && (
                  <>
                    <div className="info-badge">
                      {videoStats.fps.toFixed(0)} FPS
                    </div>
                    <div className="info-badge">
                      {videoStats.resolution}
                    </div>
                    <div className="info-badge">
                      {(videoStats.bandwidth_mbps).toFixed(1)} Mbps
                    </div>
                  </>
                )}
              </div>
              
              {isRecording && (
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  REC {formatTime(recordingTime)}
                </div>
              )}
            </div>

            {/* Bottom Overlay */}
            <div className="overlay-bottom">
              <div className="video-controls">
                <button
                  className="control-btn"
                  onClick={handleCaptureScreenshot}
                  title="Capture Screenshot"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>

                <button
                  className={`control-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  title={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                  {isRecording ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  )}
                </button>

                <button
                  className="control-btn"
                  onClick={() => {/* Fullscreen logic */}}
                  title="Fullscreen"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-overlay">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={handleStartStream}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading Display */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading video stream...</div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="video-sidebar">
        {/* Stream Control */}
        <div className="control-panel">
          <div className="panel-header">
            <h3>Stream Control</h3>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="control-section">
            <label>Video Source:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={isStreaming}
            >
              {Object.entries(supportedSources).map(([key, source]) => (
                <option key={key} value={key}>{source.name}</option>
              ))}
            </select>
          </div>

          {/* Source Parameters */}
          {selectedSource && supportedSources[selectedSource]?.parameters.map(param => (
            <div key={param} className="control-section">
              <label>{param}:</label>
              <input
                type="text"
                value={sourceParams[param] || ''}
                onChange={(e) => setSourceParams(prev => ({
                  ...prev,
                  [param]: e.target.value
                }))}
                placeholder={`Enter ${param}`}
                disabled={isStreaming}
              />
            </div>
          ))}

          <div className="control-buttons">
            {isStreaming ? (
              <button
                className="btn btn-error"
                onClick={handleStopStream}
                disabled={isLoading}
              >
                Stop Stream
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleStartStream}
                disabled={isLoading || !isConnected}
              >
                Start Stream
              </button>
            )}
          </div>
        </div>

        {/* Video Settings */}
        <div className="control-panel">
          <div className="panel-header">
            <h3>Video Settings</h3>
          </div>

          <div className="control-section">
            <label>Quality:</label>
            <select
              value={videoSettings.quality}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                quality: e.target.value
              }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="control-section">
            <label>Frame Rate:</label>
            <select
              value={videoSettings.fps}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                fps: parseInt(e.target.value)
              }))}
            >
              <option value="15">15 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>

          <div className="control-section">
            <label>Bitrate (Mbps):</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={videoSettings.bitrate / 1000000}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                bitrate: parseFloat(e.target.value) * 1000000
              }))}
            />
            <span className="range-value">
              {(videoSettings.bitrate / 1000000).toFixed(1)} Mbps
            </span>
          </div>

          <div className="control-buttons">
            <button
              className="btn btn-secondary"
              onClick={handleUpdateSettings}
            >
              Apply Settings
            </button>
          </div>
        </div>

        {/* Video Statistics */}
        <div className="control-panel">
          <div className="panel-header">
            <h3>Statistics</h3>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">FPS:</span>
              <span className="stat-value">{videoStats.fps.toFixed(1)}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Bitrate:</span>
              <span className="stat-value">{(videoStats.bitrate / 1000000).toFixed(1)} Mbps</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Resolution:</span>
              <span className="stat-value">{videoStats.resolution}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Codec:</span>
              <span className="stat-value">{videoStats.codec}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Latency:</span>
              <span className="stat-value">{videoStats.latency_ms} ms</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Frames:</span>
              <span className="stat-value">{videoStats.frames_processed}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Dropped:</span>
              <span className="stat-value">{videoStats.frames_dropped}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Quality:</span>
              <span 
                className="stat-value"
                style={{ color: getQualityColor(videoSettings.quality) }}
              >
                {videoSettings.quality.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .video-view {
          display: flex;
          height: 100%;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
        }

        .video-main {
          flex: 1;
          min-width: 0;
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-primary);
        }

        .video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .overlay-top,
        .overlay-bottom {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stream-info {
          display: flex;
          gap: 0.5rem;
        }

        .info-badge {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.streaming {
          background: var(--success);
          animation: pulse 2s infinite;
        }

        .status-dot.stopped {
          background: var(--error);
        }

        .recording-indicator {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recording-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .video-controls {
          display: flex;
          gap: 0.5rem;
          pointer-events: auto;
        }

        .control-btn {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }

        .control-btn.recording {
          background: var(--error);
        }

        .error-overlay,
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .error-content,
        .loading-overlay {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .error-icon {
          font-size: 3rem;
        }

        .error-message {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-size: 1rem;
        }

        .video-sidebar {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .control-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-secondary);
        }

        .panel-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .connection-status {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .connection-status.connected {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }

        .connection-status.disconnected {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .control-section {
          margin-bottom: 1rem;
        }

        .control-section label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .control-section select,
        .control-section input[type="text"] {
          width: 100%;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .control-section input[type="range"] {
          width: 100%;
          margin-bottom: 0.5rem;
        }

        .range-value {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .control-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .video-view {
            flex-direction: column;
          }
          
          .video-sidebar {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
          }
          
          .control-panel {
            min-width: 300px;
          }
        }

        @media (max-width: 768px) {
          .video-view {
            padding: 0.75rem;
            gap: 0.75rem;
          }
          
          .video-sidebar {
            flex-direction: column;
          }
          
          .control-panel {
            min-width: auto;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(VideoView)

