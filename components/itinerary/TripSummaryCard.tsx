'use client'

import { Trip } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plane, Calendar, MapPin, ChevronRight, Users, Heart, Backpack, Utensils, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TripSummaryCardProps {
  trip: Trip
  className?: string
}

const TRAVELER_TYPE_ICONS = {
  backpacker: Backpack,
  family: Users,
  honeymoon: Heart,
  kuliner: Utensils,
  umum: User,
}

export function TripSummaryCard({ trip, className }: TripSummaryCardProps) {
  const TravelerIcon = TRAVELER_TYPE_ICONS[trip.status as keyof typeof TRAVELER_TYPE_ICONS] || User
  
  const totalActivities = trip.days?.reduce(
    (sum, day) => sum + day.activities.length,
    0
  ) || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'final': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className={cn(
        'group cursor-pointer bg-card border border-border rounded-tm-md p-5',
        'hover:border-primary hover:shadow-sm transition-all duration-200',
        className
      )}>
        <div className="flex items-start justify-between mb-4">
          {/* Left side: Trip info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-fraunces font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {trip.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{trip.destination}</span>
                  </div>
                  {trip.start_date && trip.end_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(trip.start_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 mt-3">
              {trip.days && trip.days.length > 0 && (
                <div className="px-2 py-1 bg-muted rounded-tm-sm text-xs font-space-grotesk">
                  {trip.days.length} hari
                </div>
              )}
              {totalActivities > 0 && (
                <div className="px-2 py-1 bg-muted rounded-tm-sm text-xs font-space-grotesk">
                  {totalActivities} aktivitas
                </div>
              )}
              {trip.total_budget && (
                <div className="px-2 py-1 bg-primary/10 text-primary rounded-tm-sm text-xs font-space-grotesk font-medium">
                  {formatCurrency(trip.total_budget)}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Status and actions */}
          <div className="flex flex-col items-end gap-3">
            {/* Status badge */}
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-space-grotesk font-semibold capitalize',
              getStatusColor(trip.status)
            )}>
              {trip.status}
            </div>

            {/* View button */}
            <div className="flex items-center gap-1 text-sm text-primary font-space-grotesk font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Lihat detail</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer with traveler type and date */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <TravelerIcon className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-space-grotesk capitalize">
              {trip.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground font-ibm-plex-mono">
            {new Date(trip.created_at).toLocaleDateString('id-ID')}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-tm-md transition-opacity pointer-events-none" />
      </div>
    </Link>
  )
}