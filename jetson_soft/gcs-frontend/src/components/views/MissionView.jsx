import React, { useState, useEffect } from 'react'

const MissionView = ({ isConnected }) => {
  const [waypoints, setWaypoints] = useState([])
  const [missionStats, setMissionStats] = useState({
    total_distance: 0,
    estimated_time: 0,
    waypoint_count: 0,
    battery_required: 0
  })

  // Fetch mission data
  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        const response = await fetch('/api/mission/waypoints')
        if (response.ok) {
          const data = await response.json()
          setWaypoints(data.waypoints || [])
          setMissionStats(data.stats || missionStats)
        }
      } catch (error) {
        console.error('Failed to fetch mission data:', error)
      }
    }

    fetchMissionData()
  }, [])

  const addWaypoint = async () => {
    try {
      const response = await fetch('/api/mission/waypoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: 37.7749,
          lon: -122.4194,
          alt: 50,
          action: 'WAYPOINT'
        })
      })
      
      if (response.ok) {
        const newWaypoint = await response.json()
        setWaypoints(prev => [...prev, newWaypoint])
      }
    } catch (error) {
      console.error('Failed to add waypoint:', error)
    }
  }

  return (
    <div className="mission-view">
      <div className="mission-header">
        <h2>Mission Planning</h2>
        <div className="mission-actions">
          <button className="btn btn-primary" onClick={addWaypoint}>
            Add Waypoint
          </button>
          <button className="btn btn-success" disabled={!isConnected}>
            Upload Mission
          </button>
        </div>
      </div>

      <div className="mission-content">
        <div className="mission-stats">
          <div className="stat-card">
            <div className="stat-value">{missionStats.waypoint_count}</div>
            <div className="stat-label">Waypoints</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(missionStats.total_distance / 1000).toFixed(1)} km</div>
            <div className="stat-label">Distance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(missionStats.estimated_time / 60)} min</div>
            <div className="stat-label">Est. Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{missionStats.battery_required.toFixed(0)}%</div>
            <div className="stat-label">Battery</div>
          </div>
        </div>

        <div className="waypoints-list">
          <h3>Waypoints</h3>
          {waypoints.length === 0 ? (
            <div className="empty-state">
              <p>No waypoints defined. Click "Add Waypoint" to start planning your mission.</p>
            </div>
          ) : (
            <div className="waypoints-table">
              {waypoints.map((wp, index) => (
                <div key={wp.id || index} className="waypoint-row">
                  <div className="wp-number">{index + 1}</div>
                  <div className="wp-action">{wp.action}</div>
                  <div className="wp-coords">
                    {wp.lat?.toFixed(6)}, {wp.lon?.toFixed(6)}
                  </div>
                  <div className="wp-alt">{wp.alt}m</div>
                  <div className="wp-actions">
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon" title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mission-view {
          padding: 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .mission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .mission-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .mission-actions {
          display: flex;
          gap: 0.75rem;
        }

        .mission-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mission-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .waypoints-list {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .waypoints-list h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .waypoints-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .waypoint-row {
          display: grid;
          grid-template-columns: 40px 100px 1fr 80px 80px;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-secondary);
        }

        .wp-number {
          font-weight: 600;
          color: var(--primary-color);
          text-align: center;
        }

        .wp-action {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .wp-coords {
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', monospace;
          color: var(--text-secondary);
        }

        .wp-alt {
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', monospace;
          color: var(--text-primary);
          text-align: right;
        }

        .wp-actions {
          display: flex;
          gap: 0.25rem;
          justify-content: center;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .btn-icon:hover {
          background: var(--bg-glass-hover);
        }

        @media (max-width: 768px) {
          .mission-view {
            padding: 0.75rem;
          }

          .mission-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .mission-actions {
            justify-content: center;
          }

          .mission-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .waypoint-row {
            grid-template-columns: 30px 80px 1fr 60px;
            gap: 0.5rem;
          }

          .wp-actions {
            grid-column: 1 / -1;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default React.memo(MissionView)

