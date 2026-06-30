import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { generateQuoteReference } from "@/lib/rental/controlled-pricing"
import { validateRentalWindow } from "@/lib/server/booking-utils"

export const dynamic = "force-dynamic"

const quoteSelect = `
  *,
  cars(id, name, brand, model, images, primary_image_url),
  service_states!quote_requests_service_state_id_fkey(id, name, code),
  origin_state:service_states!quote_requests_origin_state_id_fkey(id, name, code),
  destination_state:service_states!quote_requests_destination_state_id_fkey(id, name, code)
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
  const supabase = getAdminSupabaseClient()
  let query = supabase.from("quote_requests").select(quoteSelect).order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  if (!(adminMode && requireRole(context, ["admin", "staff"]))) {
    query = query.eq("user_id", context.profile?.id || "")
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ quoteRequests: data || [] })
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Sign in is required before requesting a quote." }, { status: 401 })
  }

  const body = await request.json()
  const {
    carId,
    rentalMode,
    serviceStateId,
    originStateId,
    destinationStateId,
    timingPackage,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    pickupAddress,
    dropoffAddress,
    areaOfUse,
    tripType,
    customerName,
    customerEmail,
    customerPhone,
    specialRequests,
  } = body

  if (!carId || !rentalMode || !pickupDate || !dropoffDate || !pickupAddress || !dropoffAddress) {
    return NextResponse.json({ error: "Missing quote request details" }, { status: 400 })
  }

  const supabase = getAdminSupabaseClient()
  const { data: settings } = await supabase.from("checkout_settings").select("*").single()
  const pickupDateTime = combineDateAndTime(pickupDate, pickupTime)
  const dropoffDateTime = combineDateAndTime(dropoffDate, dropoffTime)
  const validation = validateRentalWindow(pickupDateTime, dropoffDateTime, settings)

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 })
  }

  const payload = {
    quote_reference: generateQuoteReference(),
    user_id: context.profile?.id || null,
    car_id: carId,
    rental_mode: rentalMode,
    service_state_id: serviceStateId || null,
    origin_state_id: originStateId || null,
    destination_state_id: destinationStateId || null,
    timing_package: timingPackage || null,
    pickup_date: pickupDateTime,
    dropoff_date: dropoffDateTime,
    pickup_time: pickupTime || null,
    dropoff_time: dropoffTime || null,
    pickup_address: pickupAddress,
    dropoff_address: dropoffAddress,
    area_of_use: areaOfUse || null,
    trip_type: tripType || null,
    customer_name: customerName || context.profile?.name || context.user.user_metadata?.full_name || "Jet & Keys Customer",
    customer_email: customerEmail || context.user.email || "",
    customer_phone: customerPhone || context.profile?.phone || context.user.phone || "",
    special_requests: specialRequests || null,
    status: "new",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("quote_requests").insert(payload).select(quoteSelect).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ quoteRequest: data })
}
