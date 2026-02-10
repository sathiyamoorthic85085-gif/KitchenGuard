import { useState } from 'react'
import { useDevice } from '../hooks/useDevice'
import { useToast } from '../hooks/useToast'

export default function Control() {
  const { metrics, updateDevice, childDetected, valveOpen, fanOn } = useDevice()
  const { showToast } = useToast()
  const [alarmOn, setAlarmOn] = useState(false)
  const [childLock, setChildLock] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFanToggle = async () => {
    if (childLock) {
      showToast('Child lock is active. Disable it first.', 'warning')
      return
    }
    try {
      setLoading(true)
      const newState = !fanOn
      await updateDevice('fan', { state: newState })
      showToast(`Fan ${newState ? 'activated' : 'deactivated'}`, 'success')
    } catch (error) {
      showToast('Failed to control fan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAlarmToggle = async () => {
    if (childLock) {
      showToast('Child lock is active. Disable it first.', 'warning')
      return
    }
    try {
      setLoading(true)
      const newState = !alarmOn
      setAlarmOn(newState)
      await updateDevice('alarm', { state: newState })
      showToast(`Alarm ${newState ? 'activated' : 'deactivated'}`, 'success')
    } catch (error) {
      showToast('Failed to control alarm', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleValveToggle = async () => {
    if (childLock) {
      showToast('Child lock is active. Disable it first.', 'warning')
      return
    }
    if (childDetected) {
      showToast('Cannot open valve while child is detected!', 'error')
      return
    }
    if (metrics.gas > 50) {
      showToast('Cannot open valve - gas levels too high!', 'error')
      return
    }
    try {
      setLoading(true)
      const newState = !valveOpen
      await updateDevice('valve', { state: newState })
      showToast(`Gas valve ${newState ? 'opened' : 'closed'}`, newState ? 'warning' : 'success')
    } catch (error) {
      showToast('Failed to control valve', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChildLockToggle = () => {
    const newState = !childLock
    setChildLock(newState)
    showToast(`Child lock ${newState ? 'enabled' : 'disabled'}`, newState ? 'warning' : 'info')
  }

  const getGasStatus = () => metrics.gas > 50 ? 'Critical' : metrics.gas > 25 ? 'Warning' : 'Normal'

  return (
    <div>
      {childDetected && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid var(--danger)',
          color: 'var(--text-main)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <h3 style={{ margin: 0, color: 'var(--danger)' }}>AUTOMATIC SHUTOFF ACTIVE: Child Detected</h3>
        </div>
      )}

      <div className="stats-grid">
        {/* CO Sensor Card */}
        <div className="stat-card fire">
          <div className="stat-header">
            <h3>CO Monitor</h3>
            <div className="stat-icon">☁️</div>
          </div>
          <p className="stat-value">{metrics.fire > 0.5 ? 'DETECTED' : '0 ppm'}</p>
          <span className="stat-status">
            {metrics.fire > 0.5 ? 'CRITICAL ALERT' : 'Normal Levels'}
          </span>
        </div>

        <div className="stat-card gas">
          <div className="stat-header">
            <h3>Gas Level</h3>
            <div className="stat-icon">💨</div>
          </div>
          <p className="stat-value">{metrics.gas.toFixed(1)} ppm</p>
          <span className="stat-status">{getGasStatus()}</span>
        </div>

        <div className="stat-card temp">
          <div className="stat-header">
            <h3>Temperature</h3>
            <div className="stat-icon">🌡️</div>
          </div>
          <p className="stat-value">{metrics.temp.toFixed(1)}°C</p>
          <span className="stat-status">Real-time</span>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="stat-header">
          <h3 style={{ fontSize: '1.25rem' }}>System Controls</h3>
          {childLock && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>🔒 Child Lock Active</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <button
            className={`control-btn fan ${fanOn ? 'active' : ''}`}
            onClick={handleFanToggle}
            disabled={loading}
            style={{ opacity: childLock || loading ? 0.5 : 1, cursor: childLock || loading ? 'not-allowed' : 'pointer' }}
          >
            <div className="icon">🌪️</div>
            <span>Fan {fanOn ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`control-btn alarm ${alarmOn ? 'active' : ''}`}
            onClick={handleAlarmToggle}
            disabled={loading}
            style={{ opacity: childLock || loading ? 0.5 : 1, cursor: childLock || loading ? 'not-allowed' : 'pointer' }}
          >
            <div className="icon">🚨</div>
            <span>Alarm {alarmOn ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`control-btn valve`}
            style={{
              background: valveOpen ? 'var(--bg-hover)' : 'var(--danger)',
              borderColor: valveOpen ? 'var(--border)' : 'var(--danger)',
              opacity: (childLock || childDetected || loading) ? 0.5 : 1,
              cursor: (childLock || childDetected || loading) ? 'not-allowed' : 'pointer',
              boxShadow: valveOpen ? 'none' : '0 0 15px rgba(239, 68, 68, 0.4)'
            }}
            onClick={handleValveToggle}
            disabled={loading}
          >
            <div className="icon">🛑</div>
            <span>Valve {valveOpen ? 'OPEN' : 'CLOSED'}</span>
            {childDetected && <small style={{ color: 'var(--danger)', fontWeight: 800 }}>SAFETY LOCK</small>}
          </button>

          {/* Child Lock Button */}
          <button
            className={`control-btn`}
            style={{
              background: childLock ? 'var(--warning)' : 'var(--bg-hover)',
              color: childLock ? 'black' : 'var(--text-muted)',
              borderColor: childLock ? 'var(--warning)' : 'var(--border)'
            }}
            onClick={handleChildLockToggle}
            disabled={loading}
          >
            <div className="icon">{childLock ? '🔒' : '🔓'}</div>
            <span>Child Lock</span>
          </button>
        </div>
      </div>
    </div>
  )
}
