import { useContext, createContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DeviceContext = createContext()

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([])
  const [metrics, setMetrics] = useState({ fire: 0, gas: 0, temp: 0 })
  const [loading, setLoading] = useState(true)
  const [childDetected, setChildDetected] = useState(false)
  const [valveOpen, setValveOpen] = useState(true)
  const [fanOn, setFanOn] = useState(false)
  const [esp32Connected, setEsp32Connected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Thresholds (can be updated from Settings)
  const [thresholds, setThresholds] = useState({
    gas: 50,
    co: 35,
    temp: 45
  })

  const previousMetrics = useRef({ fire: 0, gas: 0, temp: 0 })
  const alertCreated = useRef({ gas: false, fire: false, temp: false })

  // Fetch sensor data from ESP32 or simulate
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const esp32Ip = import.meta.env.VITE_ESP32_IP
        if (!esp32Ip || esp32Ip === 'localhost') {
          // Simulation mode
          setEsp32Connected(false)
          return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`http://${esp32Ip}/api/sensors`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setMetrics({
            fire: data.co || 0,
            gas: data.gas || 0,
            temp: data.temperature || 0
          })
          setEsp32Connected(true)
          setLastUpdate(new Date())
        } else {
          setEsp32Connected(false)
        }
      } catch (error) {
        // ESP32 offline or unreachable - use simulation
        setEsp32Connected(false)
        setMetrics({
          fire: Math.random() > 0.98 ? 1 : 0,
          gas: Math.max(0, Math.random() * 60), // Increased range for testing
          temp: 20 + Math.random() * 10
        })
        setLastUpdate(new Date())
      }
    }

    fetchSensorData()
    const interval = setInterval(fetchSensorData, 2000)
    setLoading(false)

    return () => clearInterval(interval)
  }, [])

  // Create alert in Supabase
  const createAlert = useCallback(async (type, title, message, severity = 'medium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('alerts').insert([{
        user_id: user.id,
        type,
        title,
        message,
        severity,
        created_at: new Date().toISOString()
      }])
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }, [])

  // AUTOMATION: Gas level monitoring and automated response
  useEffect(() => {
    const gasLevel = metrics.gas
    const prevGasLevel = previousMetrics.current.gas

    // Critical gas level - auto close valve
    if (gasLevel > thresholds.gas && prevGasLevel <= thresholds.gas) {
      console.log('🚨 CRITICAL: Gas level exceeded threshold! Auto-closing valve.')
      setValveOpen(false)
      setFanOn(true) // Auto-activate fan

      if (!alertCreated.current.gas) {
        createAlert(
          'gas',
          'Critical Gas Leak Detected',
          `Gas level at ${gasLevel.toFixed(1)} ppm exceeds safe threshold of ${thresholds.gas} ppm. Valve automatically closed and ventilation activated.`,
          'high'
        )
        alertCreated.current.gas = true
      }
    }

    // Warning level - auto activate fan
    if (gasLevel > 25 && gasLevel <= thresholds.gas && !fanOn) {
      console.log('⚠️ WARNING: Elevated gas levels. Activating fan.')
      setFanOn(true)

      if (!alertCreated.current.gas) {
        createAlert(
          'gas',
          'Elevated Gas Levels',
          `Gas level at ${gasLevel.toFixed(1)} ppm. Ventilation system activated.`,
          'medium'
        )
        alertCreated.current.gas = true
      }
    }

    // Reset alert flag when gas returns to normal
    if (gasLevel < 20 && alertCreated.current.gas) {
      alertCreated.current.gas = false
      createAlert(
        'info',
        'Gas Levels Normal',
        'Gas concentration has returned to safe levels.',
        'low'
      )
    }

    previousMetrics.current.gas = gasLevel
  }, [metrics.gas, thresholds.gas, fanOn, createAlert])

  // AUTOMATION: CO detection
  useEffect(() => {
    const coLevel = metrics.fire
    const prevCoLevel = previousMetrics.current.fire

    if (coLevel > 0.5 && prevCoLevel <= 0.5) {
      console.log('🚨 CRITICAL: Carbon Monoxide detected!')
      setValveOpen(false)
      setFanOn(true)

      if (!alertCreated.current.fire) {
        createAlert(
          'fire',
          'Carbon Monoxide Detected',
          'Dangerous CO levels detected. All gas systems shut down. Evacuate and ventilate immediately!',
          'high'
        )
        alertCreated.current.fire = true
      }
    }

    if (coLevel <= 0.5 && alertCreated.current.fire) {
      alertCreated.current.fire = false
    }

    previousMetrics.current.fire = coLevel
  }, [metrics.fire, createAlert])

  // AUTOMATION: Temperature monitoring
  useEffect(() => {
    const temp = metrics.temp
    const prevTemp = previousMetrics.current.temp

    if (temp > thresholds.temp && prevTemp <= thresholds.temp) {
      console.log('⚠️ WARNING: High temperature detected!')

      if (!alertCreated.current.temp) {
        createAlert(
          'temp',
          'High Temperature Alert',
          `Kitchen temperature at ${temp.toFixed(1)}°C exceeds threshold of ${thresholds.temp}°C.`,
          'medium'
        )
        alertCreated.current.temp = true
      }
    }

    if (temp < thresholds.temp - 5 && alertCreated.current.temp) {
      alertCreated.current.temp = false
    }

    previousMetrics.current.temp = temp
  }, [metrics.temp, thresholds.temp, createAlert])

  // AUTOMATION: Child detection safety
  useEffect(() => {
    if (childDetected && valveOpen) {
      console.log('🚨 SAFETY: Child detected in kitchen! Auto-closing valve.')
      setValveOpen(false)

      createAlert(
        'info',
        'Child Safety Lock Activated',
        'Child detected in kitchen area. Gas valve automatically closed for safety.',
        'high'
      )
    }
  }, [childDetected, valveOpen, createAlert])

  // Update device state (send to ESP32)
  const updateDevice = useCallback(async (deviceId, state) => {
    try {
      if (deviceId === 'valve') {
        setValveOpen(state.state)
      } else if (deviceId === 'fan') {
        setFanOn(state.state)
      }

      // Send to ESP32 if connected
      const esp32Ip = import.meta.env.VITE_ESP32_IP
      if (esp32Connected && esp32Ip && esp32Ip !== 'localhost') {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        await fetch(`http://${esp32Ip}/api/device/${deviceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('Device update failed:', error)
      throw error
    }
  }, [esp32Connected])

  const toggleChildDetection = useCallback(() => {
    setChildDetected(prev => !prev)
  }, [])

  const updateThresholds = useCallback((newThresholds) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }))
  }, [])

  return (
    <DeviceContext.Provider value={{
      devices,
      metrics,
      loading,
      updateDevice,
      childDetected,
      toggleChildDetection,
      valveOpen,
      fanOn,
      esp32Connected,
      lastUpdate,
      thresholds,
      updateThresholds
    }}>
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevice = () => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider')
  }
  return context
}
