interface GeocodingResult {
  lat: number
  lon: number
  display_name: string
}

export async function geocodeLocation(
  locationName: string,
  destination: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    // Gabungkan location name dengan destination untuk konteks yang lebih baik
    const query = `${locationName}, ${destination}, Indonesia`
    const encodedQuery = encodeURIComponent(query)
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TravelMate/1.0 (AI Travel Assistant)',
        },
      }
    )

    if (!response.ok) {
      console.warn(`Geocoding failed for ${locationName}: ${response.status}`)
      return null
    }

    const data: GeocodingResult[] = await response.json()
    
    if (data.length === 0) {
      console.warn(`No geocoding results for ${locationName}`)
      return null
    }

    // Beri jeda 1 detik untuk menghormati rate limit Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      lat: parseFloat(String(data[0].lat)),
      lon: parseFloat(String(data[0].lon)),
    }
  } catch (error) {
    console.error(`Geocoding error for ${locationName}:`, error)
    return null
  }
}

export async function geocodeMultipleLocations(
  locations: Array<{ location_name: string }>,
  destination: string
): Promise<Array<{ location_name: string; lat: number; lon: number }>> {
  const results = []
  
  for (const location of locations) {
    const coords = await geocodeLocation(location.location_name, destination)
    if (coords) {
      results.push({
        location_name: location.location_name,
        ...coords
      })
    }
  }
  
  return results
}