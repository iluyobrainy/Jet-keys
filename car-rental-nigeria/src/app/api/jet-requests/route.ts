import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const WHATSAPP_NUMBER = "2349075103413"

function normalizeText(value: unknown) {
  return String(value || "").trim()
}

function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `JET-${date}-${suffix}`
}

function buildWhatsAppMessage(payload: {
  reference: string
  customerName: string
  customerPhone: string
  jetName: string
  departureLocation: string
  destination: string
  departureDate: string
  departureTime?: string | null
  returnDate?: string | null
  returnTime?: string | null
  passengers: number
  tripType: string
  specialRequests?: string | null
}) {
  const lines = [
    "Hello Jet & Keys, I just submitted a private jet charter request.",
    "",
    `Request ID: ${payload.reference}`,
    `Name: ${payload.customerName}`,
    `Phone: ${payload.customerPhone}`,
    `Jet: ${payload.jetName}`,
    `Route: ${payload.departureLocation} to ${payload.destination}`,
    `Departure: ${payload.departureDate}${payload.departureTime ? ` at ${payload.departureTime}` : ""}`,
    payload.returnDate ? `Return: ${payload.returnDate}${payload.returnTime ? ` at ${payload.returnTime}` : ""}` : "Return: Not specified",
    `Passengers: ${payload.passengers}`,
    `Trip type: ${payload.tripType.replace(/_/g, " ")}`,
  ]

  if (payload.specialRequests) {
    lines.push(`Special requests: ${payload.specialRequests}`)
  }

  return lines.join("\n")
}

export async function POST(request: NextRequest) {
  const adminSupabase = getAdminSupabaseClient()
  const context = await getAuthContext(request)
  const body = await request.json()

  const jetId = normalizeText(body.jetId) || null
  const customerName = normalizeText(body.customerName)
  const customerEmail = normalizeText(body.customerEmail).toLowerCase()
  const customerPhone = normalizeText(body.customerPhone)
  const departureLocation = normalizeText(body.departureLocation)
  const destination = normalizeText(body.destination)
  const departureDate = normalizeText(body.departureDate)
  const departureTime = normalizeText(body.departureTime) || null
  const returnDate = normalizeText(body.returnDate) || null
  const returnTime = normalizeText(body.returnTime) || null
  const passengers = Number(body.passengers || 1)
  const tripType = normalizeText(body.tripType) || "one_way"
  const specialRequests = normalizeText(body.specialRequests) || null

  const missingFields = [
    ["customerName", customerName],
    ["customerEmail", customerEmail],
    ["customerPhone", customerPhone],
    ["departureLocation", departureLocation],
    ["destination", destination],
    ["departureDate", departureDate],
  ].filter(([, value]) => !value)

  if (missingFields.length) {
    return NextResponse.json({ error: "Please complete all required charter details." }, { status: 400 })
  }

  if (!customerEmail.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  if (!Number.isFinite(passengers) || passengers < 1) {
    return NextResponse.json({ error: "Passenger count must be at least 1." }, { status: 400 })
  }

  if (!["one_way", "round_trip", "multi_city"].includes(tripType)) {
    return NextResponse.json({ error: "Invalid trip type." }, { status: 400 })
  }

  let jetName = "Concierge selected aircraft"

  if (jetId) {
    const { data: jet, error: jetError } = await adminSupabase
      .from("jets")
      .select("id, name, manufacturer, model, is_available, status")
      .eq("id", jetId)
      .maybeSingle()

    if (jetError) {
      return NextResponse.json({ error: jetError.message }, { status: 500 })
    }

    if (!jet || jet.status !== "active" || !jet.is_available) {
      return NextResponse.json({ error: "This jet is not currently available for public charter requests." }, { status: 404 })
    }

    jetName = [jet.manufacturer, jet.model].filter(Boolean).join(" ") || jet.name
  }

  const requestReference = generateReference()

  const { data: jetRequest, error } = await adminSupabase
    .from("jet_requests")
    .insert({
      request_reference: requestReference,
      user_id: context?.profile?.id || null,
      jet_id: jetId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      departure_location: departureLocation,
      destination,
      departure_date: departureDate,
      departure_time: departureTime,
      return_date: returnDate,
      return_time: returnTime,
      passengers,
      trip_type: tripType,
      special_requests: specialRequests,
      status: "new",
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const whatsappMessage = buildWhatsAppMessage({
    reference: requestReference,
    customerName,
    customerPhone,
    jetName,
    departureLocation,
    destination,
    departureDate,
    departureTime,
    returnDate,
    returnTime,
    passengers,
    tripType,
    specialRequests,
  })

  return NextResponse.json({
    jetRequest,
    whatsappMessage,
    whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`,
  }, { status: 201 })
}