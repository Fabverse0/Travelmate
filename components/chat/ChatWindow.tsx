'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatBubble } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { ItineraryCard } from '@/components/itinerary/ItineraryCard'
import nextDynamic from 'next/dynamic'
import { ChatMessage, Trip } from '@/types'
import { Plane } from 'lucide-react'

const TripMap = nextDynamic(() => import('@/components/map/TripMap').then(mod => mod.TripMap), {
  ssr: false,
})

interface ChatWindowProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  isStreaming?: boolean
  className?: string
}

function convertItineraryToTrip(itinerary: NonNullable<ChatMessage['itinerary']>): Trip {
  return {
    id: itinerary.trip_id,
    user_id: '',
    title: `Perjalanan ke ${itinerary.destination}`,
    destination: itinerary.destination,
    total_budget: itinerary.total_budget_estimate,
    start_date: null,
    end_date: null,
    status: 'draft',
    created_at: new Date().toISOString(),
    days: itinerary.days.map(day => ({
      id: `day-${day.day_number}`,
      trip_id: itinerary.trip_id,
      day_number: day.day_number,
      date: null,
      activities: day.activities.map((act, idx) => ({
        id: `act-${day.day_number}-${idx}`,
        trip_day_id: `day-${day.day_number}`,
        sequence: idx + 1,
        time: act.time,
        location_name: act.location_name,
        activity_description: act.activity_description,
        estimated_cost: act.estimated_cost,
        latitude: act.latitude || null,
        longitude: act.longitude || null,
        created_at: new Date().toISOString()
      }))
    }))
  }
}

export function ChatWindow({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  isStreaming = false,
  className = '' 
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Auto-scroll ke bottom ketika ada pesan baru
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAtBottom])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsAtBottom(isBottom)
  }

  // Welcome message jika belum ada chat
  const showWelcome = messages.length === 0

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header dengan boarding pass styling */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-fraunces font-semibold text-foreground">
                TravelMate Chat
              </h1>
              <p className="text-xs text-muted-foreground font-space-grotesk">
                AI Travel Assistant • Siap membantu merencanakan perjalanan Anda
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent animate-pulse' : 'bg-success-600'}`} />
            <span className="text-xs font-ibm-plex-mono text-muted-foreground">
              {isLoading ? 'Processing...' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {/* Welcome message */}
          {showWelcome && (
            <div className="text-center py-8 fade-in-up">
              <div className="inline-block p-6 bg-card border border-border rounded-tm-md mb-4">
                <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-fraunces font-semibold text-foreground mb-2">
                  Selamat datang di TravelMate! ✈️
                </h2>
                <p className="text-sm text-muted-foreground font-space-grotesk max-w-md mx-auto mb-4">
                  Saya adalah asisten AI yang akan membantu Anda merencanakan perjalanan.
                  Mulai dengan menanyakan tentang destinasi, durasi, dan budget perjalanan Anda.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => onSendMessage("Saya mau liburan ke Bali untuk 3 hari dengan budget 5 juta")}
                    className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-tm-sm hover:bg-primary/20 transition-colors font-space-grotesk"
                  >
                    🏝️ Contoh: Bali 3 hari
                  </button>
                  <button
                    onClick={() => onSendMessage("Rencanakan liburan keluarga ke Jogja selama 4 hari")}
                    className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-tm-sm hover:bg-primary/20 transition-colors font-space-grotesk"
                  >
                    👨‍👩‍👧‍👦 Contoh: Keluarga ke Jogja
                  </button>
                  <button
                    onClick={() => onSendMessage("Saya ingin honeymoon romantis dengan budget 10 juta")}
                    className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-tm-sm hover:bg-primary/20 transition-colors font-space-grotesk"
                  >
                    💑 Contoh: Honeymoon romantis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((message, index) => {
            const tripData = message.trip || (message.itinerary ? convertItineraryToTrip(message.itinerary) : null)
            return (
              <div key={message.id || index} className="space-y-4">
                <ChatBubble
                  role={message.role}
                  content={message.content}
                  timestamp={message.created_at ? new Date(message.created_at) : undefined}
                  isTyping={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                  isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                />

                {/* Render Itinerary Card & Map jika ada itinerary ter-generate */}
                {tripData && (
                  <div className="space-y-4 mt-2 ml-0 md:ml-8 animate-card-unfold">
                    <ItineraryCard trip={tripData} />
                    <TripMap trip={tripData} height="350px" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading indicator untuk AI response */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <ChatBubble
              role="assistant"
              content=""
              isTyping={true}
            />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder="Tanyakan tentang destinasi, durasi, budget perjalanan Anda..."
      />
    </div>
  )
}