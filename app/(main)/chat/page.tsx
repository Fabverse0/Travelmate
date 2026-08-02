'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { PersonaSelector } from '@/components/chat/PersonaSelector'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage, TravelerType, UserPreferences } from '@/types'
import { Settings, LogOut, History } from 'lucide-react'
import Link from 'next/link'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [activeTripId, setActiveTripId] = useState<string | null>(null)

  const supabase = createClient()

  // Load user preferences and chat history
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferences) {
        setUserPreferences(preferences)
      }

      // Load recent messages
      const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (chatMessages) {
        setMessages(chatMessages)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    setIsStreaming(true)

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: '', // Will be filled by server
        role: 'user',
        content: message,
        trip_id: activeTripId,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMessage])

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          trip_id: activeTripId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`)
      }

      // Add assistant response with itinerary attached if generated
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: '',
        role: 'assistant',
        content: data.reply,
        trip_id: data.itinerary?.trip_id || activeTripId,
        created_at: new Date().toISOString(),
        itinerary: data.itinerary || null,
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update active trip if itinerary was generated
      if (data.itinerary) {
        setActiveTripId(data.itinerary.trip_id)
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        user_id: '',
        role: 'assistant',
        content: error.message || 'Maaf, terjadi kesalahan pada layanan AI. Silakan coba lagi.',
        trip_id: null,
        created_at: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsStreaming(false), 1000) // Keep streaming effect for 1s
    }
  }

  const handlePersonaChange = async (persona: TravelerType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update preferences
      const { data: updatedPrefs } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          traveler_type: persona,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single()

      if (updatedPrefs) {
        setUserPreferences(updatedPrefs)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/chat" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <div className="w-6 h-6 bg-primary rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-fraunces font-semibold text-foreground">
                  TravelMate
                </h1>
                <p className="text-xs text-muted-foreground font-space-grotesk">
                  AI Travel Assistant
                </p>
              </div>
            </Link>

            {/* Active trip indicator */}
            {activeTripId && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-tm-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-space-grotesk font-medium text-primary">
                  Menyusun itinerary...
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Persona Selector */}
            <PersonaSelector
              value={userPreferences?.traveler_type || 'umum'}
              onChange={handlePersonaChange}
            />

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/trips"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
                title="Riwayat Perjalanan"
              >
                <History className="w-5 h-5" />
              </Link>
              
              <Link
                href="/settings"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-tm-sm transition-colors"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5" />
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-tm-sm transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-space-grotesk">
            <span className="font-ibm-plex-mono">v1.0</span> • Powered by Gemini AI
          </div>
          <div className="text-xs text-muted-foreground font-space-grotesk">
            Destinasi dalam Indonesia • Estimasi budget bisa berubah
          </div>
        </div>
      </footer>
    </div>
  )
}