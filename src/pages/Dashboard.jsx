import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useDevice } from '../hooks/useDevice'

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(false)
  const { childDetected, toggleChildDetection, metrics, valveOpen, esp32Connected, lastUpdate } = useDevice()

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Connection Status Banner */}
      {!esp32Connected && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.2)',
          border: '1px solid var(--warning)',
          color: 'var(--text-main)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, color: 'var(--warning)' }}>Simulation Mode</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>ESP32 device not connected. Showing simulated sensor data.</p>
          </div>
        </div>
      )}

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
          gap: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <div>
            <h4 style={{ margin: 0, color: 'var(--danger)' }}>Safety Automation Active</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Child detected in kitchen. Gas valve has been <strong>CLOSED</strong> automatically.</p>
          </div>
        </div>
      )}

      {/* Primary Monitoring Cards */}
      <div className="stats-grid">
        <div className="stat-card fire">
          <div className="stat-header">
            <h3>CO Sensor</h3>
            <div className="stat-icon">☁️</div>
          </div>
          <p className="stat-value">{metrics?.fire > 0.5 ? 'DETECTED' : '0 ppm'}</p>
          <span className="stat-status" style={{ color: metrics?.fire > 0.5 ? 'var(--danger)' : 'var(--success)' }}>
            ● {metrics?.fire > 0.5 ? 'CRITICAL' : 'Normal'}
          </span>
        </div>

        <div className="stat-card gas">
          <div className="stat-header">
            <h3>LPG Level</h3>
            <div className="stat-icon">🔥</div>
          </div>
          <p className="stat-value">{metrics ? metrics.gas.toFixed(1) : '--'} ppm</p>
          <span className="stat-status" style={{ color: metrics?.gas > 50 ? 'var(--danger)' : metrics?.gas > 25 ? 'var(--warning)' : 'var(--success)' }}>
            ● {metrics?.gas > 50 ? 'Critical' : metrics?.gas > 25 ? 'Warning' : 'Normal'}
          </span>
        </div>

        <div className="stat-card temp">
          <div className="stat-header">
            <h3>Temperature</h3>
            <div className="stat-icon">🌡️</div>
          </div>
          <p className="stat-value">{metrics ? metrics.temp.toFixed(1) : '--'}°C</p>
          <span className="stat-status" style={{ color: 'var(--secondary)' }}>
            ● Stable
          </span>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <h3>Valve Status</h3>
            <div className="stat-icon">{valveOpen ? '🟢' : '🔴'}</div>
          </div>
          <p className="stat-value">{valveOpen ? 'Open' : 'Closed'}</p>
          <span className="stat-status" style={{ color: valveOpen ? 'var(--warning)' : 'var(--success)' }}>
            ● {valveOpen ? 'Gas Flowing' : 'Safety Off'}
          </span>
        </div>
      </div>

      {/* LPG Monitoring Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', borderLeft: '4px solid var(--warning)', paddingLeft: '1rem' }}>
          🔥 LPG Monitoring
        </h2>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="stat-card" style={{ borderColor: 'var(--warning)', background: 'linear-gradient(135deg, var(--bg-card), rgba(245, 158, 11, 0.05))' }}>
            <div className="stat-header">
              <h3>Gas Concentration</h3>
              <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}>💨</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.75rem' }}>{metrics ? metrics.gas.toFixed(1) : '--'} ppm</p>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((metrics?.gas / 100) * 100, 100) || 0}%`, height: '100%', background: metrics?.gas > 50 ? 'var(--danger)' : metrics?.gas > 25 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.3s' }}></div>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              Threshold: 50 ppm (Adjustable in Settings)
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'var(--secondary)' }}>
            <div className="stat-header">
              <h3>Leak Detection</h3>
              <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'rgba(0, 242, 255, 0.1)' }}>🔍</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>{metrics?.gas > 50 ? 'LEAK DETECTED' : 'No Leak'}</p>
            <span className="stat-status" style={{ color: metrics?.gas > 50 ? 'var(--danger)' : 'var(--success)' }}>
              ● {metrics?.gas > 50 ? 'ALERT' : 'Secure'}
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
            <div className="stat-header">
              <h3>Auto Response</h3>
              <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(187, 134, 252, 0.1)' }}>⚡</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>Active</p>
            <span className="stat-status" style={{ color: 'var(--primary)' }}>
              ● Valve closes at 50+ ppm
            </span>
          </div>
        </div>
      </div>

      {/* Child Monitoring Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
          👶 Child Monitoring
        </h2>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div
            className="stat-card"
            style={{
              borderColor: childDetected ? 'var(--danger)' : 'var(--primary)',
              background: childDetected ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
              cursor: 'pointer'
            }}
            onClick={toggleChildDetection}
            title="Click to simulate Child Detection"
          >
            <div className="stat-header">
              <h3>Kitchen Entry</h3>
              <div className="stat-icon" style={{ color: childDetected ? 'var(--danger)' : 'var(--primary)' }}>🎥</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>{childDetected ? 'MOTION DETECTED' : 'No Motion'}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              {childDetected ? '⚠️ Child in Danger Zone' : 'Area Clear (Click to Simulate)'}
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'var(--secondary)' }}>
            <div className="stat-header">
              <h3>Cabinet Locks</h3>
              <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'rgba(0, 242, 255, 0.1)' }}>🔒</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>Engaged</p>
            <span className="stat-status" style={{ color: 'var(--success)' }}>
              ● 4/4 Locked
            </span>
          </div>
          <div className="stat-card" style={{ borderColor: 'var(--accent)' }}>
            <div className="stat-header">
              <h3>Stove Guard</h3>
              <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(255, 0, 85, 0.1)' }}>🛡️</div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>Active</p>
            <span className="stat-status" style={{ color: 'var(--success)' }}>
              ● Safe Mode
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="stat-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>System Overview</h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
          </span>
        </div>
        <div className="status-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="status-item" style={{ background: 'var(--bg-hover)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>ESP32 Device</span>
            <span style={{ color: esp32Connected ? 'var(--success)' : 'var(--warning)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: esp32Connected ? 'var(--success)' : 'var(--warning)', borderRadius: '50%' }}></span>
              {esp32Connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="status-item" style={{ background: 'var(--bg-hover)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left' }}>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Automation</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span> {childDetected ? 'Triggered' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
