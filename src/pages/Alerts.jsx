import { useAlerts } from '../hooks/useAlerts'

export default function Alerts() {
  const { alerts, loading } = useAlerts()

  if (loading) return <div className="page-container"><p>Loading alerts...</p></div>

  return (
    <div className="page-container">
      <h2>🚨 Alerts & Notifications</h2>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <p>✓ No active alerts</p>
          <p className="text-muted">Everything is running normally</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item alert-${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'fire' && '🔥'}
                {alert.type === 'gas' && '💨'}
                {alert.type === 'temp' && '🌡️'}
                {alert.type === 'info' && 'ℹ️'}
              </div>
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
                <small>{new Date(alert.created_at).toLocaleString()}</small>
              </div>
              {alert.severity === 'high' && <span className="severity-badge">Critical</span>}
            </div>
          ))}
        </div>
      )}

      <div className="info-box">
        <p>📱 Enable notifications in settings to receive real-time alerts on your device.</p>
      </div>
    </div>
  )
}
