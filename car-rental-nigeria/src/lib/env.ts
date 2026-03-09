const fallbackSupabaseUrl = "https://dtaspdqcyapnfgcsbtte.supabase.co"
const fallbackSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXNwZHFjeWFwbmZnY3NidHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODYzMTYsImV4cCI6MjA3Mjc2MjMxNn0.fI_8EuIq3caCNIneCS6Rkfr4lgdYKtXE6a5qCz7P4lk"

function trimValue(value: string | undefined, fallback = "") {
  return (value || fallback).trim()
}

export const env = {
  supabaseUrl: trimValue(process.env.NEXT_PUBLIC_SUPABASE_URL, fallbackSupabaseUrl),
  supabaseAnonKey: trimValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, fallbackSupabaseAnonKey),
  supabaseServiceRoleKey: trimValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  paystackPublicKey: trimValue(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
  paystackSecretKey: trimValue(process.env.PAYSTACK_SECRET_KEY),
  paystackBaseUrl: trimValue(process.env.PAYSTACK_BASE_URL, "https://api.paystack.co"),
  appUrl: trimValue(process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000").replace(/\/+$/, ""),
  carImagesBucket: trimValue(process.env.NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET, "car-images"),
  adminEmails: trimValue(process.env.NEXT_PUBLIC_ADMIN_EMAILS, "admin@jetandkeys.com")
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
