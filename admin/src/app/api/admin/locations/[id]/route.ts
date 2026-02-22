import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/admin/locations/[id] - Update location
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, address, city, state, is_active } = body

    // Validate required fields
    if (!name || !address || !city || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('locations')
      .update({
        name,
        address,
        city,
        state,
        is_active
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating location:', error)
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in location PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/locations/[id] - Delete location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if location is being used by any cars
    const { data: carsUsingLocation, error: carsError } = await supabaseAdmin
      .from('cars')
      .select('id, name')
      .eq('pickup_location', id)

    if (carsError) {
      console.error('Error checking cars using location:', carsError)
      return NextResponse.json({ error: 'Failed to check location usage' }, { status: 500 })
    }

    if (carsUsingLocation && carsUsingLocation.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete location. It is being used by ${carsUsingLocation.length} car(s): ${carsUsingLocation.map(c => c.name).join(', ')}` 
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting location:', error)
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error in location DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


