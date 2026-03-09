import type { User } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { env } from "@/lib/env"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"
import type { Database, UserRole } from "@/lib/database.types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export interface AuthContext {
  accessToken: string
  user: User
  profile: UserProfile | null
  role: UserRole
}

function getRoleFromEmail(email?: string | null): UserRole {
  if (email && env.adminEmails.includes(email.toLowerCase())) {
    return "admin"
  }

  return "customer"
}

function parseAuthHeader(request: NextRequest) {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Bearer ")) {
    return null
  }

  return header.slice("Bearer ".length)
}

async function getExistingProfile(user: User) {
  const adminSupabase = getAdminSupabaseClient()

  const { data } = await adminSupabase
    .from("users")
    .select("*")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
    .maybeSingle()

  return data
}

export async function syncUserProfile(user: User) {
  const adminSupabase = getAdminSupabaseClient()
  const fallbackRole = getRoleFromEmail(user.email)
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Jet & Keys Customer"

  const primaryPayload = {
    auth_user_id: user.id,
    email: user.email ?? "",
    name: fullName,
    phone: user.phone ?? null,
    role: fallbackRole,
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await adminSupabase
    .from("users")
    .upsert(primaryPayload, {
      onConflict: "email",
      ignoreDuplicates: false,
    })
    .select("*")
    .single()

  if (!error) {
    return data
  }

  const legacyPayload = {
    email: user.email ?? "",
    name: fullName,
    phone: user.phone ?? null,
  }

  const legacyResult = await adminSupabase
    .from("users")
    .upsert(legacyPayload, {
      onConflict: "email",
      ignoreDuplicates: false,
    })
    .select("*")
    .single()

  if (legacyResult.error) {
    throw legacyResult.error
  }

  return legacyResult.data
}

export async function getAuthContext(request: NextRequest, options?: { requireAdmin?: boolean }) {
  const accessToken = parseAuthHeader(request)

  if (!accessToken) {
    return null
  }

  const adminSupabase = getAdminSupabaseClient()
  const {
    data: { user },
    error,
  } = await adminSupabase.auth.getUser(accessToken)

  if (error || !user) {
    return null
  }

  const profile = (await getExistingProfile(user)) ?? (await syncUserProfile(user))
  const role = (profile?.role as UserRole | null) || getRoleFromEmail(user.email)

  if (options?.requireAdmin && role === "customer") {
    return null
  }

  return {
    accessToken,
    user,
    profile,
    role,
  } satisfies AuthContext
}

export function requireRole(context: AuthContext | null, roles: UserRole[]) {
  if (!context || !roles.includes(context.role)) {
    return false
  }

  return true
}
