import React, { useEffect, useRef, useState } from 'react'
import { useTelemetry } from './useTelemetry'

const MapView = ({ isConnected }) => {
  const { telemetry } = useTelemetry()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const droneMarkerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if Leaflet is available
        if (typeof window.L === 'undefined') {
          throw new Error('Leaflet library not loaded')
        }

        const L = window.L

        // Create map instance
        const map = L.map(mapRef.current, {
          center: [37.7749, -122.4194], // Default to San Francisco
          zoom: 15,
          zoomControl: true,
          attributionControl: true
        })

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)

        // Create drone marker
        const droneIcon = L.divIcon({
          className: 'drone-marker',
          html: '🚁',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })

        const droneMarker = L.marker([37.7749, -122.4194], {
          icon: droneIcon,
          title: 'Drone Position'
        }).addTo(map)

        mapInstanceRef.current = map
        droneMarkerRef.current = droneMarker
        setMapLoaded(true)

      } catch (error) {
        console.error('Failed to initialize map:', error)
        setMapError(error.message)
      }
    }

    // Load Leaflet if not already loaded
    if (typeof window.L === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      script.onerror = () => setMapError('Failed to load Leaflet library')
      document.head.appendChild(script)
    } else {
      initMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  // Update drone position
  useEffect(() => {
    if (mapLoaded && droneMarkerRef.current && telemetry.gps_lat && telemetry.gps_lon) {
      const newPos = [telemetry.gps_lat, telemetry.gps_lon]
      droneMarkerRef.current.setLatLng(newPos)
      
      // Center map on drone if it's the first valid position
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(newPos, mapInstanceRef.current.getZoom())
      }
    }
  }, [mapLoaded, telemetry.gps_lat, telemetry.gps_lon])

  if (mapError) {
    return (
      <div className="map-view">
        <div className="map-error">
          <div className="error-content">
            <div className="error-icon">🗺️</div>
            <h3>Map Error</h3>
            <p>{mapError}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>

        <style jsx>{`
          .map-view {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
          }

          .map-error {
            text-align: center;
            padding: 2rem;
          }

          .error-content {
            max-width: 400px;
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .error-content h3 {
            font-size: 1.5rem;
            color: var(--text-primary);
            margin-bottom: 1rem;
          }

          .error-content p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.6;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="map-view">
      <div className="map-container">
        <div ref={mapRef} className="map" />
        
        {/* Map Overlay */}
        <div className="map-overlay">
          <div className="map-info">
            <div className="info-panel">
              <div className="info-item">
                <span className="info-label">Position:</span>
                <span className="info-value">
                  {telemetry.gps_lat && telemetry.gps_lon 
                    ? `${telemetry.gps_lat.toFixed(6)}, ${telemetry.gps_lon.toFixed(6)}`
                    : 'No GPS'
                  }
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Altitude:</span>
                <span className="info-value">
                  {telemetry.altitude ? `${telemetry.altitude.toFixed(1)}m` : '---'}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Speed:</span>
                <span className="info-value">
                  {telemetry.groundspeed ? `${telemetry.groundspeed.toFixed(1)} m/s` : '---'}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Satellites:</span>
                <span className={`info-value ${telemetry.gps_satellites >= 6 ? 'good' : 'warning'}`}>
                  {telemetry.gps_satellites || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="map-controls">
            <button 
              className="map-btn"
              onClick={() => {
                if (mapInstanceRef.current && telemetry.gps_lat && telemetry.gps_lon) {
                  mapInstanceRef.current.setView([telemetry.gps_lat, telemetry.gps_lon], 15)
                }
              }}
              title="Center on Drone"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            <button 
              className="map-btn"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1)
                }
              }}
              title="Zoom In"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>

            <button 
              className="map-btn"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1)
                }
              }}
              title="Zoom Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
          </div>
        </div>

        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading map...</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .map-view {
          height: 100%;
          background: var(--bg-primary);
        }

        .map-container {
          position: relative;
          height: 100%;
          width: 100%;
        }

        .map {
          height: 100%;
          width: 100%;
          border-radius: 0;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
        }

        .map-info {
          pointer-events: auto;
        }

        .info-panel {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          min-width: 250px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .info-value.good {
          color: var(--success);
        }

        .info-value.warning {
          color: var(--warning);
        }

        .map-controls {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-self: flex-end;
          pointer-events: auto;
        }

        .map-btn {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.05);
        }

        .map-loading {
          position: absolute;
          inset: 0;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Global styles for Leaflet */
        :global(.drone-marker) {
          background: none !important;
          border: none !important;
          font-size: 24px;
          text-align: center;
          line-height: 30px;
        }

        :global(.leaflet-container) {
          background: var(--bg-primary) !important;
        }

        :global(.leaflet-control-zoom) {
          display: none !important;
        }

        :global(.leaflet-control-attribution) {
          background: rgba(0, 0, 0, 0.7) !important;
          color: white !important;
          font-size: 0.7rem !important;
        }

        :global(.leaflet-control-attribution a) {
          color: var(--primary-color) !important;
        }

        @media (max-width: 768px) {
          .map-overlay {
            padding: 0.75rem;
          }

          .info-panel {
            min-width: auto;
            padding: 0.75rem;
          }

          .info-item {
            margin-bottom: 0.5rem;
          }

          .info-label,
          .info-value {
            font-size: 0.8rem;
          }

          .map-controls {
            gap: 0.375rem;
          }

          .map-btn {
            padding: 0.625rem;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(MapView)

