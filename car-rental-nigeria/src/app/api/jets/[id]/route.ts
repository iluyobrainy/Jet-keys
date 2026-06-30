import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

type JetRow = Database["public"]["Tables"]["jets"]["Row"]

function buildJetPayload(jet: JetRow) {
  return {
    ...jet,
    primaryImage: jet.images?.[0] || null,
  }
}

function pickRelatedJets(jets: JetRow[], currentJet: JetRow) {
  return jets
    .filter((jet) => jet.id !== currentJet.id)
    .sort((left, right) => {
      const leftScore = left.location === currentJet.location ? 0 : 1
      const rightScore = right.location === currentJet.location ? 0 : 1
      return leftScore - rightScore
    })
    .slice(0, 2)
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: jet, error } = await supabase
    .from("jets")
    .select("*")
    .eq("id", params.id)
    .eq("is_available", true)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!jet) {
    return NextResponse.json({ error: "Jet not found" }, { status: 404 })
  }

  const { data: relatedData } = await supabase
    .from("jets")
    .select("*")
    .eq("is_available", true)
    .eq("status", "active")
    .limit(6)

  const relatedJets = pickRelatedJets(relatedData || [], jet)

  return NextResponse.json({
    jet: buildJetPayload(jet),
    relatedJets: relatedJets.map(buildJetPayload),
  })
}