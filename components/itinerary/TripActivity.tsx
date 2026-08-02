'use client'

import { TripActivity as TripActivityType } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface TripActivityProps {
  activity: TripActivityType
  index: number
  totalActivities: number
  dayBudget?: number
}

export function TripActivity({ 
  activity, 
  index, 
  totalActivities,
  dayBudget 
}: TripActivityProps) {
  const isOverBudget = dayBudget && activity.estimated_cost > dayBudget * 0.4 // Jika >40% dari budget harian
  const hasLocation = activity.latitude && activity.longitude

  return (
    <div className={`flex gap-4 group ${index < totalActivities - 1 ? 'pb-6' : 'pb-4'}`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center relative">
        {/* Timeline dot */}
        <div className="w-4 h-4 rounded-full bg-primary border-2 border-background z-10 group-hover:scale-110 transition-transform" />
        
        {/* Timeline line (vertical) */}
        {index < totalActivities - 1 && (
          <div className="absolute top-4 bottom-0 w-0.5 bg-border group-hover:bg-primary/50 transition-colors" />
        )}
      </div>

      {/* Activity content */}
      <div className="flex-1">
        {/* Time and location header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-ibm-plex-mono text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded-tm-sm">
              {activity.time || '--:--'}
            </span>
            
            {hasLocation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Koordinat tersedia</span>
              </div>
            )}
          </div>

          {/* Cost badge */}
          <div className={`
            px-2 py-1 rounded-tm-sm text-xs font-ibm-plex-mono font-medium
            ${isOverBudget 
              ? 'bg-tm-stamp-100 text-tm-stamp-600 border border-tm-stamp-600/20' 
              : 'bg-primary/10 text-primary'
            }
          `}>
            {formatCurrency(activity.estimated_cost)}
          </div>
        </div>

        {/* Location name */}
        <h4 className="text-base font-space-grotesk font-semibold text-foreground mb-1">
          {activity.location_name}
        </h4>

        {/* Activity description */}
        {activity.activity_description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {activity.activity_description}
          </p>
        )}

        {/* Budget warning jika melebihi threshold */}
        {isOverBudget && dayBudget && (
          <div className="mt-2 p-2 bg-tm-stamp-100/50 border border-tm-stamp-600/20 rounded-tm-sm">
            <p className="text-xs text-tm-stamp-600 font-space-grotesk">
              ⚠️ Aktivitas ini menggunakan {Math.round((activity.estimated_cost / dayBudget) * 100)}% dari budget harian
            </p>
          </div>
        )}

        {/* Hover effect border */}
        <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-tm-sm transition-colors pointer-events-none" />
      </div>
    </div>
  )
}