import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { getCarPrimaryImage, pickDailyCars } from "@/lib/server/car-utils"
import type { Database } from "@/lib/database.types"

type CarRow = Database["public"]["Tables"]["cars"]["Row"]
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"]

async function getCarLocationsMap(carIds: string[]) {
  const supabase = createServerSupabaseClient()
  const map = new Map<string, string[]>()

  if (!carIds.length) {
    return map
  }

  const { data, error } = await supabase
    .from("car_locations")
    .select("car_id, location_id, locations(name, city)")
    .in("car_id", carIds)

  if (error || !data) {
    return map
  }

  data.forEach((item) => {
    const entry = Array.isArray(item.locations) ? item.locations[0] : item.locations
    if (!entry) {
      return
    }

    const label = `${entry.name}, ${entry.city}`
    const existing = map.get(item.car_id) || []
    map.set(item.car_id, [...existing, label])
  })

  return map
}

function buildSearchPayload(car: CarRow, allowedLocations: string[]) {
  return {
    ...car,
    primaryImage: getCarPrimaryImage(car),
    allowedLocations,
  }
}

function overlapsBooking(existing: BookingRow, pickupDate: string, dropoffDate: string) {
  const blockedStatuses = new Set([
    "payment_pending",
    "paid_awaiting_fulfilment",
    "active",
    "returned",
    "pending",
    "approved",
  ])

  if (!blockedStatuses.has(existing.status)) {
    return false
  }

  const existingStart = new Date(existing.pickup_date).getTime()
  const existingEnd = new Date(existing.dropoff_date).getTime()
  const requestStart = new Date(pickupDate).getTime()
  const requestEnd = new Date(dropoffDate).getTime()

  return existingStart < requestEnd && existingEnd > requestStart
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const adminMode = searchParams.get("admin") === "true"
  const context = adminMode ? await getAuthContext(request, { requireAdmin: true }) : null
  const supabase = createServerSupabaseClient()
  const pickupLocation = searchParams.get("pickupLocation")
  const dropoffLocation = searchParams.get("dropoffLocation")
  const pickupDate = searchParams.get("pickupDate")
  const dropoffDate = searchParams.get("dropoffDate")
  const bodyType = searchParams.get("bodyType")
  const fuelType = searchParams.get("fuelType")
  const transmission = searchParams.get("transmission")
  const seats = searchParams.get("seats")
  const minPrice = Number(searchParams.get("minPrice") || 0)
  const maxPrice = Number(searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER)
  const popularOnly = searchParams.get("popular") === "true"
  const search = searchParams.get("search")?.toLowerCase()

  if (adminMode && !requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase.from("cars").select("*").order("created_at", { ascending: false })

  if (!adminMode) {
    query = query.eq("is_available", true).eq("status", "active")
  }

  if (bodyType) {
    query = query.eq("body_type", bodyType)
  }

  if (fuelType) {
    query = query.eq("fuel_type", fuelType)
  }

  if (transmission) {
    query = query.eq("transmission", transmission)
  }

  if (seats) {
    query = query.gte("seats", Number(seats))
  }

  const { data: cars, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const carIds = cars.map((car) => car.id)
  const allowedLocationsMap = await getCarLocationsMap(carIds)

  let filteredCars = cars.filter((car) => car.price_per_day >= minPrice && car.price_per_day <= maxPrice)

  if (search) {
    filteredCars = filteredCars.filter((car) =>
      [car.name, car.brand, car.model, car.location, car.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    )
  }

  if (!adminMode && (pickupLocation || dropoffLocation)) {
    filteredCars = filteredCars.filter((car) => {
      const allowedLocations = allowedLocationsMap.get(car.id) || [car.location]
      const matchesPickup = pickupLocation ? allowedLocations.includes(pickupLocation) : true
      const matchesDropoff = dropoffLocation ? allowedLocations.includes(dropoffLocation) : true
      return matchesPickup && matchesDropoff
    })
  }

  if (!adminMode && pickupDate && dropoffDate) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .in("car_id", filteredCars.map((car) => car.id))

    if (bookings?.length) {
      filteredCars = filteredCars.filter((car) => {
        const carBookings = bookings.filter((booking) => booking.car_id === car.id)
        return !carBookings.some((booking) => overlapsBooking(booking, pickupDate, dropoffDate))
      })
    }
  }

  const selectedCars = popularOnly ? pickDailyCars(filteredCars, 2) : filteredCars
  const filters = {
    bodyTypes: [...new Set(filteredCars.map((car) => car.body_type).filter(Boolean))],
    fuelTypes: [...new Set(filteredCars.map((car) => car.fuel_type).filter(Boolean))],
    transmissions: [...new Set(filteredCars.map((car) => car.transmission).filter(Boolean))],
    seats: [...new Set(filteredCars.map((car) => car.seats))].sort((left, right) => left - right),
  }

  return NextResponse.json({
    cars: selectedCars.map((car) => buildSearchPayload(car, allowedLocationsMap.get(car.id) || [car.location])),
    popularCars: pickDailyCars(filteredCars, 2).map((car) =>
      buildSearchPayload(car, allowedLocationsMap.get(car.id) || [car.location]),
    ),
    filters,
  })
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const body = await request.json()
  const { locationIds = [], ...carPayload } = body

  const { data: car, error } = await adminSupabase
    .from("cars")
    .insert(carPayload)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (Array.isArray(locationIds) && locationIds.length) {
    await adminSupabase.from("car_locations").delete().eq("car_id", car.id)
    await adminSupabase.from("car_locations").insert(
      locationIds.map((locationId: string, index: number) => ({
        car_id: car.id,
        location_id: locationId,
        is_primary: index === 0,
      })),
    )
  }

  return NextResponse.json({ car })
}
