import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          // Redirect to dashboard
          window.location.href = '/'
        } else {
          setError('No session found')
        }
      } catch (err) {
        setError(err.message)
        console.error('Auth callback error:', err)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{error || 'Authenticating...'}</p>
    </div>
  )
}
