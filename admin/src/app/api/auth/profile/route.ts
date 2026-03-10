import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminContext, syncAdminProfile, unauthorizedAdminResponse } from '@/lib/admin-auth-server'

export async function GET(request: NextRequest) {
  const context = await requireAdminContext(request)

  if (!context) {
    return unauthorizedAdminResponse()
  }

  return NextResponse.json({
    profile: context.profile,
    role: context.role,
    provider: context.provider,
    user: {
      id: context.user.id,
      email: context.user.email,
    },
  })
}

export async function POST(request: NextRequest) {
  const context = await requireAdminContext(request)

  if (!context) {
    return unauthorizedAdminResponse()
  }

  if (context.provider === 'simple') {
    return NextResponse.json({
      profile: context.profile,
      role: context.role,
      provider: context.provider,
    })
  }

  const profile = await syncAdminProfile(context.user)

  if (!['admin', 'staff'].includes(String(profile?.role || '').toLowerCase())) {
    return unauthorizedAdminResponse()
  }

  return NextResponse.json({
    profile,
    role: profile?.role || context.role,
    provider: context.provider,
  })
}
