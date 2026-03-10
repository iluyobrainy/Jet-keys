import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function toNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export async function GET() {
  try {
    const [usersResult, bookingsResult] = await Promise.all([
      supabaseAdmin.from('users').select('id, email, name, phone, role, is_active, created_at, updated_at').order('created_at', { ascending: false }),
      supabaseAdmin.from('bookings').select('id, user_id, payment_status, total_amount, created_at'),
    ])

    const users = usersResult.data || []
    const bookings = bookingsResult.data || []
    const bookingStats = new Map<
      string,
      { booking_count: number; paid_booking_count: number; total_spend: number; last_booking_at: string | null }
    >()

    bookings.forEach((booking) => {
      if (!booking.user_id) {
        return
      }

      const current = bookingStats.get(booking.user_id) || {
        booking_count: 0,
        paid_booking_count: 0,
        total_spend: 0,
        last_booking_at: null,
      }

      current.booking_count += 1
      if (booking.payment_status === 'paid') {
        current.paid_booking_count += 1
        current.total_spend += toNumber(booking.total_amount)
      }

      if (!current.last_booking_at || new Date(booking.created_at) > new Date(current.last_booking_at)) {
        current.last_booking_at = booking.created_at
      }

      bookingStats.set(booking.user_id, current)
    })

    return NextResponse.json(
      users.map((user) => ({
        ...user,
        booking_count: bookingStats.get(user.id)?.booking_count || 0,
        paid_booking_count: bookingStats.get(user.id)?.paid_booking_count || 0,
        total_spend: bookingStats.get(user.id)?.total_spend || 0,
        last_booking_at: bookingStats.get(user.id)?.last_booking_at || null,
      })),
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
