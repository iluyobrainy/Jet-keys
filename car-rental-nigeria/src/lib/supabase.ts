import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import type { Database } from "@/lib/database.types"

let browserClient: SupabaseClient<Database> | undefined

export function getBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  }

  return browserClient
}

export const supabase = getBrowserSupabaseClient()

export type { Database }
