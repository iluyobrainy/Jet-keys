import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const [{ count: totalLateReturns }, { count: pendingNotifications }, { data: lateReturnFees }] = await Promise.all([
      supabaseAdmin.from('bookings').select('id', { count: 'exact' }).gt('late_return_fee', 0),
      supabaseAdmin
        .from('bookings')
        .select('id', { count: 'exact' })
        .gt('late_return_fee', 0)
        .eq('late_return_notification_sent', false),
      supabaseAdmin.from('bookings').select('late_return_fee').gt('late_return_fee', 0),
    ])

    const totalLateReturnFees =
      lateReturnFees?.reduce((sum, booking) => sum + (booking.late_return_fee || 0), 0) || 0
    const averageLateReturnFee = totalLateReturns ? totalLateReturnFees / totalLateReturns : 0

    return NextResponse.json({
      totalLateReturns: totalLateReturns || 0,
      pendingNotifications: pendingNotifications || 0,
      totalLateReturnFees,
      averageLateReturnFee,
    })
  } catch (error) {
    console.error('Error fetching late return stats:', error)
    return NextResponse.json({ error: 'Failed to fetch late return stats' }, { status: 500 })
  }
}
