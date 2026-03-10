import crypto from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { verifyPaystackTransaction } from "@/lib/server/paystack"

async function markBookingPaid(
  adminSupabase: ReturnType<typeof getAdminSupabaseClient>,
  bookingId: string,
  reference: string,
) {
  const primary = await adminSupabase
    .from("bookings")
    .update({
      status: "paid_awaiting_fulfilment",
      payment_status: "paid",
      payment_reference: reference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (primary.error?.message?.includes("value too long for type character varying(20)")) {
    return adminSupabase
      .from("bookings")
      .update({
        status: "approved",
        payment_status: "paid",
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
  }

  return primary
}

export async function POST(request: NextRequest) {
  if (!env.paystackSecretKey) {
    return NextResponse.json({ error: "Paystack is not configured" }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature") || ""
  const expectedSignature = crypto
    .createHmac("sha512", env.paystackSecretKey)
    .update(rawBody)
    .digest("hex")

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference

  if (!reference) {
    return NextResponse.json({ error: "Missing payment reference" }, { status: 400 })
  }

  const verification = await verifyPaystackTransaction(reference)
  const bookingId = verification.metadata?.bookingId as string | undefined

  if (!bookingId) {
    return NextResponse.json({ received: true })
  }

  const adminSupabase = getAdminSupabaseClient()

  await markBookingPaid(adminSupabase, bookingId, reference)

  await adminSupabase.from("payment_transactions").upsert(
    {
      booking_id: bookingId,
      user_id: (verification.metadata?.userId as string | undefined) || null,
      provider: "paystack",
      provider_reference: reference,
      amount: Number(verification.amount) / 100,
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

  return NextResponse.json({ received: true })
}
