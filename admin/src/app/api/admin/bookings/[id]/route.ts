import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }
  try {
    const body = await request.json()
    const { data: currentBooking, error: currentBookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (currentBookingError || !currentBooking) {
      return NextResponse.json({ error: currentBookingError?.message || 'Booking not found' }, { status: 404 })
    }

    if (body?.status && body.status !== currentBooking.status) {
      const nextStatus = String(body.status)
      const currentStatus = String(currentBooking.status)
      const validTransition =
        (["approved", "paid_awaiting_fulfilment"].includes(currentStatus) && nextStatus === 'active') ||
        (currentStatus === 'active' && nextStatus === 'returned') ||
        (currentStatus === 'returned' && nextStatus === 'completed')

      if (!validTransition) {
        return NextResponse.json({ error: 'This booking cannot move to that state' }, { status: 400 })
      }
    }

    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updates)
      .eq('id', params.id)
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
