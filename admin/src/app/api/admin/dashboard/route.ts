import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function toNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }
  try {
    const [
      carsResult,
      jetsResult,
      usersResult,
      bookingsResult,
      recentBookingsResult,
      paidTransactionsResult,
      recentTransactionsResult,
    ] = await Promise.all([
      supabaseAdmin.from('cars').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('jets').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('bookings')
        .select('id, status, payment_status, total_amount')
        .neq('status', 'checkout_draft'),
      supabaseAdmin
        .from('bookings')
        .select(`
          id,
          booking_reference,
          customer_name,
          customer_email,
          booking_type,
          pickup_date,
          dropoff_date,
          total_amount,
          status,
          payment_status,
          created_at,
          cars(name, brand, model),
          jets(name, manufacturer, model)
        `)
        .neq('status', 'checkout_draft')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('payment_transactions')
        .select('id, amount, status, channel')
        .eq('status', 'paid'),
      supabaseAdmin
        .from('payment_transactions')
        .select('id, booking_id, provider_reference, amount, status, channel, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const bookings = bookingsResult.data || []
    const paidTransactions = paidTransactionsResult.data || []
    const recentTransactions = recentTransactionsResult.data || []
    const recentBookingIds = recentTransactions.map((item) => item.booking_id).filter(Boolean)

    let bookingReferences = new Map<string, { booking_reference?: string | null; customer_name?: string | null }>()
    if (recentBookingIds.length > 0) {
      const { data: linkedBookings } = await supabaseAdmin
        .from('bookings')
        .select('id, booking_reference, customer_name')
        .in('id', recentBookingIds)

      bookingReferences = new Map(
        (linkedBookings || []).map((booking) => [
          booking.id,
          {
            booking_reference: booking.booking_reference,
            customer_name: booking.customer_name,
          },
        ]),
      )
    }

    const activeBookings = bookings.filter((booking) => booking.status === 'active').length
    const readyBookings = bookings.filter((booking) =>
      booking.status === 'approved' || booking.status === 'paid_awaiting_fulfilment',
    ).length
    const completedBookings = bookings.filter((booking) => booking.status === 'completed').length
    const failedPayments = bookings.filter((booking) => booking.payment_status === 'failed').length
    const totalRevenue = paidTransactions.reduce((sum, item) => sum + toNumber(item.amount), 0)

    return NextResponse.json({
      stats: {
        totalCars: carsResult.count || 0,
        totalJets: jetsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalBookings: bookings.length,
        readyBookings,
        activeBookings,
        completedBookings,
        failedPayments,
        totalRevenue,
        successfulPayments: paidTransactions.length,
      },
      recentBookings: recentBookingsResult.data || [],
      recentPayments: recentTransactions.map((payment) => ({
        ...payment,
        booking: bookingReferences.get(payment.booking_id) || null,
      })),
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
