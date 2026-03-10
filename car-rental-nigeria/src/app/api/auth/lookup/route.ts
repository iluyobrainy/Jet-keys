import { NextResponse, type NextRequest } from "next/server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

function normalizeIdentifier(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  const adminSupabase = getAdminSupabaseClient()
  const body = await request.json()
  const mode = String(body?.mode || "")

  if (mode === "resolve-login") {
    const identifier = normalizeIdentifier(body.identifier)

    if (!identifier) {
      return NextResponse.json({ error: "Email or username is required" }, { status: 400 })
    }

    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier })
    }

    const { data, error } = await adminSupabase
      .from("users")
      .select("email")
      .ilike("name", identifier)
      .limit(2)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.length || data.length !== 1) {
      return NextResponse.json({ error: "Invalid login details" }, { status: 404 })
    }

    return NextResponse.json({ email: data[0].email })
  }

  if (mode === "check-signup") {
    const username = normalizeIdentifier(body.username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from("users")
      .select("id")
      .ilike("name", username)
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      usernameAvailable: !data?.length,
    })
  }

  return NextResponse.json({ error: "Unsupported lookup mode" }, { status: 400 })
}
