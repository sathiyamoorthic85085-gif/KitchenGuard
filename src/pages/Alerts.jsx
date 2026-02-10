import { useAlerts } from '../hooks/useAlerts'
import { useToast } from '../hooks/useToast'

export default function Alerts() {
  const { alerts, loading, dismissAlert } = useAlerts()
  const { showToast } = useToast()

  const handleDismiss = async (alertId) => {
    try {
      await dismissAlert(alertId)
      showToast('Alert dismissed', 'success')
    } catch (error) {
      showToast('Failed to dismiss alert', 'error')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'var(--danger)'
      case 'high': return 'var(--warning)'
      case 'medium': return 'var(--secondary)'
      default: return 'var(--text-muted)'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return 'ℹ️'
      default: return '📢'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading alerts...</p>
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Systems Nominal</h2>
        <p style={{ color: 'var(--text-muted)' }}>No active alerts at this time</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Active Alerts ({alerts.length})</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time monitoring</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="glass-card"
            style={{
              borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
              animation: 'fadeIn 0.3s ease-out',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getSeverityIcon(alert.severity)}</span>
                  <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{alert.title}</h3>
                  <span
                    style={{
                      background: `${getSeverityColor(alert.severity)}20`,
                      color: getSeverityColor(alert.severity),
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {alert.message}
                </p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--primary)'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--bg-hover)'
                  e.target.style.color = 'var(--text-muted)'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
