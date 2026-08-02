'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react'
import { formatTemperature } from '@/lib/weather'
import { cn } from '@/lib/utils'

interface WeatherBadgeProps {
  lat: number
  lon: number
  date?: string
  className?: string
}

interface WeatherData {
  temp_max: number
  temp_min: number
  weather_description: string
  weather_code: number
}

const WEATHER_ICONS: Record<number, React.ReactNode> = {
  0: <Sun className="w-4 h-4 text-yellow-500" />,
  1: <Cloud className="w-4 h-4 text-gray-400" />,
  2: <Cloud className="w-4 h-4 text-gray-500" />,
  3: <Cloud className="w-4 h-4 text-gray-600" />,
  45: <Cloud className="w-4 h-4 text-gray-300" />,
  48: <CloudSnow className="w-4 h-4 text-blue-300" />,
  51: <CloudRain className="w-4 h-4 text-blue-400" />,
  53: <CloudRain className="w-4 h-4 text-blue-500" />,
  55: <CloudRain className="w-4 h-4 text-blue-600" />,
  61: <CloudRain className="w-4 h-4 text-blue-500" />,
  63: <CloudRain className="w-4 h-4 text-blue-600" />,
  65: <CloudRain className="w-4 h-4 text-blue-700" />,
  71: <CloudSnow className="w-4 h-4 text-blue-200" />,
  73: <CloudSnow className="w-4 h-4 text-blue-300" />,
  75: <CloudSnow className="w-4 h-4 text-blue-400" />,
  80: <CloudRain className="w-4 h-4 text-blue-500" />,
  81: <CloudRain className="w-4 h-4 text-blue-600" />,
  82: <CloudRain className="w-4 h-4 text-blue-700" />,
  95: <Wind className="w-4 h-4 text-purple-500" />,
  96: <Wind className="w-4 h-4 text-purple-600" />,
  99: <Wind className="w-4 h-4 text-purple-700" />,
}

export function WeatherBadge({ lat, lon, date, className }: WeatherBadgeProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [lat, lon, date])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        ...(date && { date }),
      })

      const response = await fetch(`/api/weather?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather')
      }

      const data = await response.json()
      setWeather(data.forecast)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Gagal mengambil data cuaca')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-tm-pill',
        'animate-pulse-subtle',
        className
      )}>
        <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
        <div className="w-16 h-4 bg-muted-foreground/20 rounded" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-tm-pill',
        'text-muted-foreground',
        className
      )}>
        <Cloud className="w-4 h-4" />
        <span className="text-xs font-space-grotesk">N/A</span>
      </div>
    )
  }

  const weatherIcon = WEATHER_ICONS[weather.weather_code] || <Cloud className="w-4 h-4 text-gray-400" />

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 bg-uupm-sky-light rounded-tm-pill',
      'border border-uupm-sky-blue/20',
      className
    )}>
      {weatherIcon}
      
      <div className="flex items-center gap-1">
        <Thermometer className="w-3 h-3 text-uupm-accent-orange" />
        <span className="text-sm font-ibm-plex-mono font-medium text-uupm-sky-blue">
          {formatTemperature(weather.temp_max)}
        </span>
      </div>
      
      <div className="h-3 w-px bg-uupm-sky-blue/30" />
      
      <span className="text-xs font-space-grotesk font-medium text-uupm-sky-blue capitalize">
        {weather.weather_description.toLowerCase()}
      </span>
      
      {/* Refresh button */}
      <button
        onClick={fetchWeather}
        className="ml-1 p-0.5 hover:bg-uupm-sky-blue/10 rounded-full transition-colors"
        title="Refresh weather"
      >
        <svg className="w-3 h-3 text-uupm-sky-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}