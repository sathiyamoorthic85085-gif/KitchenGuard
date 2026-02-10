import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()

    // Set up real-time subscription for new alerts
    const subscription = supabase
      .channel('alerts_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('New alert received:', payload.new)
          setAlerts(prev => [payload.new, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Fetch alerts error:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = async (alertId) => {
    try {
      await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId)

      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Dismiss alert error:', error)
    }
  }

  return { alerts, loading, refetch: fetchAlerts, dismissAlert }
}
