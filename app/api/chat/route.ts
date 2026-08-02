import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { gemini } from '@/lib/gemini/client'
import { createSystemInstruction } from '@/lib/gemini/prompts'
import { geocodeMultipleLocations } from '@/lib/geocoding'
import { ChatAPIResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message, trip_id } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', prefError)
    }

    // Get recent chat history (last 10 messages)
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(10)

    if (historyError) {
      console.error('Error fetching chat history:', historyError)
    }

    // Save user message
    const { data: userMessage, error: saveUserError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message,
        trip_id: trip_id || null,
      })
      .select()
      .single()

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError)
    }

    // Create system instruction based on preferences
    const systemInstruction = createSystemInstruction(
      preferences?.traveler_type || 'umum',
      preferences?.language_style || 'santai',
      preferences?.food_pref
    )

    // Format messages for Gemini
    const messagesForGemini = [
      ...(chatHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Check if ready for itinerary generation
    const isReadyForItinerary = await gemini.checkIfReadyForItinerary(
      messagesForGemini,
      systemInstruction
    )

    let itinerary = null
    let newTripId = null

    if (isReadyForItinerary) {
      // Generate itinerary dengan konteks lengkap dari riwayat percakapan
      const historyContextText = messagesForGemini
        .map(m => `${m.role === 'user' ? 'Pengguna' : 'TravelMate'}: ${m.content}`)
        .join('\n')
      const itineraryContext = `Riwayat Percakapan LENGKAP:\n${historyContextText}\n\nBerdasarkan riwayat percakapan di atas, buatlah itinerary terstruktur dalam JSON valid yang sesuai dengan destinasi, durasi, budget, dan preferensi pengguna.`
      
      try {
        const itineraryData = await gemini.generateItinerary(
          itineraryContext,
          systemInstruction
        )

        // Geocode locations
        const allLocations = itineraryData.days.flatMap((day: any) => 
          day.activities.map((activity: any) => ({ location_name: activity.location_name }))
        )
        
        const geocodedLocations = await geocodeMultipleLocations(
          allLocations,
          itineraryData.destination
        )

        // Create location map for quick lookup
        const locationMap = new Map(
          geocodedLocations.map(loc => [loc.location_name, loc])
        )

        // Create trip in database
        const serviceClient = createServiceClient()
        
        const { data: trip, error: tripError } = await serviceClient
          .from('trips')
          .insert({
            user_id: user.id,
            title: `Perjalanan ke ${itineraryData.destination}`,
            destination: itineraryData.destination,
            total_budget: itineraryData.total_budget_estimate,
            status: 'draft',
          })
          .select()
          .single()

        if (tripError) {
          throw new Error(`Failed to create trip: ${tripError.message}`)
        }

        newTripId = trip.id

        // Create trip days and activities
        for (const dayData of itineraryData.days) {
          const { data: tripDay, error: dayError } = await serviceClient
            .from('trip_days')
            .insert({
              trip_id: trip.id,
              day_number: dayData.day_number,
            })
            .select()
            .single()

          if (dayError) {
            console.error('Error creating trip day:', dayError)
            continue
          }

          // Create activities for this day
          for (const activityData of dayData.activities) {
            const geocoded = locationMap.get(activityData.location_name)
            
            await serviceClient
              .from('trip_activities')
              .insert({
                trip_day_id: tripDay.id,
                sequence: dayData.activities.indexOf(activityData) + 1,
                time: activityData.time,
                location_name: activityData.location_name,
                activity_description: activityData.activity_description,
                estimated_cost: activityData.estimated_cost,
                latitude: geocoded?.lat || null,
                longitude: geocoded?.lon || null,
              })
          }
        }

        // Prepare itinerary response
        itinerary = {
          trip_id: trip.id,
          destination: itineraryData.destination,
          days: itineraryData.days.map((day: any) => ({
            day_number: day.day_number,
            activities: day.activities.map((activity: any) => {
              const geocoded = locationMap.get(activity.location_name)
              return {
                time: activity.time,
                location_name: activity.location_name,
                activity_description: activity.activity_description,
                estimated_cost: activity.estimated_cost,
                latitude: geocoded?.lat,
                longitude: geocoded?.lon,
              }
            }),
          })),
          total_budget_estimate: itineraryData.total_budget_estimate,
        }

      } catch (itineraryError) {
        console.error('Itinerary generation error:', itineraryError)
        // Continue with regular chat response even if itinerary fails
      }
    }

    // Generate regular chat response
    const aiResponse = await gemini.generateChatResponse(
      messagesForGemini,
      systemInstruction
    )

    // Save assistant response
    await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'assistant',
        content: aiResponse,
        trip_id: newTripId || trip_id || null,
      })

    // Prepare response
    const response: ChatAPIResponse = {
      reply: aiResponse,
      itinerary,
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Chat API error:', error)
    const isQuotaError = error.message?.includes('429') || error.message?.includes('quota') || error.status === 429
    const errorMessage = isQuotaError
      ? 'Kuota Gemini API Key saat ini telah habis / mencapai batas harian (Rate Limit 429). Silakan perbarui GEMINI_API_KEY di file .env dengan API key gratis yang baru dari https://aistudio.google.com/app/apikey'
      : (error.message || 'Terjadi kesalahan pada AI Chat')

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: isQuotaError ? 429 : 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get user session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get recent chat messages
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }

  return NextResponse.json({ messages })
}