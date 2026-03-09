import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { status, adminNotes } = body
  const adminSupabase = getAdminSupabaseClient()

  const { data: refundRequest, error: refundRequestError } = await adminSupabase
    .from("refund_requests")
    .update({
      status,
      admin_notes: adminNotes || null,
      processed_by_user_id: context.profile?.id || null,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (refundRequestError || !refundRequest) {
    return NextResponse.json({ error: refundRequestError?.message || "Refund request not found" }, { status: 500 })
  }

  const bookingPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (status === "approved") {
    bookingPatch.status = "cancelled"
    bookingPatch.refund_status = "approved"
    bookingPatch.payment_status = "refund_pending"
  }

  if (status === "processed") {
    bookingPatch.status = "cancelled"
    bookingPatch.refund_status = "processed"
    bookingPatch.payment_status = "refunded"
    bookingPatch.refund_processed_by = context.profile?.name || context.user.email || "Admin"
    bookingPatch.refund_processed_date = new Date().toISOString()
  }

  if (status === "rejected") {
    bookingPatch.refund_status = "rejected"
  }

  const { data: booking } = await adminSupabase
    .from("bookings")
    .update(bookingPatch)
    .eq("id", refundRequest.booking_id)
    .select(`
      *,
      cars(id, name, brand, model, images, primary_image_url, location)
    `)
    .single()

  return NextResponse.json({ refundRequest, booking })
}
