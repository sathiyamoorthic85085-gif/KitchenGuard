import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [message, setMessage] = useState('Processing login...')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Auth Callback initiated')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          console.log('Session established, redirecting...')
          setMessage('Login successful! Redirecting...')
          // Clear hash and redirect
          window.location.replace('/')
        } else {
          // If no session yet, wait for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event in callback:', event)
            if (session) {
              subscription.unsubscribe()
              window.location.replace('/')
            }
          })

          // Timeout after 10s if nothing happens
          setTimeout(() => {
            subscription.unsubscribe()
            setMessage('Authentication timed out. Please try again.')
          }, 10000)
        }
      } catch (err) {
        console.error('Fatal callback error:', err)
        setMessage(`Error: ${err.message || 'Unknown verification error'}`)
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
      {message.includes('Error') && (
        <button
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#ff4b4b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Return to Login
        </button>
      )}
    </div>
  )
}
