import { createClient } from "@supabase/supabase-js"
import { env, requireServerEnv } from "@/lib/env"
import type { Database } from "@/lib/database.types"

let adminClient:
  | ReturnType<typeof createClient<Database>>
  | undefined

export function getAdminSupabaseClient() {
  if (!adminClient) {
    adminClient = createClient<Database>(
      env.supabaseUrl,
      requireServerEnv("supabaseServiceRoleKey"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }

  return adminClient
}
