import { NextRequest, NextResponse } from "next/server"
import { requireAdminContext, unauthorizedAdminResponse } from "@/lib/admin-auth-server"
import { supabaseAdmin } from "@/lib/supabase"

const allowedStatuses = new Set(["approved", "processed", "rejected"])

function normalizeBooking(booking: unknown) {
  if (Array.isArray(booking)) {
    return booking[0] ?? null
  }

  return booking ?? null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireAdminContext(request)

  if (!context) {
    return unauthorizedAdminResponse()
  }

  try {
    const { id } = await params
    const body = await request.json()
    const status = String(body?.status || "")
    const adminNotes = String(body?.adminNotes || "").trim()
    const refundReference = String(body?.refundReference || "").trim()
    const now = new Date().toISOString()

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Unsupported cancellation action" }, { status: 400 })
    }

    const { data: refundRequest, error: refundRequestError } = await supabaseAdmin
      .from("refund_requests")
      .select(`
        *,
        bookings(
          id,
          status,
          payment_status
        )
      `)
      .eq("id", id)
      .single()

    if (refundRequestError || !refundRequest) {
      return NextResponse.json(
        { error: refundRequestError?.message || "Cancellation request not found" },
        { status: 404 },
      )
    }

    const booking = normalizeBooking(refundRequest.bookings) as
      | { id: string; status: string; payment_status: string | null }
      | null

    if (!booking) {
      return NextResponse.json({ error: "Booking record not found for this request" }, { status: 404 })
    }

    const { data: updatedRefundRequest, error: updateRefundError } = await supabaseAdmin
      .from("refund_requests")
      .update({
        status,
        admin_notes: adminNotes || null,
        processed_by_user_id: context.profile?.id || null,
        processed_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (updateRefundError || !updatedRefundRequest) {
      return NextResponse.json(
        { error: updateRefundError?.message || "Failed to update cancellation request" },
        { status: 500 },
      )
    }

    const bookingPatch: Record<string, unknown> = {
      updated_at: now,
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
      bookingPatch.refund_processed_date = now

      if (refundReference) {
        bookingPatch.refund_reference = refundReference
      }
    }

    if (status === "rejected") {
      bookingPatch.refund_status = "rejected"

      if (refundRequest.request_type === "cancellation" && booking.status === "cancel_requested") {
        bookingPatch.status = "approved"
        bookingPatch.payment_status = booking.payment_status === "refund_pending" ? "paid" : booking.payment_status
      }
    }

    const { data: updatedBooking, error: updateBookingError } = await supabaseAdmin
      .from("bookings")
      .update(bookingPatch)
      .eq("id", booking.id)
      .select(`
        id,
        booking_reference,
        status,
        payment_status,
        customer_name,
        customer_email,
        customer_phone,
        pickup_location,
        dropoff_location,
        pickup_date,
        dropoff_date,
        total_amount,
        refund_amount,
        refund_status,
        cancellation_reason,
        cancellation_date,
        bank_name,
        account_name,
        account_number,
        refund_processed_by,
        refund_processed_date,
        refund_reference,
        cars(id, name, brand, model, primary_image_url, location)
      `)
      .single()

    if (updateBookingError || !updatedBooking) {
      return NextResponse.json(
        { error: updateBookingError?.message || "Failed to update booking record" },
        { status: 500 },
      )
    }

    const responsePayload = {
      ...updatedRefundRequest,
      booking: normalizeBooking(updatedBooking),
      processed_by_user: context.profile
        ? {
            id: context.profile.id,
            name: context.profile.name,
            email: context.profile.email,
          }
        : null,
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error("Error processing cancellation request:", error)
    return NextResponse.json({ error: "Failed to update cancellation request" }, { status: 500 })
  }
}
