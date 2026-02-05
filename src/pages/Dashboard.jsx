import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(false)

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
      <header className="header">
        <h1>🍳 KitchenGuard</h1>
        <div className="user-info">
          <span>{session?.user?.email}</span>
          <button onClick={handleLogout} disabled={loading} className="logout-btn">
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome, {session?.user?.user_metadata?.name || session?.user?.email}! 👋</h2>
          <p>Your smart kitchen safety system is active and monitoring.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Fire Detection</h3>
            <p>Real-time monitoring</p>
            <span className="status active">● Active</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💨</div>
            <h3>Gas Detection</h3>
            <p>Continuous monitoring</p>
            <span className="status active">● Active</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌡️</div>
            <h3>Temperature</h3>
            <p>Real-time tracking</p>
            <span className="status active">● Active</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Alerts</h3>
            <p>Instant notifications</p>
            <span className="status active">● Active</span>
          </div>
        </div>

        <div className="status-section">
          <h3>System Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span>ESP32 Device:</span>
              <span className="status-value online">🟢 Online</span>
            </div>
            <div className="status-item">
              <span>Cloud Sync:</span>
              <span className="status-value online">🟢 Connected</span>
            </div>
            <div className="status-item">
              <span>Last Update:</span>
              <span className="status-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
