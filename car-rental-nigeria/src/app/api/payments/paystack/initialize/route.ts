import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext } from "@/lib/auth-server"
import { env } from "@/lib/env"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { initializePaystackTransaction, PaystackApiError } from "@/lib/server/paystack"

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!env.paystackSecretKey) {
    return NextResponse.json(
      { error: "Paystack is not configured. Set PAYSTACK_SECRET_KEY to continue." },
      { status: 500 },
    )
  }

  const { bookingId } = await request.json()
  const adminSupabase = getAdminSupabaseClient()
  const { data: booking, error } = await adminSupabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", context.profile?.id || "")
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: "Booking draft not found" }, { status: 404 })
  }

  const reference = booking.payment_reference || `PAY-${booking.booking_reference || booking.id}`
  const callbackBase = request.nextUrl.origin || env.appUrl

  try {
    const paymentData = await initializePaystackTransaction({
      email: booking.customer_email,
      amount: Math.round(Number(booking.total_amount) * 100),
      reference,
      callback_url: `${callbackBase}/booking-complete?bookingId=${booking.id}&reference=${reference}`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        bookingType: booking.booking_type,
        userId: context.profile?.id,
      },
    })

    await adminSupabase
      .from("bookings")
      .update({
        status: "payment_pending",
        payment_status: "pending_verification",
        payment_reference: paymentData.reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)

    await adminSupabase.from("payment_transactions").upsert(
      {
        booking_id: booking.id,
        user_id: context.profile?.id || null,
        provider: "paystack",
        provider_reference: paymentData.reference,
        amount: booking.total_amount,
        currency: "NGN",
        status: "pending_verification",
        access_code: paymentData.access_code,
        authorization_url: paymentData.authorization_url,
        raw_initialize_response: paymentData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "provider_reference",
        ignoreDuplicates: false,
      },
    )

    return NextResponse.json({
      authorizationUrl: paymentData.authorization_url,
      accessCode: paymentData.access_code,
      reference: paymentData.reference,
    })
  } catch (error) {
    if (error instanceof PaystackApiError) {
      console.error("Paystack initialize error:", {
        message: error.message,
        status: error.status,
        code: error.code,
        bookingId: booking.id,
      })

      if (error.code === "disabled_merchant") {
        return NextResponse.json(
          {
            error:
              "Paystack account is inactive. Reactivate the Paystack business account or replace the API keys, then try again.",
          },
          { status: 503 },
        )
      }

      return NextResponse.json(
        {
          error: `Payment initialization failed: ${error.message}`,
        },
        { status: 502 },
      )
    }

    console.error("Unexpected Paystack initialize failure:", error)
    return NextResponse.json(
      { error: "Payment initialization failed due to an unexpected error. Please try again." },
      { status: 500 },
    )
  }
}
