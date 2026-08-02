'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Trip } from '@/types'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Guard untuk window / SSR
const createCustomIcon = (color: string = '#B8452F') => {
  if (typeof window === 'undefined') return undefined as any

  // Fix untuk default marker icons di Leaflet
  if (L?.Icon?.Default?.prototype) {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
      iconUrl: '/leaflet/images/marker-icon.png',
      shadowUrl: '/leaflet/images/marker-shadow.png',
    })
  }

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

interface TripMapProps {
  trip: Trip
  className?: string
  height?: string
}

export function TripMap({ trip, className = '', height = '400px' }: TripMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Collect all activities with coordinates
  const activitiesWithCoords = trip.days?.flatMap(day =>
    day.activities
      .filter(activity => activity.latitude && activity.longitude)
      .map(activity => ({
        ...activity,
        dayNumber: day.day_number,
      }))
  ) || []

  // Calculate center of map
  const center: [number, number] = activitiesWithCoords.length > 0
    ? [
        activitiesWithCoords.reduce((sum, a) => sum + (a.latitude || 0), 0) / activitiesWithCoords.length,
        activitiesWithCoords.reduce((sum, a) => sum + (a.longitude || 0), 0) / activitiesWithCoords.length,
      ]
    : [-6.2088, 106.8456] // Default: Jakarta

  // Create polyline untuk rute
  const routeCoordinates: [number, number][] = activitiesWithCoords
    .filter(a => a.latitude && a.longitude)
    .map(a => [a.latitude!, a.longitude!])

  if (!isClient) {
    return (
      <div 
        className={`bg-card border border-border rounded-tm-md ${className}`}
        style={{ height }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-sm text-muted-foreground font-space-grotesk">
              Loading map...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border border-border rounded-tm-md overflow-hidden ${className}`}>
      {/* Map header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-fraunces font-semibold text-foreground">
              Peta Perjalanan
            </h3>
            <p className="text-sm text-muted-foreground font-space-grotesk">
              {trip.destination} • {activitiesWithCoords.length} lokasi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-tm-stamp-600" />
              <span>Lokasi aktivitas</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-4 h-0.5 bg-primary" />
              <span>Rute perjalanan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div style={{ height }} className="vintage-map-filter">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-map"
        >
          {/* OpenStreetMap tiles dengan vintage filter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Markers untuk setiap lokasi */}
          {activitiesWithCoords.map((activity, index) => (
            <Marker
              key={`${activity.id}-${index}`}
              position={[activity.latitude!, activity.longitude!]}
              icon={createCustomIcon(index === 0 ? '#1D5C7A' : '#B8452F')}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-space-grotesk font-semibold text-foreground">
                      {activity.location_name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {activity.activity_description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-ibm-plex-mono">
                        Day {activity.dayNumber}
                      </span>
                      <span className="font-ibm-plex-mono text-primary font-semibold">
                        {activity.time}
                      </span>
                    </div>
                    {activity.estimated_cost > 0 && (
                      <div className="text-xs font-ibm-plex-mono text-tm-stamp-600 mt-1">
                        Rp {activity.estimated_cost.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Polyline untuk rute */}
          {routeCoordinates.length > 1 && (
            <Polyline
              pathOptions={{
                color: '#1D5C7A',
                weight: 3,
                opacity: 0.6,
                dashArray: '5, 5',
              }}
              positions={routeCoordinates}
            />
          )}
        </MapContainer>
      </div>

      {/* Map footer */}
      <div className="px-6 py-3 border-t border-border bg-card/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-space-grotesk">
          <div>
            Data peta dari <span className="font-semibold">OpenStreetMap</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: {activitiesWithCoords.length > 0 ? '12x' : 'Default'}</span>
            <span>{center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* CSS untuk vintage map filter */}
      <style jsx global>{`
        .leaflet-map {
          filter: sepia(0.08) saturate(0.85);
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }
        .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-top: none;
          border-left: none;
        }
      `}</style>
    </div>
  )
}