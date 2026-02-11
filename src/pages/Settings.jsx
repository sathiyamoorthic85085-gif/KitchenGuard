import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoFan: true,
    alertVolume: 80,
    language: 'English',
    units: 'Metric',
    aiPrecisionMode: true
  })

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="page-container">
      <h2>⚙️ App Settings</h2>

      <div className="settings-group">
        <h3>General</h3>
        <div className="setting-item"><label>Language</label><select value={settings.language} onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))} className="form-select"><option>English</option><option>Hindi</option><option>Tamil</option><option>Telugu</option></select></div>
        <div className="setting-item"><label>Units</label><select value={settings.units} onChange={(e) => setSettings(prev => ({ ...prev, units: e.target.value }))} className="form-select"><option>Metric</option><option>Imperial</option></select></div>
      </div>

      <div className="settings-group">
        <h3>Alert & AI</h3>
        <div className="setting-item"><label>Push Notifications</label><input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')} className="toggle-checkbox" /></div>
        <div className="setting-item"><label>AI Precision Alerts</label><input type="checkbox" checked={settings.aiPrecisionMode} onChange={() => handleToggle('aiPrecisionMode')} className="toggle-checkbox" /></div>
        <div className="setting-item"><label>Auto Fan Automation</label><input type="checkbox" checked={settings.autoFan} onChange={() => handleToggle('autoFan')} className="toggle-checkbox" /></div>
        <div className="setting-item"><label>Alert Volume: {settings.alertVolume}%</label><input type="range" min="0" max="100" value={settings.alertVolume} onChange={(e) => setSettings(prev => ({ ...prev, alertVolume: Number(e.target.value) }))} className="slider" /></div>
      </div>

      <div className="settings-group danger-zone">
        <h3>Account</h3>
        <button onClick={handleLogout} className="btn-danger">Sign Out</button>
      </div>
    </div>
  )
}
