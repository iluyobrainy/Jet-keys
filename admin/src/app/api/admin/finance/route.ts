import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function toNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeChannel(channel?: string | null) {
  const value = (channel || '').toLowerCase()

  if (value === 'card') return 'Card'
  if (value === 'bank' || value === 'bank_transfer') return 'Bank Transfer'
  if (value === 'ussd') return 'USSD'
  if (value === 'mobile_money') return 'Mobile Money'
  if (value === 'qr') return 'QR'
  return value ? value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Paystack'
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export async function GET(request: NextRequest) {
  try {
    const days = Math.max(1, Number(request.nextUrl.searchParams.get('days') || 30))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [bookingsResult, paymentsResult] = await Promise.all([
      supabaseAdmin
        .from('bookings')
        .select(`
          id,
          booking_type,
          total_amount,
          payment_status,
          status,
          created_at,
          cars(name, brand, model),
          jets(name, manufacturer, model)
        `)
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('payment_transactions')
        .select('booking_id, amount, status, channel, created_at')
        .gte('created_at', startDate.toISOString()),
    ])

    const bookings = bookingsResult.data || []
    const paidPayments = (paymentsResult.data || []).filter((payment) => payment.status === 'paid')
    const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]))
    const paidBookingRecords = paidPayments
      .map((payment) => ({
        payment,
        booking: bookingsById.get(payment.booking_id),
      }))
      .filter((item) => item.booking)

    const totalRevenue =
      paidPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0) ||
      paidBookingRecords.reduce((sum, item) => sum + toNumber(item.booking?.total_amount), 0)

    const now = new Date()
    const currentMonthRevenue = paidPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0)

    const carRevenue = paidBookingRecords
      .filter((item) => item.booking?.booking_type === 'car')
      .reduce((sum, item) => sum + toNumber(item.payment.amount), 0)

    const jetRevenue = paidBookingRecords
      .filter((item) => item.booking?.booking_type === 'jet')
      .reduce((sum, item) => sum + toNumber(item.payment.amount), 0)

    const vehicleStats = new Map<string, { name: string; revenue: number; bookings: number; type: 'car' | 'jet' }>()
    paidBookingRecords.forEach(({ booking, payment }) => {
      if (!booking) {
        return
      }

      const car = firstRelation(booking.cars)
      const jet = firstRelation(booking.jets)
      const vehicleName =
        booking.booking_type === 'car'
          ? [car?.brand, car?.model].filter(Boolean).join(' ') || car?.name || 'Car booking'
          : [jet?.manufacturer, jet?.model].filter(Boolean).join(' ') || jet?.name || 'Jet booking'
      const key = `${booking.booking_type}:${vehicleName}`
      const current = vehicleStats.get(key) || {
        name: vehicleName,
        revenue: 0,
        bookings: 0,
        type: booking.booking_type,
      }

      current.revenue += toNumber(payment.amount)
      current.bookings += 1
      vehicleStats.set(key, current)
    })

    const monthlyTrends = []
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)

      const monthPayments = paidPayments.filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate >= monthStart && paymentDate < monthEnd
      })

      monthlyTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0),
        bookings: monthPayments.length,
      })
    }

    const paymentMethodStats = new Map<string, { method: string; count: number; amount: number }>()
    paidPayments.forEach((payment) => {
      const method = normalizeChannel(payment.channel)
      const current = paymentMethodStats.get(method) || { method, count: 0, amount: 0 }
      current.count += 1
      current.amount += toNumber(payment.amount)
      paymentMethodStats.set(method, current)
    })

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue: currentMonthRevenue,
      carRevenue,
      jetRevenue,
      totalBookings: bookings.length,
      successfulBookings: Array.from(new Set(paidPayments.map((payment) => payment.booking_id))).length,
      failedBookings: bookings.filter((booking) => booking.payment_status === 'failed' || booking.status === 'cancelled').length,
      averageBookingValue: paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0,
      topPerformingVehicles: Array.from(vehicleStats.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      monthlyTrends,
      paymentMethods: Array.from(paymentMethodStats.values()).sort((a, b) => b.amount - a.amount),
    })
  } catch (error) {
    console.error('Error fetching finance data:', error)
    return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 })
  }
}
