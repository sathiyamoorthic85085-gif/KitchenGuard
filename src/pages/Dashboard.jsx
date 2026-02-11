import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useDevice } from '../hooks/useDevice'
import { useAdaptiveWeather } from '../hooks/useAdaptiveWeather'

const sensorMeta = [
  { key: 'fire', title: 'Fire Sensor', icon: '🔥', image: 'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=600&q=80' },
  { key: 'gas', title: 'Gas Sensor', icon: '💨', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80' },
  { key: 'temp', title: 'Temperature Sensor', icon: '🌡️', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' }
]

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(false)
  const { metrics } = useDevice()
  const { city, setCity, weather, analysis, supportedCities, refreshWeather } = useAdaptiveWeather(metrics.temp)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const sensorValue = {
    fire: metrics.fire > 0.5 ? 'Detected' : 'Safe',
    gas: `${metrics.gas.toFixed(1)} ppm`,
    temp: `${metrics.temp.toFixed(1)}°C`
  }

  return (
    <div className="page-container mobile-app">
      <header className="top-hero">
        <div>
          <h2>KitchenGuard Mobile</h2>
          <p>Welcome {session?.user?.user_metadata?.name || session?.user?.email}</p>
        </div>
        <button onClick={handleLogout} disabled={loading} className="btn-secondary">
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      <section className="cards-grid">
        {sensorMeta.map(sensor => (
          <article key={sensor.key} className="sensor-rich-card">
            <img src={sensor.image} alt={sensor.title} />
            <div className="overlay">
              <h3>{sensor.icon} {sensor.title}</h3>
              <strong>{sensorValue[sensor.key]}</strong>
              <span>Live monitoring active</span>
            </div>
          </article>
        ))}
      </section>

      <section className="status-grid">
        <div className="status-tile"><span>ESP32</span><b>🟢 Online</b></div>
        <div className="status-tile"><span>ESP32-CAM</span><b>🟢 Streaming</b></div>
        <div className="status-tile"><span>Automation</span><b>✅ Active</b></div>
      </section>

      <section className="weather-panel">
        <div className="weather-header">
          <h3>🇮🇳 Real-time India Weather AI</h3>
          <div className="weather-actions">
            <select value={city} onChange={(e) => setCity(e.target.value)} className="form-select">
              {supportedCities.map(name => <option key={name}>{name}</option>)}
            </select>
            <button className="btn-secondary" onClick={refreshWeather} disabled={weather.loading}>
              {weather.loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <p>Outside: <b>{weather.outsideTemp}°C</b> ({weather.condition}) | Inside: <b>{metrics.temp.toFixed(1)}°C</b></p>
        <p>Season: <b>{analysis.season}</b> · Risk: <b>{analysis.risk}</b></p>
        <p className="text-muted">{analysis.aiMessage}</p>
        <p className="text-muted">{analysis.note}</p>
        <p className="text-muted">Source: {weather.source} {weather.updatedAt ? `· Updated ${new Date(weather.updatedAt).toLocaleTimeString()}` : ''}</p>
        {weather.error && <p className="error-message">{weather.error}</p>}
      </section>
    </div>
  )
}
