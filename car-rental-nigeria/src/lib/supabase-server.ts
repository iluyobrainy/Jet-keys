import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import type { Database } from "@/lib/database.types"

export function createServerSupabaseClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
