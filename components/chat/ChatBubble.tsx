'use client'

import { ChatRole } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useEffect, useState } from 'react'

interface ChatBubbleProps {
  role: ChatRole
  content: string
  timestamp?: Date
  isTyping?: boolean
  isStreaming?: boolean
}

export function ChatBubble({ 
  role, 
  content, 
  timestamp, 
  isTyping = false,
  isStreaming = false 
}: ChatBubbleProps) {
  const [displayText, setDisplayText] = useState('')
  const [streamingIndex, setStreamingIndex] = useState(0)

  // Streaming text effect untuk AI responses
  useEffect(() => {
    if (isStreaming && role === 'assistant') {
      const interval = setInterval(() => {
        if (streamingIndex < content.length) {
          setDisplayText(content.substring(0, streamingIndex + 1))
          setStreamingIndex(prev => prev + 1)
        } else {
          clearInterval(interval)
        }
      }, 20) // 20ms per karakter untuk natural typing speed
      
      return () => clearInterval(interval)
    } else {
      setDisplayText(content)
      setStreamingIndex(content.length)
    }
  }, [content, isStreaming, role, streamingIndex])

  const isAI = role === 'assistant'
  const bubbleClass = isAI ? 'chat-bubble-ai' : 'chat-bubble-user'
  const alignClass = isAI ? 'items-start' : 'items-end'
  
  return (
    <div className={`flex flex-col ${alignClass} gap-1 fade-in-up`}>
      {/* Label kecil untuk AI messages */}
      {isAI && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-space-grotesk font-medium text-muted-foreground">
            TravelMate
          </span>
        </div>
      )}
      
      {/* Bubble container */}
      <div className="flex gap-3 max-w-full">
        {isAI && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
            <span className="text-xs font-space-grotesk font-semibold text-primary">TM</span>
          </div>
        )}
        
        <div className={`${bubbleClass} px-4 py-3 shadow-sm relative ${isTyping ? 'min-h-[60px]' : ''}`}>
          {isTyping ? (
            <div className="flex items-center gap-2 py-2">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
              <span className="text-sm text-muted-foreground font-space-grotesk ml-2">
                TravelMate sedang mengetik...
              </span>
            </div>
          ) : (
            <>
              <p className={`text-sm leading-relaxed ${isAI ? 'text-foreground' : 'text-[hsl(var(--chat-bubble-user-text))]'}`}>
                {displayText}
                {isStreaming && streamingIndex < content.length && (
                  <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse-subtle" />
                )}
              </p>
              
              {/* Timestamp */}
              {timestamp && (
                <div className={`mt-2 text-xs ${isAI ? 'text-muted-foreground' : 'text-[hsl(var(--chat-bubble-user-text)/0.7)]'}`}>
                  {format(timestamp, 'HH:mm', { locale: id })}
                </div>
              )}
            </>
          )}
        </div>
        
        {!isAI && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1">
            <span className="text-xs font-space-grotesk font-semibold text-primary-foreground">S</span>
          </div>
        )}
      </div>
    </div>
  )
}