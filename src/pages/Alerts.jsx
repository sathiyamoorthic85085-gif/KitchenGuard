import { useMemo } from 'react'
import { useAlerts } from '../hooks/useAlerts'
import { useDevice } from '../hooks/useDevice'

export default function Alerts() {
  const { alerts, loading } = useAlerts()
  const { metrics } = useDevice()

  const liveAlerts = useMemo(() => {
    const generated = []
    if (metrics.fire > 0.5) generated.push({ id: 'live-fire', type: 'fire', title: 'Fire Risk Detected', message: 'Flame signature found near stove. Exhaust fan auto-enabled.', severity: 'high', created_at: new Date().toISOString() })
    if (metrics.gas > 50) generated.push({ id: 'live-gas', type: 'gas', title: 'Gas Level Above Threshold', message: `Gas concentration is ${metrics.gas.toFixed(1)} ppm. Open windows and inspect regulator.`, severity: 'high', created_at: new Date().toISOString() })
    if (metrics.temp > 55) generated.push({ id: 'live-temp', type: 'temp', title: 'Overheat Condition', message: `Kitchen temperature is ${metrics.temp.toFixed(1)}°C. Cooling sequence started.`, severity: 'medium', created_at: new Date().toISOString() })
    return generated
  }, [metrics])

  const allAlerts = [...liveAlerts, ...alerts]

  if (loading) return <div className="page-container"><p>Loading alerts...</p></div>

  return (
    <div className="page-container">
      <h2>🚨 Alert Dashboard</h2>
      <p className="text-muted">Clear alert feed with precise actions for family safety.</p>

      {allAlerts.length === 0 ? (
        <div className="empty-state">
          <p>✅ No active alerts</p>
          <p className="text-muted">All sensors and devices are in safe range.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {allAlerts.map(alert => (
            <div key={alert.id} className={`alert-item alert-${alert.type}`}>
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
                <small>{new Date(alert.created_at).toLocaleString()}</small>
              </div>
              <span className={`severity-badge ${alert.severity || 'medium'}`}>{alert.severity || 'medium'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
