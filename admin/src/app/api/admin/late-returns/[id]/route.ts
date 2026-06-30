import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const bookingSelect = `
  *,
  cars(name, brand, model, images),
  jets(name, manufacturer, model, images)
`

async function updateBooking(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(bookingSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const payload = await request.json()
    const { action } = payload as { action?: string }

    if (action === 'record-dropoff') {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('dropoff_date')
        .eq('id', params.id)
        .single()

      if (bookingError) {
        throw bookingError
      }

      const { data: checkoutSettings } = await supabaseAdmin
        .from('checkout_settings')
        .select('late_return_fee')
        .single()

      const lateFeePerDay = checkoutSettings?.late_return_fee || 25000
      const scheduled = new Date(booking.dropoff_date)
      const actual = new Date(payload.actualDropoffDate)
      const hoursLate = Math.max(0, (actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60))
      const daysLate = Math.ceil(hoursLate / 24)
      const fee = hoursLate > 0 ? Math.max(daysLate, 1) * lateFeePerDay : 0

      const updatedBooking = await updateBooking(params.id, {
        actual_dropoff_date: payload.actualDropoffDate,
        actual_dropoff_time: payload.actualDropoffTime || null,
        late_return_fee: fee,
        late_return_hours: hoursLate,
        late_return_reason: payload.reason || null,
        late_return_notification_sent: fee > 0 ? false : true,
      })

      return NextResponse.json(updatedBooking)
    }

    if (action === 'process-fee') {
      const updates: Record<string, unknown> = {
        late_return_processed_date: new Date().toISOString(),
        late_return_processed_by: payload.processedBy,
      }

      if (payload.processedAmount !== undefined) {
        updates.late_return_fee = payload.processedAmount
      }

      const updatedBooking = await updateBooking(params.id, updates)
      return NextResponse.json(updatedBooking)
    }

    if (action === 'mark-notification-sent') {
      const updatedBooking = await updateBooking(params.id, {
        late_return_notification_sent: true,
        late_return_notification_date: new Date().toISOString(),
      })

      return NextResponse.json(updatedBooking)
    }

    return NextResponse.json({ error: 'Unsupported late return action' }, { status: 400 })
  } catch (error) {
    console.error(`Error updating late return booking ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update late return booking' }, { status: 500 })
  }
}
