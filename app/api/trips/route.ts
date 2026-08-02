import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get trips for the user
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trips' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trips })
    
  } catch (error: any) {
    console.error('Trips API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tripData = await request.json()
    
    // Validate required fields
    if (!tripData.title || !tripData.destination) {
      return NextResponse.json(
        { error: 'Title and destination are required' },
        { status: 400 }
      )
    }

    // Create trip
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title: tripData.title,
        destination: tripData.destination,
        total_budget: tripData.total_budget || null,
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        status: tripData.status || 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return NextResponse.json(
        { error: 'Failed to create trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trip }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create trip error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}