import { NextResponse, type NextRequest } from "next/server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

function normalizeIdentifier(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

async function emailExists(adminSupabase: ReturnType<typeof getAdminSupabaseClient>, email: string) {
  const { data: existingProfile, error: profileError } = await adminSupabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .limit(1)

  if (profileError) {
    throw profileError
  }

  if (existingProfile?.length) {
    return true
  }

  let page = 1
  const perPage = 200

  while (page <= 5) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw error
    }

    if (data.users.some((user) => normalizeIdentifier(user.email) === email)) {
      return true
    }

    if (data.users.length < perPage) {
      break
    }

    page += 1
  }

  return false
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
    const email = normalizeIdentifier(body.email)

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

    let emailAvailable = true

    if (email) {
      try {
        emailAvailable = !(await emailExists(adminSupabase, email))
      } catch (emailError) {
        return NextResponse.json(
          { error: emailError instanceof Error ? emailError.message : "Failed to verify email" },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      usernameAvailable: !data?.length,
      emailAvailable,
      accountExists: Boolean(data?.length) || !emailAvailable,
    })
  }

  return NextResponse.json({ error: "Unsupported lookup mode" }, { status: 400 })
}
