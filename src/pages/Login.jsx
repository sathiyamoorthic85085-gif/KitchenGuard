import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use Supabase callback URL for OAuth redirect
      const callbackUrl = window.location.origin.includes('localhost')
        ? `${window.location.origin}/auth/callback`
        : `https://kitchen-guard-ten.vercel.app/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
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
