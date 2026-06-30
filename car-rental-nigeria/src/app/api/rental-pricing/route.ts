import { NextResponse, type NextRequest } from "next/server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import { calculateControlledPricing, type RentalMode, type TimingPackage } from "@/lib/rental/controlled-pricing"
import { validateRentalWindow } from "@/lib/server/booking-utils"

export const dynamic = "force-dynamic"

function combineDateAndTime(dateValue: string, timeValue?: string | null) {
  const date = new Date(dateValue)

  if (timeValue) {
    const [hours, minutes] = timeValue.split(":").map(Number)
    date.setHours(hours || 0, minutes || 0, 0, 0)
  }

  return date.toISOString()
}

async function loadPricingDeps(input: {
  carId: string
  stateId?: string | null
  zoneId?: string | null
  areaId?: string | null
  timingPackage: TimingPackage
}) {
  const supabase = getAdminSupabaseClient()
  let rateQuery = input.stateId
    ? supabase
        .from("car_pricing_rates")
        .select("*")
        .eq("car_id", input.carId)
        .eq("state_id", input.stateId)
        .eq("timing_package", input.timingPackage)
        .eq("is_active", true)
    : null

  if (rateQuery) {
    rateQuery = input.zoneId ? rateQuery.eq("zone_id", input.zoneId) : rateQuery.is("zone_id", null)
  }

  const [settingsResult, stateResult, zoneResult, areaResult, rateResult] = await Promise.all([
    supabase.from("checkout_settings").select("*").single(),
    input.stateId ? supabase.from("service_states").select("*").eq("id", input.stateId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    input.zoneId ? supabase.from("service_zones").select("*").eq("id", input.zoneId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    input.areaId ? supabase.from("service_areas").select("*").eq("id", input.areaId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    rateQuery ? rateQuery.maybeSingle() : Promise.resolve({ data: null, error: null }),
  ])

  return {
    checkoutSettings: settingsResult.data,
    state: stateResult.data,
    zone: zoneResult.data,
    area: areaResult.data,
    rate: rateResult.data,
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    carId,
    rentalMode,
    serviceStateId,
    originStateId,
    destinationStateId,
    zoneId,
    areaId,
    timingPackage,
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
  } = body as {
    carId?: string
    rentalMode?: RentalMode
    serviceStateId?: string
    originStateId?: string
    destinationStateId?: string
    zoneId?: string
    areaId?: string
    timingPackage?: TimingPackage
    pickupDate?: string
    dropoffDate?: string
    pickupTime?: string | null
    dropoffTime?: string | null
  }

  if (!carId || !rentalMode || !pickupDate || !dropoffDate || !timingPackage) {
    return NextResponse.json({ error: "Missing pricing details" }, { status: 400 })
  }

  const stateId = rentalMode === "within_state" ? serviceStateId : originStateId
  const deps = await loadPricingDeps({ carId, stateId, zoneId, areaId, timingPackage })
  const pickupDateTime = combineDateAndTime(pickupDate, pickupTime)
  const dropoffDateTime = combineDateAndTime(dropoffDate, dropoffTime)
  const validation = validateRentalWindow(pickupDateTime, dropoffDateTime, deps.checkoutSettings)

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 })
  }

  const pricing = calculateControlledPricing(
    {
      carId,
      rentalMode,
      serviceStateId,
      originStateId,
      destinationStateId,
      zoneId,
      areaId,
      timingPackage,
      pickupDate: pickupDateTime,
      dropoffDate: dropoffDateTime,
    },
    deps,
  )

  return NextResponse.json({ pricing })
}
