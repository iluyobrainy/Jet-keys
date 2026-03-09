const fallbackSupabaseUrl = "https://dtaspdqcyapnfgcsbtte.supabase.co"
const fallbackSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXNwZHFjeWFwbmZnY3NidHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODYzMTYsImV4cCI6MjA3Mjc2MjMxNn0.fI_8EuIq3caCNIneCS6Rkfr4lgdYKtXE6a5qCz7P4lk"

function readEnv(name: string, fallback = "") {
  return (process.env[name] || fallback).trim()
}

export const env = {
  supabaseUrl: readEnv("NEXT_PUBLIC_SUPABASE_URL", fallbackSupabaseUrl),
  supabaseAnonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", fallbackSupabaseAnonKey),
  supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  paystackPublicKey: readEnv("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),
  paystackSecretKey: readEnv("PAYSTACK_SECRET_KEY"),
  paystackBaseUrl: readEnv("PAYSTACK_BASE_URL", "https://api.paystack.co"),
  appUrl: readEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000").replace(/\/+$/, ""),
  carImagesBucket: readEnv("NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET", "car-images"),
  adminEmails: readEnv("NEXT_PUBLIC_ADMIN_EMAILS", "admin@jetandkeys.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
}

export function requireServerEnv(name: keyof typeof env) {
  const value = env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}
