import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const carId = searchParams.get("carId")
  const rentalMode = searchParams.get("rentalMode") || "within_state"
  const supabase = createServerSupabaseClient()

  const { data: states, error: statesError } = await supabase
    .from("service_states")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (statesError) {
    return NextResponse.json({ error: statesError.message }, { status: 500 })
  }

  const { data: zones, error: zonesError } = await supabase
    .from("service_zones")
    .select("*, service_areas(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (zonesError) {
    return NextResponse.json({ error: zonesError.message }, { status: 500 })
  }

  let coverage: Array<Record<string, unknown>> = []
  let rates: Array<Record<string, unknown>> = []

  if (carId) {
    const coverageResult = await supabase
      .from("car_service_coverage")
      .select("*")
      .eq("car_id", carId)
      .eq("rental_mode", rentalMode)
      .eq("is_active", true)

    coverage = coverageResult.data || []

    const rateResult = await supabase
      .from("car_pricing_rates")
      .select("*")
      .eq("car_id", carId)
      .eq("is_active", true)

    rates = rateResult.data || []
  }

  const coveredStateIds = new Set(coverage.map((item) => String(item.state_id)))
  const selectableStates = carId && coveredStateIds.size > 0
    ? (states || []).filter((state) => coveredStateIds.has(state.id))
    : states || []

  return NextResponse.json({
    states: selectableStates,
    zones: zones || [],
    coverage,
    rates,
    timingPackages: [
      { value: "12h", label: "12 hours" },
      { value: "24h", label: "24 hours" },
    ],
  })
}