import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { DeviceProvider } from './hooks/useDevice'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Control from './pages/Control'
import Alerts from './pages/Alerts'
import Family from './pages/Family'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setLoading(false)
      } catch (error) {
        console.error('Session check error:', error)
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Check if we're in auth callback
  const isAuthCallback = window.location.hash.includes('access_token') || window.location.hash.includes('code')

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (isAuthCallback) {
    return <AuthCallback />
  }

  if (!session) return <Login />

  const renderPage = () => {
    switch (currentPage) {
      case 'control': return <Control />
      case 'alerts': return <Alerts />
      case 'family': return <Family />
      case 'profile': return <Profile />
      case 'settings': return <Settings />
      default: return <Dashboard session={session} />
    }
  }

  return (
    <DeviceProvider>
      <div className="app-layout">
        <header className="app-header">
          <h1 onClick={() => setCurrentPage('dashboard')} style={{ cursor: 'pointer' }}>
            🍳 KitchenGuard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="user-email">{session?.user?.email}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                setSession(null)
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Home
          </button>
          <button 
            className={`nav-btn ${currentPage === 'control' ? 'active' : ''}`}
            onClick={() => setCurrentPage('control')}
          >
            🎮 Control
          </button>
          <button 
            className={`nav-btn ${currentPage === 'alerts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('alerts')}
          >
            🚨 Alerts
          </button>
          <button 
            className={`nav-btn ${currentPage === 'family' ? 'active' : ''}`}
            onClick={() => setCurrentPage('family')}
          >
            👨‍👩‍👧‍👦 Family
          </button>
          <button 
            className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <main className="app-content">
          {renderPage()}
        </main>
      </div>
    </DeviceProvider>
  )
}

export default App
