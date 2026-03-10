"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Car, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "@/lib/admin-auth-client"

const EMAIL_COOLDOWN_SECONDS = 60
const EMAIL_COOLDOWN_STORAGE_KEY = "jetandkeys-admin-email-auth-cooldown-until"

function getStoredCooldown() {
  if (typeof window === "undefined") {
    return 0
  }

  const rawValue = window.localStorage.getItem(EMAIL_COOLDOWN_STORAGE_KEY)
  const expiresAt = rawValue ? Number(rawValue) : 0

  if (!expiresAt || Number.isNaN(expiresAt)) {
    window.localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY)
    return 0
  }

  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isAdmin, loading, refreshProfile } = useAdminAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [secondaryLoading, setSecondaryLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams])
  const authRedirectBase = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), [])

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      router.replace(nextPath)
    }
  }, [isAdmin, isAuthenticated, loading, nextPath, router])

  useEffect(() => {
    setCooldownRemaining(getStoredCooldown())
  }, [])

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setCooldownRemaining(getStoredCooldown())
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [cooldownRemaining])

  const startCooldown = () => {
    const expiresAt = Date.now() + EMAIL_COOLDOWN_SECONDS * 1000
    window.localStorage.setItem(EMAIL_COOLDOWN_STORAGE_KEY, String(expiresAt))
    setCooldownRemaining(EMAIL_COOLDOWN_SECONDS)
  }

  const clearFeedback = () => {
    setError("")
    setMessage("")
  }

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter your admin email and password.")
      return
    }

    try {
      setSubmitting(true)
      clearFeedback()

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      if (loginError) {
        throw loginError
      }

      await refreshProfile()
      router.replace(nextPath)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in right now.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMagicLink = async () => {
    const fallbackEmail = String(magicLinkEmail || email || "").trim().toLowerCase()

    if (!fallbackEmail) {
      setError("Enter your admin email to receive the sign-in link.")
      return
    }

    try {
      setSecondaryLoading(true)
      clearFeedback()

      const { error: loginError } = await supabase.auth.signInWithOtp({
        email: fallbackEmail,
        options: {
          emailRedirectTo: `${authRedirectBase}/login?next=${encodeURIComponent(nextPath)}`,
        },
      })

      if (loginError) {
        const rateLimitError =
          loginError.message.toLowerCase().includes("rate") ||
          ("status" in loginError && Number(loginError.status) === 429)

        if (rateLimitError) {
          startCooldown()
        }

        throw loginError
      }

      startCooldown()
      setMessage("Admin sign-in link sent. Check your email.")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to send the sign-in link.")
    } finally {
      setSecondaryLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError("Enter your admin email first so we know where to send the reset link.")
      return
    }

    try {
      setSecondaryLoading(true)
      clearFeedback()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${authRedirectBase}/reset-password`,
      })

      if (resetError) {
        const rateLimitError =
          resetError.message.toLowerCase().includes("rate") ||
          ("status" in resetError && Number(resetError.status) === 429)

        if (rateLimitError) {
          startCooldown()
        }

        throw resetError
      }

      startCooldown()
      setMessage("Password reset link sent. Open the email to set a new admin password.")
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to send the reset link.")
    } finally {
      setSecondaryLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,_#eff6ff_0%,_#dbeafe_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[36px] bg-slate-950 p-10 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] lg:block">
            <div className="mb-16 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Car className="h-7 w-7 text-blue-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">Jet & Keys</p>
                <h1 className="text-3xl font-bold">Admin Access</h1>
              </div>
            </div>
            <div className="space-y-6">
              <p className="max-w-md text-lg text-white/80">
                Sign in with your admin email and password. If you need to rotate credentials, send yourself a reset link and choose a new password from the email.
              </p>
              <div className="rounded-[28px] border border-blue-400/20 bg-blue-400/10 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-300" />
                  <p className="text-sm leading-6 text-white/80">
                    Admin sessions stay tied to Supabase Auth and can use a password reset link to set a fresh password without creating a new account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-[32px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
            <CardHeader className="space-y-3 px-8 pt-8">
              <Link href="/" className="flex items-center gap-3 text-slate-900">
                <Car className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-bold">Jet & Keys Admin</span>
              </Link>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-950">Admin login</CardTitle>
                <p className="mt-2 text-sm text-slate-600">
                  Use your admin email and password. Magic link and password reset remain available as fallback tools.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@jetandkeys.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
              </div>

              <Button
                className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                onClick={handlePasswordLogin}
                disabled={submitting || secondaryLoading || !email || !password}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                Login
              </Button>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-300"
                  onClick={handlePasswordReset}
                  disabled={secondaryLoading || submitting || cooldownRemaining > 0}
                >
                  {secondaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                  {cooldownRemaining > 0 ? `Reset in ${cooldownRemaining}s` : "Reset password"}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-300"
                  onClick={handleMagicLink}
                  disabled={secondaryLoading || submitting || cooldownRemaining > 0}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {cooldownRemaining > 0 ? `Link in ${cooldownRemaining}s` : "Email sign-in link"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-magic-email">Magic link email</Label>
                <Input
                  id="admin-magic-email"
                  type="email"
                  value={magicLinkEmail}
                  onChange={(event) => setMagicLinkEmail(event.target.value)}
                  placeholder="Optional alternate email field"
                />
              </div>

              {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
