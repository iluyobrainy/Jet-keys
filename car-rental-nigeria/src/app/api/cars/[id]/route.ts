import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getCarPrimaryImage } from "@/lib/server/car-utils"
import type { Database } from "@/lib/database.types"

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"]

async function getLocationsForCar(carId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("car_locations")
    .select("location_id, locations(name, city)")
    .eq("car_id", carId)

  if (error || !data) {
    return []
  }

  return data
    .map((item) => {
      const location = Array.isArray(item.locations) ? item.locations[0] : item.locations
      if (!location) {
        return null
      }

      return {
        id: item.location_id,
        label: `${location.name}, ${location.city}`,
      }
    })
    .filter(Boolean)
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error || !car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 })
  }

  const locations = await getLocationsForCar(id)
  const { data: nearbyCarsData } = await supabase
    .from("cars")
    .select("*")
    .neq("id", id)
    .eq("is_available", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6)

  const nearbyCars = (nearbyCarsData || [])
    .sort((left, right) => {
      if (left.location === car.location && right.location !== car.location) {
        return -1
      }

      if (right.location === car.location && left.location !== car.location) {
        return 1
      }

      return 0
    })
    .slice(0, 2)
    .map((nearbyCar) => ({
      ...nearbyCar,
      primaryImage: getCarPrimaryImage(nearbyCar),
    }))

  let reviews: ReviewRow[] = []

  const reviewResult = await supabase
    .from("reviews")
    .select(`
      *,
      bookings(customer_name, booking_reference)
    `)
    .eq("car_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (!reviewResult.error) {
    reviews = reviewResult.data || []
  }

  return NextResponse.json({
    car: {
      ...car,
      primaryImage: getCarPrimaryImage(car),
    },
    allowedLocations: locations,
    nearbyCars,
    reviews,
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { locationIds = [], ...updates } = body
  const adminSupabase = getAdminSupabaseClient()

  const { data: car, error } = await adminSupabase
    .from("cars")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (Array.isArray(locationIds)) {
    await adminSupabase.from("car_locations").delete().eq("car_id", id)

    if (locationIds.length) {
      await adminSupabase.from("car_locations").insert(
        locationIds.map((locationId: string, index: number) => ({
          car_id: id,
          location_id: locationId,
          is_primary: index === 0,
        })),
      )
    }
  }

  return NextResponse.json({ car })
}
