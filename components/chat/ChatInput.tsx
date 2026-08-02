'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Ketik pesan Anda..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="sticky bottom-0 bg-background border-t border-border pt-4 pb-6 px-4"
    >
      <div className="flex gap-3 max-w-3xl mx-auto">
        {/* Input field dengan boarding pass styling */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/20 to-transparent opacity-30 rounded-tm-pill pointer-events-none" />
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-6 py-4 bg-card border border-input rounded-tm-pill text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-space-grotesk shadow-sm"
            style={{ 
              boxShadow: '0 1px 3px hsl(var(--foreground) / 0.1)',
            }}
          />
          
          {/* Dekorasi garis-garis seperti boarding pass */}
          <div className="absolute left-4 right-4 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Send button dengan UI/UX Pro Max hover effects */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 px-6 bg-primary text-primary-foreground font-space-grotesk font-semibold rounded-tm-pill hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group relative overflow-hidden"
        >
          {/* Hover effect background */}
          <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          
          <span className="relative">Kirim</span>
          <Send className="w-4 h-4 relative" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 group-active:opacity-0 transition-opacity duration-300 rounded-tm-pill" />
        </button>
      </div>

      {/* Helper text */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground font-space-grotesk">
          Tekan <span className="font-ibm-plex-mono bg-muted px-2 py-0.5 rounded">Enter</span> untuk mengirim
        </p>
      </div>
    </form>
  )
}