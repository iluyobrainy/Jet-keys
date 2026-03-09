import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { canUserCancelBooking, canUserRequestRefund } from "@/lib/server/booking-utils"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const { data: booking } = await adminSupabase.from("bookings").select("*").eq("id", id).single()

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const isAdmin = requireRole(context, ["admin", "staff"])
  const isOwner = Boolean(context.profile?.id && booking.user_id === context.profile.id)

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const reason = body.reason || "Customer cancellation request"
  const bankName = body.bankName || null
  const accountName = body.accountName || null
  const accountNumber = body.accountNumber || null

  if (!canUserCancelBooking(booking) && !canUserRequestRefund(booking) && !isAdmin) {
    return NextResponse.json({ error: "This booking can no longer be cancelled directly" }, { status: 400 })
  }

  const requestType = canUserCancelBooking(booking) ? "cancellation" : "refund_review"
  const refundRequestPayload = {
    booking_id: booking.id,
    user_id: context.profile?.id || null,
    request_type: requestType,
    reason,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    amount_requested: booking.refund_amount || booking.total_amount,
    status: "pending",
  }

  const refundRequestResult = await adminSupabase
    .from("refund_requests")
    .insert(refundRequestPayload)
    .select("*")
    .single()

  if (refundRequestResult.error && !refundRequestResult.error.message.includes("schema cache")) {
    return NextResponse.json({ error: refundRequestResult.error.message }, { status: 500 })
  }

  const bookingPatch: Record<string, unknown> = {
    cancellation_reason: reason,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    updated_at: new Date().toISOString(),
  }

  if (requestType === "cancellation") {
    bookingPatch.status = "cancel_requested"
    bookingPatch.payment_status = "refund_pending"
    bookingPatch.cancellation_date = new Date().toISOString()
  } else {
    bookingPatch.refund_status = "pending_review"
  }

  const { data: updatedBooking, error } = await adminSupabase
    .from("bookings")
    .update(bookingPatch)
    .eq("id", id)
    .select(`
      *,
      cars(id, name, brand, model, images, primary_image_url, location)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    booking: updatedBooking,
    refundRequest: refundRequestResult.data || null,
  })
}
