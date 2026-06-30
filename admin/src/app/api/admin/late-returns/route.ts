import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const bookingSelect = `
  *,
  cars(name, brand, model, images),
  jets(name, manufacturer, model, images)
`

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(bookingSelect)
      .gt('late_return_fee', 0)
      .order('actual_dropoff_date', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching late return bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch late return bookings' }, { status: 500 })
  }
}
