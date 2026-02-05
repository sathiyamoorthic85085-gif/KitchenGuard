import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }
        
        if (session) {
          console.log('Session found, redirecting...')
          // Redirect to dashboard
          window.location.href = '/'
        } else {
          console.log('No session found after callback')
          // Try to get user instead
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (user && !userError) {
            window.location.href = '/'
          } else {
            setError('Failed to authenticate. Please try again.')
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        setLoading(false)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{loading ? 'Authenticating...' : error}</p>
    </div>
  )
}
