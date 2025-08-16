import React, { useState, useEffect, useCallback } from 'react'
import { useTelemetry } from './useTelemetry'
import { useVideo } from './useVideo'

// Flight instruments components
const AttitudeIndicator = ({ roll, pitch }) => (
  <div className="instrument attitude-indicator">
    <div className="instrument-label">Attitude</div>
    <div className="attitude-display">
      <div 
        className="attitude-horizon"
        style={{
          transform: `rotate(${-roll}deg) translateY(${pitch * 2}px)`
        }}
      >
        <div className="horizon-line"></div>
      </div>
      <div className="attitude-aircraft">
        <div className="aircraft-symbol">✈</div>
      </div>
      <div className="attitude-values">
        <div>R: {roll?.toFixed(1)}°</div>
        <div>P: {pitch?.toFixed(1)}°</div>
      </div>
    </div>
  </div>
)

const AltitudeIndicator = ({ altitude, climbRate }) => (
  <div className="instrument altitude-indicator">
    <div className="instrument-label">Altitude</div>
    <div className="altitude-display">
      <div className="altitude-value">{altitude?.toFixed(1) || '---'}</div>
      <div className="altitude-unit">meters</div>
      <div className="climb-rate">
        <span className={climbRate > 0 ? 'climbing' : climbRate < 0 ? 'descending' : 'level'}>
          {climbRate > 0 ? '↗' : climbRate < 0 ? '↘' : '→'} {Math.abs(climbRate || 0).toFixed(1)} m/s
        </span>
      </div>
    </div>
  </div>
)

const SpeedIndicator = ({ groundspeed, airspeed }) => (
  <div className="instrument speed-indicator">
    <div className="instrument-label">Speed</div>
    <div className="speed-display">
      <div className="speed-item">
        <div className="speed-label">GND</div>
        <div className="speed-value">{groundspeed?.toFixed(1) || '---'}</div>
      </div>
      <div className="speed-item">
        <div className="speed-label">AIR</div>
        <div className="speed-value">{airspeed?.toFixed(1) || '---'}</div>
      </div>
      <div className="speed-unit">m/s</div>
    </div>
  </div>
)

const CompassIndicator = ({ heading }) => (
  <div className="instrument compass-indicator">
    <div className="instrument-label">Heading</div>
    <div className="compass-display">
      <div className="compass-ring">
        <div 
          className="compass-needle"
          style={{ transform: `rotate(${heading || 0}deg)` }}
        >
          <div className="needle-arrow">↑</div>
        </div>
        <div className="compass-marks">
          <div className="mark north">N</div>
          <div className="mark east">E</div>
          <div className="mark south">S</div>
          <div className="mark west">W</div>
        </div>
      </div>
      <div className="heading-value">{heading?.toFixed(0) || '---'}°</div>
    </div>
  </div>
)

const BatteryWidget = ({ voltage, current, remaining }) => (
  <div className="widget battery-widget">
    <div className="widget-header">
      <div className="widget-title">Battery</div>
      <div className={`battery-level ${remaining > 50 ? 'good' : remaining > 20 ? 'warning' : 'critical'}`}>
        {remaining || 0}%
      </div>
    </div>
    <div className="battery-details">
      <div className="battery-item">
        <span>Voltage:</span>
        <span>{voltage?.toFixed(2) || '---'} V</span>
      </div>
      <div className="battery-item">
        <span>Current:</span>
        <span>{current?.toFixed(2) || '---'} A</span>
      </div>
    </div>
    <div className="battery-bar">
      <div 
        className="battery-fill"
        style={{ 
          width: `${remaining || 0}%`,
          backgroundColor: remaining > 50 ? 'var(--success)' : remaining > 20 ? 'var(--warning)' : 'var(--error)'
        }}
      ></div>
    </div>
  </div>
)

const GPSWidget = ({ lat, lon, satellites, fixType }) => (
  <div className="widget gps-widget">
    <div className="widget-header">
      <div className="widget-title">GPS</div>
      <div className={`gps-status ${fixType >= 3 ? 'good' : fixType >= 2 ? 'warning' : 'error'}`}>
        {satellites || 0} sats
      </div>
    </div>
    <div className="gps-details">
      <div className="gps-item">
        <span>Lat:</span>
        <span>{lat?.toFixed(6) || '---'}</span>
      </div>
      <div className="gps-item">
        <span>Lon:</span>
        <span>{lon?.toFixed(6) || '---'}</span>
      </div>
      <div className="gps-item">
        <span>Fix:</span>
        <span>{fixType >= 3 ? '3D' : fixType >= 2 ? '2D' : 'No Fix'}</span>
      </div>
    </div>
  </div>
)

const FlightModeWidget = ({ mode, armed }) => (
  <div className="widget flight-mode-widget">
    <div className="widget-header">
      <div className="widget-title">Flight Mode</div>
      <div className={`armed-status ${armed ? 'armed' : 'disarmed'}`}>
        {armed ? 'ARMED' : 'DISARMED'}
      </div>
    </div>
    <div className="mode-display">
      <div className="current-mode">{mode || 'UNKNOWN'}</div>
    </div>
  </div>
)

const FlightView = ({ isConnected }) => {
  const { telemetry, sendCommand, derivedValues } = useTelemetry()
  const { videoRef, showTestPattern, isStreaming } = useVideo()
  const [selectedCommand, setSelectedCommand] = useState('')
  const [commandParams, setCommandParams] = useState({})

  // Initialize video test pattern if not streaming
  useEffect(() => {
    if (!isStreaming) {
      showTestPattern()
    }
  }, [isStreaming, showTestPattern])

  // Available commands
  const commands = [
    { id: 'arm', name: 'Arm', params: [] },
    { id: 'disarm', name: 'Disarm', params: [] },
    { id: 'takeoff', name: 'Takeoff', params: [{ name: 'altitude', type: 'number', default: 10 }] },
    { id: 'land', name: 'Land', params: [] },
    { id: 'rtl', name: 'Return to Launch', params: [] },
    { id: 'set_mode', name: 'Set Mode', params: [{ name: 'mode', type: 'select', options: ['MANUAL', 'STABILIZE', 'AUTO', 'GUIDED', 'LOITER'] }] }
  ]

  const handleSendCommand = useCallback(async () => {
    if (!selectedCommand || !isConnected) return

    try {
      await sendCommand(selectedCommand, commandParams)
      setSelectedCommand('')
      setCommandParams({})
    } catch (error) {
      alert(`Command failed: ${error.message}`)
    }
  }, [selectedCommand, commandParams, isConnected, sendCommand])

  return (
    <div className="flight-view">
      {/* Main Flight Display */}
      <div className="flight-display">
        {/* Video Feed */}
        <div className="video-section">
          <div className="video-container">
            <video
              ref={videoRef}
              className="video-feed"
              autoPlay
              muted
              playsInline
            />
            <div className="video-overlay">
              <div className="overlay-info">
                <div className="info-item">
                  <span>ALT: {telemetry.altitude?.toFixed(1) || '---'}m</span>
                </div>
                <div className="info-item">
                  <span>SPD: {telemetry.groundspeed?.toFixed(1) || '---'}m/s</span>
                </div>
                <div className="info-item">
                  <span>BAT: {derivedValues.batteryPercent?.toFixed(0) || '---'}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Instruments */}
        <div className="instruments-panel">
          <div className="instruments-grid">
            <AttitudeIndicator 
              roll={telemetry.roll} 
              pitch={telemetry.pitch} 
            />
            <AltitudeIndicator 
              altitude={telemetry.altitude} 
              climbRate={telemetry.climb_rate} 
            />
            <SpeedIndicator 
              groundspeed={telemetry.groundspeed} 
              airspeed={telemetry.airspeed} 
            />
            <CompassIndicator 
              heading={telemetry.yaw} 
            />
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="side-panel">
        {/* Status Widgets */}
        <div className="widgets-section">
          <BatteryWidget
            voltage={telemetry.battery_voltage}
            current={telemetry.battery_current}
            remaining={derivedValues.batteryPercent}
          />
          
          <GPSWidget
            lat={telemetry.gps_lat}
            lon={telemetry.gps_lon}
            satellites={telemetry.gps_satellites}
            fixType={telemetry.gps_fix_type}
          />
          
          <FlightModeWidget
            mode={telemetry.mode}
            armed={telemetry.armed}
          />
        </div>

        {/* Flight Controls */}
        <div className="controls-section">
          <div className="section-title">Flight Controls</div>
          
          <div className="command-controls">
            <select
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
              className="command-select"
              disabled={!isConnected}
            >
              <option value="">Select Command</option>
              {commands.map(cmd => (
                <option key={cmd.id} value={cmd.id}>{cmd.name}</option>
              ))}
            </select>

            {selectedCommand && commands.find(c => c.id === selectedCommand)?.params.map(param => (
              <div key={param.name} className="param-input">
                <label>{param.name}:</label>
                {param.type === 'select' ? (
                  <select
                    value={commandParams[param.name] || ''}
                    onChange={(e) => setCommandParams(prev => ({
                      ...prev,
                      [param.name]: e.target.value
                    }))}
                  >
                    <option value="">Select {param.name}</option>
                    {param.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={param.type}
                    value={commandParams[param.name] || param.default || ''}
                    onChange={(e) => setCommandParams(prev => ({
                      ...prev,
                      [param.name]: param.type === 'number' ? parseFloat(e.target.value) : e.target.value
                    }))}
                    placeholder={param.default?.toString()}
                  />
                )}
              </div>
            ))}

            <button
              className="btn btn-primary"
              onClick={handleSendCommand}
              disabled={!selectedCommand || !isConnected}
            >
              Send Command
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flight-view {
          display: flex;
          height: 100%;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
        }

        .flight-display {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .video-section {
          flex: 1;
          min-height: 0;
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

        .video-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          pointer-events: none;
        }

        .overlay-info {
          display: flex;
          gap: 1rem;
        }

        .info-item {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .instruments-panel {
          height: 200px;
        }

        .instruments-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          height: 100%;
        }

        .instrument {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .instrument-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .attitude-display {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(to bottom, #87CEEB 50%, #8B4513 50%);
        }

        .attitude-horizon {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: linear-gradient(to bottom, #87CEEB 50%, #8B4513 50%);
          transition: transform 0.3s ease;
        }

        .horizon-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: white;
          transform: translateY(-1px);
        }

        .attitude-aircraft {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 1.5rem;
          z-index: 2;
        }

        .attitude-values {
          margin-top: 0.5rem;
          font-size: 0.7rem;
          font-family: 'Monaco', 'Menlo', monospace;
          text-align: center;
          color: var(--text-primary);
        }

        .altitude-display,
        .speed-display,
        .compass-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .altitude-value,
        .heading-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .altitude-unit,
        .speed-unit {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .climb-rate {
          font-size: 0.7rem;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .climb-rate .climbing {
          color: var(--success);
        }

        .climb-rate .descending {
          color: var(--error);
        }

        .climb-rate .level {
          color: var(--text-secondary);
        }

        .speed-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .speed-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .speed-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .compass-ring {
          position: relative;
          width: 80px;
          height: 80px;
          border: 2px solid var(--border-primary);
          border-radius: 50%;
        }

        .compass-needle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.3s ease;
        }

        .needle-arrow {
          color: var(--error);
          font-size: 1.5rem;
          transform: translateY(-10px);
        }

        .compass-marks {
          position: absolute;
          inset: 0;
        }

        .mark {
          position: absolute;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .mark.north {
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
        }

        .mark.east {
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
        }

        .mark.south {
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
        }

        .mark.west {
          left: 5px;
          top: 50%;
          transform: translateY(-50%);
        }

        .side-panel {
          width: 300px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .widgets-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .widget {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1rem;
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .widget-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .battery-level {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .battery-level.good {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }

        .battery-level.warning {
          color: var(--warning);
          background: rgba(245, 158, 11, 0.1);
        }

        .battery-level.critical {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .battery-details,
        .gps-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .battery-item,
        .gps-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .battery-item span:first-child,
        .gps-item span:first-child {
          color: var(--text-secondary);
        }

        .battery-item span:last-child,
        .gps-item span:last-child {
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .battery-bar {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .battery-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .gps-status {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .gps-status.good {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }

        .gps-status.warning {
          color: var(--warning);
          background: rgba(245, 158, 11, 0.1);
        }

        .gps-status.error {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .armed-status {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .armed-status.armed {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .armed-status.disarmed {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
        }

        .mode-display {
          text-align: center;
        }

        .current-mode {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .controls-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1rem;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .command-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .command-select,
        .param-input input,
        .param-input select {
          width: 100%;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .param-input {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .param-input label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .flight-view {
            flex-direction: column;
          }
          
          .side-panel {
            width: 100%;
          }
          
          .instruments-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .flight-view {
            padding: 0.75rem;
            gap: 0.75rem;
          }
          
          .instruments-panel {
            height: 150px;
          }
          
          .instrument {
            padding: 0.75rem;
          }
          
          .widgets-section {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(FlightView)

