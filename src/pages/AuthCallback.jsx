import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('Authenticating...')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage('Processing authentication...')
        
        // Wait for Supabase to exchange code for session
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setMessage('Retrieving session...')
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Session result:', { session, sessionError })
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error(`Session error: ${sessionError.message}`)
        }
        
        if (session && session.user) {
          console.log('Session found for user:', session.user.email)
          setMessage('Redirecting to dashboard...')
          await new Promise(resolve => setTimeout(resolve, 500))
          window.location.href = '/'
          return
        }
        
        // If no session, check current user
        setMessage('Checking authentication status...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        console.log('User result:', { user, userError })
        
        if (user && !userError) {
          console.log('User found:', user.email)
          setMessage('Redirecting to dashboard...')
          await new Promise(resolve => setTimeout(resolve, 500))
          window.location.href = '/'
          return
        }
        
        // If still no session after 2 attempts, show error
        if (attempts < 1) {
          setAttempts(attempts + 1)
          setMessage('Retrying authentication...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          handleCallback()
        } else {
          setError('Authentication failed. Please try logging in again.')
          setMessage('')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication error')
        setMessage('')
      }
    }

    handleCallback()
  }, [attempts])

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{error ? `Error: ${error}` : message}</p>
      {error && (
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Back to Login
        </button>
      )}
    </div>
  )
}
