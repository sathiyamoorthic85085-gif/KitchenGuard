import { useContext, createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DeviceContext = createContext()

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([])
  const [metrics, setMetrics] = useState({ fire: 0, gas: 0, temp: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate ESP32 data fetch
    const interval = setInterval(() => {
      setMetrics({
        fire: Math.random() > 0.95 ? 1 : 0,
        gas: Math.max(0, Math.random() * 100),
        temp: 20 + Math.random() * 25
      })
    }, 2000)

    setLoading(false)
    return () => clearInterval(interval)
  }, [])

  const updateDevice = async (deviceId, state) => {
    try {
      // Call ESP32 API
      await fetch(`http://${import.meta.env.VITE_ESP32_IP}/api/device/${deviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      }).catch(() => console.log('ESP32 offline'))
    } catch (error) {
      console.error('Device update failed:', error)
    }
  }

  return (
    <DeviceContext.Provider value={{ devices, metrics, loading, updateDevice }}>
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevice = () => useContext(DeviceContext)
