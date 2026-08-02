import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tripId = params.id

    // Get trip with all related data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching trip:', tripError)
      return NextResponse.json(
        { error: 'Failed to fetch trip' },
        { status: 500 }
      )
    }

    // Get trip days
    const { data: tripDays, error: daysError } = await supabase
      .from('trip_days')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })

    if (daysError) {
      console.error('Error fetching trip days:', daysError)
      return NextResponse.json(
        { error: 'Failed to fetch trip days' },
        { status: 500 }
      )
    }

    // Get activities for each day
    const tripWithDetails = {
      ...trip,
      days: await Promise.all(
        tripDays.map(async (day) => {
          const { data: activities, error: activitiesError } = await supabase
            .from('trip_activities')
            .select('*')
            .eq('trip_day_id', day.id)
            .order('sequence', { ascending: true })

          if (activitiesError) {
            console.error('Error fetching activities:', activitiesError)
            return { ...day, activities: [] }
          }

          return { ...day, activities }
        })
      ),
    }

    return NextResponse.json({ trip: tripWithDetails })
    
  } catch (error: any) {
    console.error('Trip detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tripId = params.id
    const updateData = await request.json()

    // Check if trip exists and belongs to user
    const { data: existingTrip, error: checkError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (checkError) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      )
    }

    // Update trip
    const { data: updatedTrip, error: updateError } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating trip:', updateError)
      return NextResponse.json(
        { error: 'Failed to update trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trip: updatedTrip })
    
  } catch (error: any) {
    console.error('Update trip error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tripId = params.id

    // Check if trip exists and belongs to user
    const { data: existingTrip, error: checkError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single()

    if (checkError) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      )
    }

    // Delete trip (cascade will handle trip_days and trip_activities)
    const { error: deleteError } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting trip:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete trip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Delete trip error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}