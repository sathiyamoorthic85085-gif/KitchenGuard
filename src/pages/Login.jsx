import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const origin = window.location.origin
      // Ensure we don't have double slashes if origin has one
      const callbackPath = '/auth/callback'
      const redirectTo = `${origin}${callbackPath}`

      console.log('Login attempt with redirectTo:', redirectTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🍳 KitchenGuard</h1>
        <p>Premium Smart Kitchen Safety</p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '2rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-google"
        >
          {loading ? 'Connecting...' : (
            <>
              <span style={{ fontSize: '1.25rem' }}>🔐</span> Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}
