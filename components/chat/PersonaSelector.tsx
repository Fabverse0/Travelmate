'use client'

import { useState } from 'react'
import { ChevronDown, Backpack, Users, Heart, Utensils, User } from 'lucide-react'
import { TravelerType } from '@/types'
import { cn } from '@/lib/utils'

interface PersonaSelectorProps {
  value: TravelerType
  onChange: (persona: TravelerType) => void
  className?: string
}

const PERSONA_OPTIONS: Array<{
  value: TravelerType
  label: string
  icon: React.ReactNode
  description: string
}> = [
  {
    value: 'backpacker',
    label: 'Backpacker',
    icon: <Backpack className="w-4 h-4" />,
    description: 'Hemat • Petualang • Transportasi umum',
  },
  {
    value: 'family',
    label: 'Keluarga',
    icon: <Users className="w-4 h-4" />,
    description: 'Ramah anak • Aman • Nyaman',
  },
  {
    value: 'honeymoon',
    label: 'Honeymoon',
    icon: <Heart className="w-4 h-4" />,
    description: 'Romantis • Privasi • Mewah',
  },
  {
    value: 'kuliner',
    label: 'Kuliner',
    icon: <Utensils className="w-4 h-4" />,
    description: 'Makanan lokal • Otentik • Food trip',
  },
  {
    value: 'umum',
    label: 'Umum',
    icon: <User className="w-4 h-4" />,
    description: 'Seimbang • Fleksibel • Standard',
  },
]

export function PersonaSelector({ value, onChange, className }: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedPersona = PERSONA_OPTIONS.find(opt => opt.value === value) || PERSONA_OPTIONS[4]

  return (
    <div className={cn('relative', className)}>
      {/* Main button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 bg-card border rounded-tm-pill',
          'hover:border-primary/50 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          isOpen ? 'border-primary' : 'border-border'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="text-primary">
            {selectedPersona.icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-space-grotesk font-semibold text-foreground">
              {selectedPersona.label}
            </div>
            <div className="text-xs text-muted-foreground font-space-grotesk truncate max-w-[120px]">
              {selectedPersona.description}
            </div>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-card border border-border rounded-tm-md shadow-lg overflow-hidden animate-card-unfold">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-card">
              <h3 className="text-sm font-space-grotesk font-semibold text-foreground">
                Pilih Tipe Traveler
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Pilih persona untuk rekomendasi yang lebih personal
              </p>
            </div>

            {/* Options */}
            <div className="py-2">
              {PERSONA_OPTIONS.map((persona) => (
                <button
                  key={persona.value}
                  type="button"
                  onClick={() => {
                    onChange(persona.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3',
                    'hover:bg-muted transition-colors duration-150',
                    'focus:outline-none focus:bg-muted',
                    value === persona.value && 'bg-primary/5 border-l-2 border-primary'
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      value === persona.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {persona.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm font-space-grotesk',
                        value === persona.value ? 'font-semibold text-foreground' : 'text-foreground'
                      )}>
                        {persona.label}
                      </span>
                      {value === persona.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {persona.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Persona mempengaruhi rekomendasi destinasi, aktivitas, dan budget.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}