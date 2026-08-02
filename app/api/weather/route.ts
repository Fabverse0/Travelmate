import { NextRequest, NextResponse } from 'next/server'
import { getWeatherForecast, getWeatherDescription, formatTemperature } from '@/lib/weather'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const date = searchParams.get('date')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Get weather forecast
    const weatherData = await getWeatherForecast(latitude, longitude, date || undefined)

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 500 }
      )
    }

    // Format response
    const todayIndex = 0 // Today is the first item in the daily array
    const response = {
      location: {
        lat: latitude,
        lon: longitude,
      },
      forecast: {
        date: weatherData.daily.time[todayIndex],
        weather_code: weatherData.daily.weathercode[todayIndex],
        weather_description: getWeatherDescription(weatherData.daily.weathercode[todayIndex]),
        temp_max: weatherData.daily.temperature_2m_max[todayIndex],
        temp_min: weatherData.daily.temperature_2m_min[todayIndex],
        formatted: {
          max: formatTemperature(weatherData.daily.temperature_2m_max[todayIndex]),
          min: formatTemperature(weatherData.daily.temperature_2m_min[todayIndex]),
        }
      },
      full_forecast: weatherData.daily.time.slice(0, 3).map((date, index) => ({
        date,
        weather_code: weatherData.daily.weathercode[index],
        weather_description: getWeatherDescription(weatherData.daily.weathercode[index]),
        temp_max: weatherData.daily.temperature_2m_max[index],
        temp_min: weatherData.daily.temperature_2m_min[index],
      }))
    }

    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}