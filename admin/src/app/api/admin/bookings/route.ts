import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const paymentStatus = request.nextUrl.searchParams.get('paymentStatus')
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .neq('status', 'checkout_draft')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const filtered = (data || []).filter((booking) => {
      if (!search) {
        return true
      }

      return [
        booking.booking_reference,
        booking.customer_name,
        booking.customer_email,
        booking.customer_phone,
        booking.pickup_location,
        booking.dropoff_location,
        booking.cars?.name,
        booking.cars?.brand,
        booking.cars?.model,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    })

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
