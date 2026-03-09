import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, syncUserProfile } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    profile: context.profile,
    role: context.role,
    user: {
      id: context.user.id,
      email: context.user.email,
    },
  })
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await syncUserProfile(context.user)

  return NextResponse.json({
    profile,
    role: profile?.role || context.role,
  })
}
