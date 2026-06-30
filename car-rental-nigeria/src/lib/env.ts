function trimValue(value: string | undefined, fallback = "") {
  return (value || fallback).trim()
}

export const env = {
  supabaseUrl: trimValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trimValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
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
