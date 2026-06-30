import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { calculateControlledPricing, type RentalMode, type TimingPackage } from "@/lib/rental/controlled-pricing"
import { generateBookingReference, validateRentalWindow } from "@/lib/server/booking-utils"

const bookingSelect = `
  *,
  cars(id, name, brand, model, images, primary_image_url, location)
`

function combineDateAndTime(dateValue: string, timeValue?: string | null) {
  const date = new Date(dateValue)

  if (timeValue) {
    const [hours, minutes] = timeValue.split(":").map(Number)
    date.setHours(hours || 0, minutes || 0, 0, 0)
  }

  return date.toISOString()
}

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
  const supabase = getAdminSupabaseClient()
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
    rentalMode,
    serviceStateId,
    originStateId,
    destinationStateId,
    zoneId,
    areaId,
    timingPackage,
    pickupAddress,
    dropoffAddress,
    areaOfUse,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    specialRequests,
  } = body

  if (!carId || !pickupDate || !dropoffDate) {
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 })
  }

  const pickupDateTime = combineDateAndTime(pickupDate, pickupTime)
  const dropoffDateTime = combineDateAndTime(dropoffDate, dropoffTime)
  const { data: settings } = await adminSupabase.from("checkout_settings").select("*").single()
  const validation = validateRentalWindow(pickupDateTime, dropoffDateTime, settings)

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 })
  }

  const normalizedMode = (rentalMode || "within_state") as RentalMode
  const normalizedTiming = (timingPackage || "24h") as TimingPackage
  const autoPricingStateId = normalizedMode === "within_state" ? serviceStateId : originStateId

  let rateQuery = autoPricingStateId
    ? adminSupabase
        .from("car_pricing_rates")
        .select("*")
        .eq("car_id", carId)
        .eq("state_id", autoPricingStateId)
        .eq("timing_package", normalizedTiming)
        .eq("is_active", true)
    : null

  if (rateQuery) {
    rateQuery = zoneId ? rateQuery.eq("zone_id", zoneId) : rateQuery.is("zone_id", null)
  }

  const [stateResult, zoneResult, areaResult, rateResult] = await Promise.all([
    autoPricingStateId
      ? adminSupabase.from("service_states").select("*").eq("id", autoPricingStateId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    zoneId
      ? adminSupabase.from("service_zones").select("*").eq("id", zoneId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    areaId
      ? adminSupabase.from("service_areas").select("*").eq("id", areaId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    rateQuery ? rateQuery.maybeSingle() : Promise.resolve({ data: null, error: null }),
  ])

  const pricing = calculateControlledPricing(
    {
      carId,
      rentalMode: normalizedMode,
      serviceStateId,
      originStateId,
      destinationStateId,
      zoneId,
      areaId,
      timingPackage: normalizedTiming,
      pickupDate: pickupDateTime,
      dropoffDate: dropoffDateTime,
    },
    {
      checkoutSettings: settings,
      state: stateResult.data,
      zone: zoneResult.data,
      area: areaResult.data,
      rate: rateResult.data,
    },
  )

  if (!pricing.canAutoPrice) {
    return NextResponse.json(
      { error: pricing.reason || "This trip requires a quote before payment." },
      { status: 400 },
    )
  }

  const resolvedPickupLocation =
    pickupLocation ||
    [stateResult.data?.name, zoneResult.data?.name, areaResult.data?.name].filter(Boolean).join(" / ") ||
    pickupAddress ||
    "Controlled pickup"
  const resolvedDropoffLocation =
    dropoffLocation ||
    [stateResult.data?.name, zoneResult.data?.name, areaResult.data?.name].filter(Boolean).join(" / ") ||
    dropoffAddress ||
    "Controlled dropoff"

  const bookingPayload = {
    booking_reference: generateBookingReference(),
    user_id: context.profile?.id || null,
    car_id: carId,
    booking_type: "car",
    pickup_date: pickupDateTime,
    dropoff_date: dropoffDateTime,
    pickup_time: pickupTime || null,
    dropoff_time: dropoffTime || null,
    pickup_location: resolvedPickupLocation,
    dropoff_location: resolvedDropoffLocation,
    total_amount: Number(pricing.grandTotal),
    delivery_fee: Number(pricing.deliveryFee || 0),
    vat_amount: Number(pricing.vatAmount || 0),
    service_fee: Number(pricing.serviceFee || 0),
    rental_mode: normalizedMode,
    service_state_id: serviceStateId || null,
    origin_state_id: originStateId || null,
    destination_state_id: destinationStateId || null,
    service_zone_id: zoneId || null,
    service_area_id: areaId || null,
    pickup_address: pickupAddress || null,
    dropoff_address: dropoffAddress || null,
    area_of_use: areaOfUse || null,
    timing_package: normalizedTiming,
    billable_units: pricing.billableUnits,
    location_surcharge: Number(pricing.locationSurcharge || 0),
    pricing_breakdown: pricing,
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
