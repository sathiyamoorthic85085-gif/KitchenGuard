import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoFan: true,
    alertVolume: 80,
    theme: 'dark'
  })

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSlider = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="page-container">
      <h2>⚙️ Settings</h2>

      <div className="settings-group">
        <h3>Notifications</h3>
        <div className="setting-item">
          <div className="setting-info">
            <label>Enable Notifications</label>
            <p className="text-muted">Get alerts on your phone</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => handleToggle('notifications')}
            className="toggle-checkbox"
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Device Control</h3>
        <div className="setting-item">
          <div className="setting-info">
            <label>Auto-Fan Activation</label>
            <p className="text-muted">Fan activates at 50 ppm gas</p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoFan}
            onChange={() => handleToggle('autoFan')}
            className="toggle-checkbox"
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Audio</h3>
        <div className="setting-item">
          <label>Alert Volume: {settings.alertVolume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.alertVolume}
            onChange={(e) => handleSlider('alertVolume', parseInt(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Display</h3>
        <div className="setting-item">
          <label>Theme</label>
          <select 
            value={settings.theme}
            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
            className="form-select"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <div className="settings-group danger-zone">
        <h3>Danger Zone</h3>
        <button onClick={handleLogout} className="btn-danger">Sign Out</button>
      </div>
    </div>
  )
}
