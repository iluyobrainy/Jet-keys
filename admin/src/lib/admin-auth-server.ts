import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'
import {
  SIMPLE_ADMIN_COOKIE,
  SIMPLE_ADMIN_EMAIL,
  verifySimpleAdminSessionToken,
} from '@/lib/simple-admin-auth'

type AdminProfile = {
  id: string
  auth_user_id?: string | null
  email: string
  name: string
  phone?: string | null
  role?: string | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

type AdminContextUser = {
  id: string
  email?: string | null
  phone?: string | null
  user_metadata?: Record<string, unknown>
}

const allowedAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? 'admin@jetandkeys.com')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

function normalizeEmail(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function parseAuthHeader(request: NextRequest) {
  const header = request.headers.get('authorization')

  if (!header?.startsWith('Bearer ')) {
    return null
  }

  return header.slice('Bearer '.length)
}

function inferRole(email?: string | null) {
  return allowedAdminEmails.includes(normalizeEmail(email)) ? 'admin' : 'customer'
}

export async function ensureAdminProfileByEmail(email: string, name = 'Admin User') {
  const payload = {
    email,
    name,
    role: 'admin',
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(payload, {
      onConflict: 'email',
      ignoreDuplicates: false,
    })
    .select('*')
    .single()

  if (!error) {
    return data as AdminProfile
  }

  const legacyResult = await supabaseAdmin
    .from('users')
    .upsert(
      {
        email,
        name,
      },
      {
        onConflict: 'email',
        ignoreDuplicates: false,
      },
    )
    .select('*')
    .single()

  if (legacyResult.error) {
    throw legacyResult.error
  }

  return legacyResult.data as AdminProfile
}

async function getExistingProfile(user: User) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email ?? ''}`)
    .maybeSingle()

  return (data as AdminProfile | null) ?? null
}

export async function syncAdminProfile(user: User | AdminContextUser) {
  const fullName =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Admin User'

  const payload = {
    auth_user_id: user.id,
    email: user.email ?? '',
    name: fullName,
    phone: user.phone ?? null,
    role: inferRole(user.email),
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(payload, {
      onConflict: 'email',
      ignoreDuplicates: false,
    })
    .select('*')
    .single()

  if (!error) {
    return data as AdminProfile
  }

  const legacyResult = await supabaseAdmin
    .from('users')
    .upsert(
      {
        email: user.email ?? '',
        name: fullName,
        phone: user.phone ?? null,
      },
      {
        onConflict: 'email',
        ignoreDuplicates: false,
      },
    )
    .select('*')
    .single()

  if (legacyResult.error) {
    throw legacyResult.error
  }

  return legacyResult.data as AdminProfile
}

export async function requireAdminContext(request: NextRequest) {
  const accessToken = parseAuthHeader(request)

  if (accessToken) {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken)

    if (!error && user) {
      const profile = (await getExistingProfile(user)) ?? (await syncAdminProfile(user))
      const normalizedEmail = normalizeEmail(user.email)
      const role = (profile?.role || inferRole(user.email)).toLowerCase()
      const isAllowed =
        profile?.is_active !== false &&
        (role === 'admin' || role === 'staff' || allowedAdminEmails.includes(normalizedEmail))

      if (isAllowed) {
        return {
          accessToken,
          provider: 'supabase' as const,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone ?? null,
            user_metadata: user.user_metadata ?? {},
          } satisfies AdminContextUser,
          profile,
          role,
        }
      }
    }
  }

  const cookieToken = request.cookies.get(SIMPLE_ADMIN_COOKIE)?.value
  const simpleSession = verifySimpleAdminSessionToken(cookieToken)

  if (!simpleSession) {
    return null
  }

  const profile =
    (await supabaseAdmin.from('users').select('*').eq('email', SIMPLE_ADMIN_EMAIL).maybeSingle()).data ??
    (await ensureAdminProfileByEmail(SIMPLE_ADMIN_EMAIL, 'Jet & Keys Admin'))
  const role = String(profile?.role || 'admin').toLowerCase()
  const isAllowed =
    profile?.is_active !== false &&
    (role === 'admin' || role === 'staff')

  if (!isAllowed) {
    return null
  }

  return {
    accessToken: null,
    provider: 'simple' as const,
    user: {
      id: profile.auth_user_id || profile.id,
      email: SIMPLE_ADMIN_EMAIL,
      phone: profile.phone ?? null,
      user_metadata: {
        username: profile.name,
      },
    } satisfies AdminContextUser,
    profile,
    role,
  }
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
}
