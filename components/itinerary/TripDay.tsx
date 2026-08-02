'use client'

import { TripDay as TripDayType } from '@/types'
import { TripActivity } from './TripActivity'
import { formatDate } from '@/lib/utils'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface TripDayProps {
  day: TripDayType
  dayNumber: number
  isExpanded?: boolean
  onToggle?: () => void
}

export function TripDay({ day, dayNumber, isExpanded = true, onToggle }: TripDayProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  
  const handleToggle = () => {
    setExpanded(!expanded)
    onToggle?.()
  }

  const totalDayCost = day.activities.reduce((sum, activity) => sum + activity.estimated_cost, 0)
  const averageCostPerActivity = day.activities.length > 0 ? totalDayCost / day.activities.length : 0

  return (
    <div className="boarding-pass-card overflow-hidden">
      {/* Day header dengan perforation line */}
      <div className="px-6 py-4">
        <button
          onClick={handleToggle}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-4">
            {/* Day number badge */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-lg font-fraunces font-semibold text-primary">
                {dayNumber}
              </span>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-fraunces font-semibold text-foreground">
                Hari {dayNumber}
              </h3>
              {day.date && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-ibm-plex-mono">
                    {formatDate(day.date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Toggle and summary */}
          <div className="flex items-center gap-4">
            {/* Cost summary */}
            <div className="text-right hidden md:block">
              <div className="text-sm font-space-grotesk font-semibold text-foreground">
                {day.activities.length} aktivitas
              </div>
              <div className="text-xs text-muted-foreground font-ibm-plex-mono">
                Total: Rp {totalDayCost.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Toggle icon */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${expanded ? 'bg-primary/10' : 'bg-muted'}
              group-hover:bg-primary/20 transition-colors
            `}>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-primary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Perforation line */}
      <div className="perforation-line mx-6" />

      {/* Activities (expandable) */}
      {expanded && (
        <div className="px-6 py-4">
          {/* Day stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-card border border-border rounded-tm-sm">
              <div className="text-xs text-muted-foreground font-space-grotesk mb-1">
                Total Aktivitas
              </div>
              <div className="text-lg font-fraunces font-semibold text-foreground">
                {day.activities.length}
              </div>
            </div>
            <div className="p-3 bg-card border border-border rounded-tm-sm">
              <div className="text-xs text-muted-foreground font-space-grotesk mb-1">
                Estimasi Budget
              </div>
              <div className="text-lg font-fraunces font-semibold text-foreground">
                Rp {totalDayCost.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 bg-card border border-border rounded-tm-sm">
              <div className="text-xs text-muted-foreground font-space-grotesk mb-1">
                Rata-rata per Aktivitas
              </div>
              <div className="text-lg font-fraunces font-semibold text-foreground">
                Rp {averageCostPerActivity.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Activities timeline */}
          <div className="relative">
            {/* Main timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

            {/* Activities */}
            <div className="space-y-1">
              {day.activities.map((activity, index) => (
                <TripActivity
                  key={activity.id || index}
                  activity={activity}
                  index={index}
                  totalActivities={day.activities.length}
                  dayBudget={totalDayCost / day.activities.length}
                />
              ))}
            </div>
          </div>

          {/* Empty state jika tidak ada aktivitas */}
          {day.activities.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">📅</div>
              <p className="text-sm text-muted-foreground font-space-grotesk">
                Belum ada aktivitas yang dijadwalkan untuk hari ini
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom perforation line jika expanded */}
      {expanded && <div className="perforation-line mx-6 mt-2" />}
    </div>
  )
}