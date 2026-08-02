'use client'

import { Trip } from '@/types'
import { TripDay } from './TripDay'
import { formatCurrency, formatDate } from '@/lib/utils'
import { WeatherBadge } from '@/components/map/WeatherBadge'
import { Plane, MapPin, Calendar, Download, Share2, Edit } from 'lucide-react'
import { useState } from 'react'

interface ItineraryCardProps {
  trip: Trip
  onSave?: () => void
  onShare?: () => void
  onEdit?: () => void
  className?: string
}

export function ItineraryCard({ 
  trip, 
  onSave, 
  onShare, 
  onEdit,
  className = '' 
}: ItineraryCardProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]) // Expand hari pertama by default

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev =>
      prev.includes(dayNumber)
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const firstCoords = trip.days
    ?.flatMap(d => d.activities)
    ?.find(a => a.latitude && a.longitude)

  const totalCost = trip.days?.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.estimated_cost, 0),
    0
  ) || 0

  const totalActivities = trip.days?.reduce(
    (sum, day) => sum + day.activities.length,
    0
  ) || 0

  return (
    <div className={`boarding-pass-card animate-card-unfold ${className}`}>
      {/* Header dengan boarding pass styling */}
      <div className="px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Left: Destination info & Weather */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-fraunces font-semibold text-foreground">
                    {trip.destination.toUpperCase()}
                  </h2>
                  {firstCoords?.latitude && firstCoords?.longitude && (
                    <WeatherBadge lat={firstCoords.latitude} lon={firstCoords.longitude} />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{trip.days?.length || 0} Hari</span>
                  </div>
                  {trip.start_date && trip.end_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats dan actions */}
          <div className="flex flex-col gap-3">
            {/* Stats badges */}
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-tm-sm text-sm font-space-grotesk font-medium">
                {totalActivities} Aktivitas
              </div>
              <div className="px-3 py-1.5 bg-tm-success-600/10 text-tm-success-600 rounded-tm-sm text-sm font-space-grotesk font-medium">
                {trip.status === 'final' ? 'Final' : 'Draft'}
              </div>
              <div className="px-3 py-1.5 bg-tm-stamp-600/10 text-tm-stamp-600 rounded-tm-sm text-sm font-space-grotesk font-medium">
                {formatCurrency(totalCost)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-space-grotesk font-semibold rounded-tm-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Simpan
              </button>
              <button
                onClick={onShare}
                className="px-4 py-2 bg-muted text-foreground text-sm font-space-grotesk font-semibold rounded-tm-sm hover:bg-muted/80 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-muted text-foreground text-sm font-space-grotesk font-semibold rounded-tm-sm hover:bg-muted/80 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* First perforation line */}
        <div className="perforation-line my-4" />

        {/* Quick summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-card border border-border rounded-tm-sm">
            <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Hari</div>
            <div className="text-xl font-fraunces font-semibold text-foreground">{trip.days?.length || 0}</div>
          </div>
          <div className="text-center p-3 bg-card border border-border rounded-tm-sm">
            <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Aktivitas</div>
            <div className="text-xl font-fraunces font-semibold text-foreground">{totalActivities}</div>
          </div>
          <div className="text-center p-3 bg-card border border-border rounded-tm-sm">
            <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Lokasi</div>
            <div className="text-xl font-fraunces font-semibold text-foreground">
              {trip.days?.flatMap(day => day.activities).length || 0}
            </div>
          </div>
          <div className="text-center p-3 bg-card border border-border rounded-tm-sm">
            <div className="text-xs text-muted-foreground font-space-grotesk mb-1">Total Budget</div>
            <div className="text-xl font-fraunces font-semibold text-foreground">
              {formatCurrency(totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Days section */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-fraunces font-semibold text-foreground mb-4">
          Rincian Per Hari
        </h3>

        {/* Days list */}
        <div className="space-y-4">
          {trip.days?.map((day, index) => (
            <TripDay
              key={day.id || index}
              day={day}
              dayNumber={index + 1}
              isExpanded={expandedDays.includes(index + 1)}
              onToggle={() => toggleDay(index + 1)}
            />
          ))}

          {/* Empty state jika tidak ada days */}
          {(!trip.days || trip.days.length === 0) && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-lg font-fraunces font-semibold text-foreground mb-2">
                Belum ada itinerary
              </h4>
              <p className="text-sm text-muted-foreground font-space-grotesk max-w-md mx-auto">
                Mulai chat dengan TravelMate untuk membuat itinerary perjalanan Anda
              </p>
            </div>
          )}
        </div>

        {/* Footer dengan total budget */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-fraunces font-semibold text-foreground mb-1">
                Ringkasan Budget
              </h4>
              <p className="text-sm text-muted-foreground font-space-grotesk">
                Estimasi total biaya perjalanan
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-fraunces font-semibold text-primary">
                {formatCurrency(totalCost)}
              </div>
              <p className="text-xs text-muted-foreground font-space-grotesk mt-1">
                *Estimasi dapat berubah
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom perforation line */}
      <div className="perforation-line mx-6 mb-4" />

      {/* Footer notes */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-space-grotesk">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Generated by TravelMate AI</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tm-stamp-600" />
            <span>Estimasi budget dapat berubah</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tm-success-600" />
            <span>Status: {trip.status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}