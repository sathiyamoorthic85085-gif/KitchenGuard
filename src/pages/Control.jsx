import { useState } from 'react'
import { useDevice } from '../hooks/useDevice'

export default function Control() {
  const { metrics, updateDevice } = useDevice()
  const [fanOn, setFanOn] = useState(false)
  const [alarmOn, setAlarmOn] = useState(false)

  const handleFanToggle = async () => {
    const newState = !fanOn
    setFanOn(newState)
    await updateDevice('fan', { state: newState })
  }

  const handleAlarmToggle = async () => {
    const newState = !alarmOn
    setAlarmOn(newState)
    await updateDevice('alarm', { state: newState })
  }

  const getFireStatus = () => metrics.fire > 0.5 ? 'ALERT' : 'Normal'
  const getGasStatus = () => metrics.gas > 50 ? 'ALERT' : metrics.gas > 25 ? 'Warning' : 'Normal'

  return (
    <div className="page-container">
      <h2>🎮 Device Control</h2>

      <div className="metrics-grid">
        <div className={`metric-card ${getFireStatus().toLowerCase()}`}>
          <div className="metric-icon">🔥</div>
          <h3>Fire Detection</h3>
          <p className="metric-value">{metrics.fire > 0.5 ? 'DETECTED' : 'Safe'}</p>
          <span className={`status ${getFireStatus().toLowerCase()}`}>● {getFireStatus()}</span>
        </div>

        <div className={`metric-card ${getGasStatus().toLowerCase()}`}>
          <div className="metric-icon">💨</div>
          <h3>Gas Level</h3>
          <p className="metric-value">{metrics.gas.toFixed(1)} ppm</p>
          <span className={`status ${getGasStatus().toLowerCase()}`}>● {getGasStatus()}</span>
        </div>

        <div className="metric-card normal">
          <div className="metric-icon">🌡️</div>
          <h3>Temperature</h3>
          <p className="metric-value">{metrics.temp.toFixed(1)}°C</p>
          <span className="status normal">● Normal</span>
        </div>
      </div>

      <div className="controls-section">
        <h3>Controls</h3>
        <div className="control-button-group">
          <button 
            className={`control-btn ${fanOn ? 'active' : ''}`}
            onClick={handleFanToggle}
          >
            {fanOn ? '✓ Fan ON' : '○ Fan OFF'}
          </button>
          <button 
            className={`control-btn ${alarmOn ? 'active warning' : ''}`}
            onClick={handleAlarmToggle}
          >
            {alarmOn ? '✓ Alarm ON' : '○ Alarm OFF'}
          </button>
        </div>
      </div>

      <div className="info-box">
        <p>💡 <strong>Tip:</strong> System automatically activates fan when gas level exceeds 50 ppm.</p>
      </div>
    </div>
  )
}
