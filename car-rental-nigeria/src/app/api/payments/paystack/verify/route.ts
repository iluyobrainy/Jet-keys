import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { verifyPaystackTransaction } from "@/lib/server/paystack"

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reference, bookingId } = await request.json()

  if (!reference) {
    return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const verification = await verifyPaystackTransaction(reference)

  if (verification.status !== "success") {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await adminSupabase
    .from("bookings")
    .update({
      status: "paid_awaiting_fulfilment",
      payment_status: "paid",
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", context.profile?.id || "")
    .select(`
      *,
      cars(id, name, brand, model, images, primary_image_url, location)
    `)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message || "Booking not found" }, { status: 500 })
  }

  await adminSupabase.from("payment_transactions").upsert(
    {
      booking_id: booking.id,
      user_id: context.profile?.id || null,
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
