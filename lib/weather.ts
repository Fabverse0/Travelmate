import { WeatherData } from '@/types'

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Cerah',
  1: 'Cerah berawan',
  2: 'Berawan sebagian',
  3: 'Berawan',
  45: 'Kabut',
  48: 'Kabut beku',
  51: 'Gerimis ringan',
  53: 'Gerimis sedang',
  55: 'Gerimis lebat',
  56: 'Gerimis beku ringan',
  57: 'Gerimis beku lebat',
  61: 'Hujan ringan',
  63: 'Hujan sedang',
  65: 'Hujan lebat',
  66: 'Hujan beku ringan',
  67: 'Hujan beku lebat',
  71: 'Salju ringan',
  73: 'Salju sedang',
  75: 'Salju lebat',
  77: 'Butiran salju',
  80: 'Hujan lebat ringan',
  81: 'Hujan lebat sedang',
  82: 'Hujan lebat deras',
  85: 'Hujan salju ringan',
  86: 'Hujan salju lebat',
  95: 'Badai petir ringan',
  96: 'Badai petir dengan hujan es ringan',
  99: 'Badai petir dengan hujan es lebat',
}

export async function getWeatherForecast(
  lat: number,
  lon: number,
  date?: string
): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.append('latitude', lat.toString())
    url.searchParams.append('longitude', lon.toString())
    url.searchParams.append('daily', 'weathercode,temperature_2m_max,temperature_2m_min')
    url.searchParams.append('timezone', 'auto')
    url.searchParams.append('forecast_days', '7')
    
    if (date) {
      url.searchParams.append('start_date', date)
      url.searchParams.append('end_date', date)
    }

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.warn(`Weather API failed: ${response.status}`)
      return null
    }

    const data: WeatherData = await response.json()
    return data
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

export function getWeatherDescription(weatherCode: number): string {
  return WEATHER_CODE_DESCRIPTIONS[weatherCode] || 'Tidak diketahui'
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}