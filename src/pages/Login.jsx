import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Listen for auth state change and redirect on login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          window.location.href = '/'
        }
      }
    )
    return () => subscription?.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const redirectUrl = `${window.location.origin}/`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🍳 KitchenGuard</h1>
        <p>Smart Kitchen Safety System</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="google-btn"
        >
          {loading ? 'Signing in...' : '🔐 Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
