import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

type JetRow = Database["public"]["Tables"]["jets"]["Row"]

function buildJetPayload(jet: JetRow) {
  const primaryImage = jet.images?.[0] || null

  return {
    ...jet,
    primaryImage,
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search")?.trim().toLowerCase()
  const minPassengers = Number(searchParams.get("passengers") || 0)

  let query = supabase
    .from("jets")
    .select("*")
    .eq("is_available", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (minPassengers > 0) {
    query = query.gte("capacity", minPassengers)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let jets = data || []

  if (search) {
    jets = jets.filter((jet) =>
      [jet.name, jet.manufacturer, jet.model, jet.location, jet.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    )
  }

  const filters = {
    manufacturers: [...new Set(jets.map((jet) => jet.manufacturer).filter(Boolean))],
    locations: [...new Set(jets.map((jet) => jet.location).filter(Boolean))],
    capacities: [...new Set(jets.map((jet) => jet.capacity).filter(Boolean))].sort((left, right) => left - right),
  }

  return NextResponse.json({
    jets: jets.map(buildJetPayload),
    filters,
  })
}