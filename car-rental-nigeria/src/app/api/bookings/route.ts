import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { generateBookingReference, validateRentalWindow } from "@/lib/server/booking-utils"

const bookingSelect = `
  *,
  cars(id, name, brand, model, images, primary_image_url, location)
`

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminMode = request.nextUrl.searchParams.get("admin") === "true"
  const status = request.nextUrl.searchParams.get("status")
  const paymentStatus = request.nextUrl.searchParams.get("paymentStatus")
  const search = request.nextUrl.searchParams.get("search")?.toLowerCase()
  const canUseAdminQueue = adminMode && requireRole(context, ["admin", "staff"])
  const supabase = canUseAdminQueue ? getAdminSupabaseClient() : createServerSupabaseClient()
  let query = supabase.from("bookings").select(bookingSelect).order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus)
  }

  if (!canUseAdminQueue) {
    if (!context.profile?.id) {
      return NextResponse.json({ bookings: [] })
    }

    query = query.eq("user_id", context.profile.id)
  } else if (!status) {
    query = query.not("status", "in", "(checkout_draft,payment_pending)")
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bookings = (data || []).filter((booking) => {
    if (!search) {
      return true
    }

    return [
      booking.booking_reference,
      booking.customer_name,
      booking.customer_email,
      booking.customer_phone,
      booking.cars?.name,
      booking.cars?.brand,
      booking.cars?.model,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search))
  })

  return NextResponse.json({ bookings })
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const body = await request.json()
  const {
    bookingId,
    carId,
    pickupDate,
    dropoffDate,
    pickupLocation,
    dropoffLocation,
    pickupTime,
    dropoffTime,
    totalAmount,
    deliveryFee,
    vatAmount,
    serviceFee,
    customerName,
    customerEmail,
    customerPhone,
    specialRequests,
  } = body

  if (!carId || !pickupDate || !dropoffDate || !pickupLocation || !dropoffLocation) {
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 })
  }

  const { data: settings } = await adminSupabase.from("checkout_settings").select("*").single()
  const validation = validateRentalWindow(pickupDate, dropoffDate, settings)

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 })
  }

  const bookingPayload = {
    booking_reference: generateBookingReference(),
    user_id: context.profile?.id || null,
    car_id: carId,
    booking_type: "car",
    pickup_date: pickupDate,
    dropoff_date: dropoffDate,
    pickup_time: pickupTime || null,
    dropoff_time: dropoffTime || null,
    pickup_location: pickupLocation,
    dropoff_location: dropoffLocation,
    total_amount: Number(totalAmount),
    delivery_fee: Number(deliveryFee || 0),
    vat_amount: Number(vatAmount || 0),
    service_fee: Number(serviceFee || 0),
    customer_name: customerName || context.profile?.name || context.user.user_metadata?.full_name || "Jet & Keys Customer",
    customer_email: customerEmail || context.user.email || "",
    customer_phone: customerPhone || context.profile?.phone || context.user.phone || "",
    special_requests: specialRequests || null,
    status: "checkout_draft" as const,
    payment_status: "unpaid" as const,
    updated_at: new Date().toISOString(),
  }

  if (bookingId) {
    const { data: existingBooking } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", context.profile?.id || "")
      .maybeSingle()

    if (existingBooking) {
      const { data: updatedBooking, error: updateError } = await adminSupabase
        .from("bookings")
        .update(bookingPayload)
        .eq("id", bookingId)
        .select(bookingSelect)
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ booking: updatedBooking })
    }
  }

  const { data: booking, error } = await adminSupabase
    .from("bookings")
    .insert(bookingPayload)
    .select(bookingSelect)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking })
}
