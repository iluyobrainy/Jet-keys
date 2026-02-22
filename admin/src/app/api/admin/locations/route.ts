import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/locations - Fetch all locations
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }

    // Custom sorting: Lagos first, then others alphabetically
    const sortedData = (data || []).sort((a, b) => {
      // Lagos locations first
      if (a.city === 'Lagos' && b.city !== 'Lagos') return -1
      if (b.city === 'Lagos' && a.city !== 'Lagos') return 1
      
      // Within same city, sort by name
      if (a.city === b.city) {
        return a.name.localeCompare(b.name)
      }
      
      // Other cities alphabetically
      return a.city.localeCompare(b.city)
    })

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error('Error in locations GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/locations - Create new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, city, state, is_active = true } = body

    // Validate required fields
    if (!name || !address || !city || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('locations')
      .insert({
        name,
        address,
        city,
        state,
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating location:', error)
      return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in locations POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
