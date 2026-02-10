import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useDevice } from '../hooks/useDevice'
import { useToast } from '../hooks/useToast'

export default function Settings() {
  const { thresholds, updateThresholds } = useDevice()
  const { showToast } = useToast()

  const [settings, setSettings] = useState({
    notifications: true,
    autoFan: true,
    alertVolume: 80,
    theme: 'dark',
    gasThreshold: 50,
    coThreshold: 35,
    tempThreshold: 45
  })

  // Sync with device context thresholds
  useEffect(() => {
    if (thresholds) {
      setSettings(prev => ({
        ...prev,
        gasThreshold: thresholds.gas,
        coThreshold: thresholds.co,
        tempThreshold: thresholds.temp
      }))
    }
  }, [thresholds])

  const handleToggle = (key) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    showToast(`${key} ${newValue ? 'enabled' : 'disabled'}`, 'success')
  }

  const handleSlider = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleThresholdChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))

    // Update device context immediately
    const thresholdMap = {
      gasThreshold: 'gas',
      coThreshold: 'co',
      tempThreshold: 'temp'
    }

    if (thresholdMap[key]) {
      updateThresholds({ [thresholdMap[key]]: value })
      showToast(`${key.replace('Threshold', '')} threshold updated to ${value}`, 'success')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      showToast('Failed to logout', 'error')
    }
  }

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Notifications</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block' }}>Push Notifications</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Get alerts on your phone</p>
          </div>
          <label className="toggle" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
            />
          </label>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Device Automation</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block' }}>Auto-Fan Activation</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Turn on fan when gas exceeds threshold</p>
          </div>
          <input type="checkbox" checked={settings.autoFan} onChange={() => handleToggle('autoFan')}
            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* Sensor Threshold Settings */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'var(--warning)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚙️ Sensor Thresholds
        </h3>

        {/* LPG Gas Threshold */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span>🔥 LPG Gas Threshold</span>
            <span style={{ color: 'var(--warning)' }}>{settings.gasThreshold} ppm</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.gasThreshold}
            onChange={(e) => handleSlider('gasThreshold', parseInt(e.target.value))}
            onMouseUp={(e) => handleThresholdChange('gasThreshold', parseInt(e.target.value))}
            onTouchEnd={(e) => handleThresholdChange('gasThreshold', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--warning)' }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
            Valve will auto-close when gas exceeds this level
          </p>
        </div>

        {/* CO Threshold */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span>☁️ CO Sensor Threshold</span>
            <span style={{ color: 'var(--danger)' }}>{settings.coThreshold} ppm</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.coThreshold}
            onChange={(e) => handleSlider('coThreshold', parseInt(e.target.value))}
            onMouseUp={(e) => handleThresholdChange('coThreshold', parseInt(e.target.value))}
            onTouchEnd={(e) => handleThresholdChange('coThreshold', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--danger)' }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
            Alert triggers when CO concentration exceeds this level
          </p>
        </div>

        {/* Temperature Threshold */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span>🌡️ Temperature Threshold</span>
            <span style={{ color: 'var(--secondary)' }}>{settings.tempThreshold}°C</span>
          </label>
          <input
            type="range"
            min="30"
            max="80"
            value={settings.tempThreshold}
            onChange={(e) => handleSlider('tempThreshold', parseInt(e.target.value))}
            onMouseUp={(e) => handleThresholdChange('tempThreshold', parseInt(e.target.value))}
            onTouchEnd={(e) => handleThresholdChange('tempThreshold', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--secondary)' }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
            High temperature alert threshold
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Audio</h3>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Alert Volume</span>
            <span>{settings.alertVolume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.alertVolume}
            onChange={(e) => handleSlider('alertVolume', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--warning)' }}
          />
        </div>
      </div>

      <div className="glass-card danger-zone">
        <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Danger Zone</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sign out of your account on this device</p>
          <button onClick={handleLogout} className="btn-danger">Sign Out</button>
        </div>
      </div>
    </div>
  )
}
