import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminMode = request.nextUrl.searchParams.get("admin") === "true"
  const adminSupabase = getAdminSupabaseClient()
  let query = adminSupabase
    .from("refund_requests")
    .select(`
      *,
      bookings(id, booking_reference, status, payment_status, customer_name, customer_email, total_amount)
    `)
    .order("created_at", { ascending: false })

  if (!adminMode || !requireRole(context, ["admin", "staff"])) {
    if (!context.profile?.id) {
      return NextResponse.json({ refundRequests: [] })
    }

    query = query.eq("user_id", context.profile.id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ refundRequests: data || [] })
}
