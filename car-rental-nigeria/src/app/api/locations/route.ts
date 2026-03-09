import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("city")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ locations: data || [] })
}
