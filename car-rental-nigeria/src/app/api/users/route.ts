import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const { data: users, error } = await adminSupabase.from("users").select("*").order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userIds = (users || []).map((user) => user.id)
  const { data: bookings } = userIds.length
    ? await adminSupabase
        .from("bookings")
        .select("id, user_id, status, payment_status")
        .in("user_id", userIds)
    : { data: [], error: null }

  const rows = (users || []).map((user) => {
    const userBookings = (bookings || []).filter((booking) => booking.user_id === user.id)

    return {
      ...user,
      bookingCount: userBookings.length,
      activeBookings: userBookings.filter((booking) => booking.status === "active").length,
      paidBookings: userBookings.filter((booking) => booking.payment_status === "paid").length,
    }
  })

  return NextResponse.json({ users: rows })
}
