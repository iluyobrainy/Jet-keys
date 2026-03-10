import { NextResponse, type NextRequest } from "next/server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { verifyPaystackTransaction } from "@/lib/server/paystack"

async function markBookingPaid(
  adminSupabase: ReturnType<typeof getAdminSupabaseClient>,
  bookingId: string,
  reference: string,
) {
  const primaryResult = await adminSupabase
    .from("bookings")
    .update({
      status: "paid_awaiting_fulfilment",
      payment_status: "paid",
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select(`
      *,
      cars(id, name, brand, model, images, primary_image_url, location)
    `)
    .single()

  // Backward-compatible fallback for older schemas where status was varchar(20).
  if (primaryResult.error?.message?.includes("value too long for type character varying(20)")) {
    return adminSupabase
      .from("bookings")
      .update({
        status: "approved",
        payment_status: "paid",
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select(`
        *,
        cars(id, name, brand, model, images, primary_image_url, location)
      `)
      .single()
  }

  return primaryResult
}

export async function POST(request: NextRequest) {
  const { reference, bookingId } = await request.json()

  if (!reference) {
    return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
  }

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const { data: existingBooking, error: existingBookingError } = await adminSupabase
    .from("bookings")
    .select("id, user_id, total_amount, payment_reference")
    .eq("id", bookingId)
    .single()

  if (existingBookingError || !existingBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (existingBooking.payment_reference && existingBooking.payment_reference !== reference) {
    return NextResponse.json({ error: "Payment reference does not match booking" }, { status: 400 })
  }

  const verification = await verifyPaystackTransaction(reference)

  if (verification.status !== "success") {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  const expectedAmount = Math.round(Number(existingBooking.total_amount) * 100)
  if (Number(verification.amount || 0) !== expectedAmount) {
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
  }

  const metadataBookingId = verification.metadata?.bookingId as string | undefined
  if (metadataBookingId && metadataBookingId !== bookingId) {
    return NextResponse.json({ error: "Payment metadata does not match booking" }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await markBookingPaid(adminSupabase, bookingId, reference)

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message || "Booking not found" }, { status: 500 })
  }

  await adminSupabase.from("payment_transactions").upsert(
    {
      booking_id: booking.id,
      user_id: booking.user_id || null,
      provider: "paystack",
      provider_reference: reference,
      amount: booking.total_amount,
      currency: "NGN",
      status: "paid",
      channel: verification.channel,
      raw_verify_response: verification,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "provider_reference",
      ignoreDuplicates: false,
    },
  )

  return NextResponse.json({ booking, verification })
}
