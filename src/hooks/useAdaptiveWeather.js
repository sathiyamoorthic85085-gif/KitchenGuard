import { useCallback, useEffect, useMemo, useState } from 'react'

const INDIAN_CITIES = {
  Delhi: { lat: 28.6139, lon: 77.2090 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Kolkata: { lat: 22.5726, lon: 88.3639 }
}

const SEASON_HINTS = {
  winter: { gas: 42, temp: 48, note: 'Cool season: lower gas threshold for safer kitchen ventilation.' },
  summer: { gas: 55, temp: 58, note: 'Summer heat: keep higher temperature tolerance and strong fan automation.' },
  monsoon: { gas: 45, temp: 50, note: 'Monsoon humidity: medium thresholds with camera supervision.' },
  spring: { gas: 48, temp: 52, note: 'Spring balance: maintain standard thresholds with AI watch.' }
}

function getSeason(month) {
  if ([11, 0, 1].includes(month)) return 'winter'
  if ([2, 3].includes(month)) return 'spring'
  if ([5, 6, 7, 8].includes(month)) return 'monsoon'
  return 'summer'
}

export function useAdaptiveWeather(indoorTemp = 28) {
  const [city, setCity] = useState('Delhi')
  const [weather, setWeather] = useState({
    outsideTemp: 31,
    condition: 'Clear',
    loading: true,
    source: 'fallback',
    updatedAt: null,
    error: null
  })

  const loadWeather = useCallback(async () => {
    setWeather(prev => ({ ...prev, loading: true, error: null }))
    const { lat, lon } = INDIAN_CITIES[city]

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`)
      const data = await response.json()

      const temp = data?.current?.temperature_2m
      const code = data?.current?.weather_code
      const condition = code >= 61 ? 'Rain' : code >= 45 ? 'Fog' : code >= 2 ? 'Cloudy' : 'Clear'

      setWeather({
        outsideTemp: Number.isFinite(temp) ? temp : 31,
        condition,
        loading: false,
        source: 'open-meteo',
        updatedAt: new Date().toISOString(),
        error: null
      })
    } catch {
      setWeather({
        outsideTemp: 31,
        condition: 'Clear',
        loading: false,
        source: 'fallback',
        updatedAt: new Date().toISOString(),
        error: 'Live weather unavailable. Using safe fallback profile.'
      })
    }
  }, [city])

  useEffect(() => {
    loadWeather()
    const intervalId = setInterval(loadWeather, 10 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [loadWeather])

  const analysis = useMemo(() => {
    const season = getSeason(new Date().getMonth())
    const seasonConfig = SEASON_HINTS[season]
    const delta = weather.outsideTemp - indoorTemp

    const recommended = {
      gasThreshold: Math.max(35, Math.round(seasonConfig.gas + delta * 0.3)),
      tempThreshold: Math.max(42, Math.round(seasonConfig.temp + delta * 0.4))
    }

    const risk = weather.condition === 'Rain'
      ? 'Medium'
      : indoorTemp > recommended.tempThreshold
        ? 'High'
        : 'Low'

    const aiMessage = `AI tuned for ${season}: keep gas at ${recommended.gasThreshold} ppm and temperature at ${recommended.tempThreshold}°C.`

    return {
      season,
      risk,
      note: seasonConfig.note,
      recommended,
      aiMessage
    }
  }, [weather.outsideTemp, weather.condition, indoorTemp])

  return {
    city,
    setCity,
    weather,
    analysis,
    refreshWeather: loadWeather,
    supportedCities: Object.keys(INDIAN_CITIES)
  }
}
