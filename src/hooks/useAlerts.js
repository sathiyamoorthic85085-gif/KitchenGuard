import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Fetch alerts error:', error)
    } finally {
      setLoading(false)
    }
  }

  return { alerts, loading, refetch: fetchAlerts }
}
