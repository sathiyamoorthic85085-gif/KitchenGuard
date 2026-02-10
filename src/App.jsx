import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { DeviceProvider } from './hooks/useDevice'
import { ToastProvider } from './hooks/useToast'
import ErrorBoundary from './components/ErrorBoundary'
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
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Global auth state change:', event)
        setSession(session)
        if (event === 'SIGNED_IN') setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Check if we're in auth callback
  const isAuthCallback = window.location.pathname === '/auth/callback' ||
    window.location.hash.includes('access_token=') ||
    window.location.search.includes('code=')

  if (loading && !isAuthCallback) {
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
    <ErrorBoundary>
      <ToastProvider>
        <DeviceProvider>
          <div className="app-layout">
            <aside className="app-sidebar">
              <div className="sidebar-header">
                <h1 onClick={() => setCurrentPage('dashboard')}>
                  🍳 KitchenGuard
                </h1>
              </div>

              <nav className="app-nav">
                <button
                  className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  <span className="icon">📊</span> Dashboard
                </button>
                <button
                  className={`nav-btn ${currentPage === 'control' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('control')}
                >
                  <span className="icon">🎮</span> Control
                </button>
                <button
                  className={`nav-btn ${currentPage === 'alerts' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('alerts')}
                >
                  <span className="icon">🚨</span> Alerts
                </button>
                <button
                  className={`nav-btn ${currentPage === 'family' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('family')}
                >
                  <span className="icon">👨‍👩‍👧‍👦</span> Family
                </button>
                <button
                  className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('profile')}
                >
                  <span className="icon">👤</span> Profile
                </button>
                <button
                  className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('settings')}
                >
                  <span className="icon">⚙️</span> Settings
                </button>
              </nav>

              <div className="user-profile">
                <div className="user-info" title={session?.user?.email}>
                  {session?.user?.email}
                </div>
                <button
                  className="logout-icon-btn"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setSession(null)
                  }}
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </aside>

            <main className="main-content">
              <div className="page-header">
                <h2>
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                </h2>
              </div>
              {renderPage()}
            </main>
          </div>
        </DeviceProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App

