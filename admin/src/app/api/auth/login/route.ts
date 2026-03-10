import { NextResponse, type NextRequest } from "next/server"
import { ensureAdminProfileByEmail } from "@/lib/admin-auth-server"
import {
  SIMPLE_ADMIN_COOKIE,
  SIMPLE_ADMIN_EMAIL,
  SIMPLE_ADMIN_SESSION_MAX_AGE_MS,
  createSimpleAdminSessionToken,
  matchesSimpleAdminCredentials,
} from "@/lib/simple-admin-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")

    if (!matchesSimpleAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    const profile = await ensureAdminProfileByEmail(SIMPLE_ADMIN_EMAIL, "Jet & Keys Admin")
    const token = createSimpleAdminSessionToken(SIMPLE_ADMIN_EMAIL)

    const response = NextResponse.json({
      profile,
      role: "admin",
      provider: "simple",
      user: {
        id: profile.auth_user_id || profile.id,
        email: SIMPLE_ADMIN_EMAIL,
      },
    })

    response.cookies.set({
      name: SIMPLE_ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(SIMPLE_ADMIN_SESSION_MAX_AGE_MS / 1000),
    })

    return response
  } catch (error) {
    console.error("Error logging in admin:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}
