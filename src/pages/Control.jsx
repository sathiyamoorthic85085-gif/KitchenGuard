import { useMemo, useState } from 'react'
import { useDevice } from '../hooks/useDevice'
import { useAdaptiveWeather } from '../hooks/useAdaptiveWeather'

export default function Control() {
  const { metrics, updateDevice } = useDevice()
  const [fanOn, setFanOn] = useState(true)
  const [regulator, setRegulator] = useState(65)
  const [gasThreshold, setGasThreshold] = useState(50)
  const [tempThreshold, setTempThreshold] = useState(55)
  const [cameraIp, setCameraIp] = useState('192.168.1.24:81/stream')
  const [cameraError, setCameraError] = useState(false)
  const { analysis } = useAdaptiveWeather(metrics.temp)

  const automationTriggered = useMemo(
    () => metrics.gas > gasThreshold || metrics.temp > tempThreshold || metrics.fire > 0.5,
    [metrics, gasThreshold, tempThreshold]
  )

  const cameraFeedUrl = cameraIp ? `http://${cameraIp}` : ''

  const toggleFan = async () => {
    const next = !fanOn
    setFanOn(next)
    await updateDevice('fan', { state: next, regulator })
  }

  const applyAiThresholds = () => {
    setGasThreshold(analysis.recommended.gasThreshold)
    setTempThreshold(analysis.recommended.tempThreshold)
  }

  return (
    <div className="page-container">
      <h2>🎛️ Control Dashboard</h2>

      <div className="panel-grid">
        <div className="settings-group">
          <h3>ESP32-CAM Feed & Child Detection</h3>
          <p className="text-muted">IP Connection</p>
          <input
            value={cameraIp}
            onChange={(e) => {
              setCameraIp(e.target.value)
              setCameraError(false)
            }}
            placeholder="192.168.1.24:81/stream"
            className="form-input"
          />
          <div className="camera-preview">
            {cameraFeedUrl && !cameraError ? (
              <img
                className="camera-feed"
                src={cameraFeedUrl}
                alt="ESP32 Camera feed"
                onError={() => setCameraError(true)}
              />
            ) : (
              <p>👶 Child detection stream preview unavailable. Check the IP and network.</p>
            )}
          </div>
          <p className="text-muted">Status: Camera {cameraFeedUrl && !cameraError ? '🟢 Connected' : '⚫ Waiting'} · ESP32 🟢 Online</p>
        </div>

        <div className="settings-group">
          <h3>Exhaust Fan & Regulator</h3>
          <button className={`control-btn ${fanOn ? 'active' : ''}`} onClick={toggleFan}>
            {fanOn ? 'Power ON' : 'Power OFF'}
          </button>
          <label>Regulator: {regulator}%</label>
          <input className="slider" type="range" min="0" max="100" value={regulator} onChange={(e) => setRegulator(Number(e.target.value))} />
          <p className="text-muted">Automation: {automationTriggered ? '✅ Active - Auto response running' : '⏸️ Standby'}</p>
        </div>
      </div>

      <div className="settings-group">
        <h3>Threshold Setter</h3>
        <label>Gas Threshold: {gasThreshold} ppm</label>
        <input className="slider" type="range" min="30" max="100" value={gasThreshold} onChange={(e) => setGasThreshold(Number(e.target.value))} />
        <label>Temperature Threshold: {tempThreshold}°C</label>
        <input className="slider" type="range" min="40" max="90" value={tempThreshold} onChange={(e) => setTempThreshold(Number(e.target.value))} />
        <button onClick={applyAiThresholds} className="btn-primary">Apply AI Seasonal Thresholds</button>
      </div>
    </div>
  )
}
