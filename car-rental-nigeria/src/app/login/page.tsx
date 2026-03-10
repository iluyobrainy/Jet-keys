"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Car, KeyRound, Loader2, Mail, ShieldCheck, UserRound, LockKeyhole } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useAuth } from "@/lib/providers/AuthProvider"
import { getBrowserSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const EMAIL_COOLDOWN_SECONDS = 60
const EMAIL_COOLDOWN_STORAGE_KEY = "jetandkeys-email-auth-cooldown-until"
const PASSWORD_MIN_LENGTH = 8
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,24}$/

type AuthMode = "login" | "signup"

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

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function resolveInitialMode(rawMode: string | null): AuthMode {
  return rawMode === "signup" ? "signup" : "login"
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getBrowserSupabaseClient()
  const { isAuthenticated, loading } = useAuth()

  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams])
  const authRedirectBase = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), [])

  const [mode, setMode] = useState<AuthMode>(resolveInitialMode(searchParams.get("mode")))
  const [identifier, setIdentifier] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [secondaryLoading, setSecondaryLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(nextPath)
    }
  }, [isAuthenticated, loading, nextPath, router])

  useEffect(() => {
    setMode(resolveInitialMode(searchParams.get("mode")))
  }, [searchParams])

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

  const resolveLoginEmail = async (rawIdentifier: string) => {
    const response = await apiFetch<{ email: string }>("/api/auth/lookup", {
      method: "POST",
      body: JSON.stringify({
        mode: "resolve-login",
        identifier: rawIdentifier,
      }),
      skipAuth: true,
    })

    return response.email
  }

  const handlePasswordLogin = async () => {
    const trimmedIdentifier = identifier.trim()
    const trimmedPassword = password.trim()

    if (!trimmedIdentifier || !trimmedPassword) {
      setError("Enter your email or username and password.")
      return
    }

    try {
      setSubmitting(true)
      clearFeedback()

      const loginEmail = await resolveLoginEmail(trimmedIdentifier)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: trimmedPassword,
      })

      if (loginError) {
        throw loginError
      }

      await apiFetch("/api/auth/profile", {
        method: "POST",
      })

      router.replace(nextPath)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in right now.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignup = async () => {
    const normalizedUsername = normalizeUsername(username)
    const normalizedEmail = normalizeEmail(email)
    const trimmedPassword = password.trim()

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError("Username must be 3-24 characters and use only letters, numbers, dots, dashes, or underscores.")
      return
    }

    if (!normalizedEmail) {
      setError("Email is required.")
      return
    }

    if (trimmedPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
      return
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError("Passwords do not match.")
      return
    }

    try {
      setSubmitting(true)
      clearFeedback()

      const availability = await apiFetch<{ usernameAvailable: boolean }>("/api/auth/lookup", {
        method: "POST",
        body: JSON.stringify({
          mode: "check-signup",
          username: normalizedUsername,
        }),
        skipAuth: true,
      })

      if (!availability.usernameAvailable) {
        setError("That username is already in use. Choose another one.")
        return
      }

      const { data, error: signupError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${authRedirectBase}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          data: {
            full_name: normalizedUsername,
            name: normalizedUsername,
            username: normalizedUsername,
          },
        },
      })

      if (signupError) {
        throw signupError
      }

      if (data.session?.access_token) {
        await apiFetch("/api/auth/profile", {
          method: "POST",
        })
        router.replace(nextPath)
        return
      }

      setIdentifier(normalizedUsername)
      setPassword("")
      setConfirmPassword("")
      setMode("login")
      setMessage("Account created. Check your email to verify it, then log in with your username or email and password.")
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create your account right now.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMagicLink = async () => {
    const fallbackEmail = normalizeEmail(magicLinkEmail || email || (identifier.includes("@") ? identifier : ""))

    if (!fallbackEmail) {
      setError("Enter an email address to receive the sign-in link.")
      return
    }

    try {
      setSecondaryLoading(true)
      clearFeedback()

      const { error: loginError } = await supabase.auth.signInWithOtp({
        email: fallbackEmail,
        options: {
          emailRedirectTo: `${authRedirectBase}/auth/callback?next=${encodeURIComponent(nextPath)}`,
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
      setMagicLinkEmail(fallbackEmail)
      setMessage("Sign-in link sent. Check your email.")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to send the sign-in link.")
    } finally {
      setSecondaryLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    const rawIdentifier = mode === "signup" ? email : identifier

    if (!rawIdentifier.trim()) {
      setError("Enter your email or username first so we know where to send the reset link.")
      return
    }

    try {
      setSecondaryLoading(true)
      clearFeedback()

      const resetEmail = await resolveLoginEmail(rawIdentifier)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${authRedirectBase}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
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
      setMessage("Password setup link sent. Open the email and choose a new password.")
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to send the password reset link.")
    } finally {
      setSecondaryLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[36px] bg-slate-950 p-10 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] lg:block">
            <div className="mb-16 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Car className="h-7 w-7 text-amber-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">Jet & Keys</p>
                <h1 className="text-3xl font-bold">Customer Access</h1>
              </div>
            </div>
            <div className="space-y-6">
              <p className="max-w-md text-lg text-white/80">
                Create a proper customer account, keep bookings attached to it, and come back later without starting over.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Access</p>
                  <p className="mt-2 text-xl font-semibold">Username or email login</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Session</p>
                  <p className="mt-2 text-xl font-semibold">Stays active for 12 hours</p>
                </div>
              </div>
              <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm leading-6 text-white/80">
                    New customers can register with username, email, and password. Older email-link accounts can use the password reset option once and then log in normally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
            <CardHeader className="space-y-3 px-8 pt-8">
              <Link href="/" className="flex items-center gap-3 text-slate-900">
                <Car className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-bold">Jet & Keys</span>
              </Link>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-950">Login or create account</CardTitle>
                <p className="mt-2 text-sm text-slate-600">
                  Use your username or email with a password. Email-link sign-in remains available as a fallback.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <Tabs
                value={mode}
                onValueChange={(value) => {
                  clearFeedback()
                  setMode(value === "signup" ? "signup" : "login")
                }}
                className="w-full"
              >
                <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="login" className="rounded-xl">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email or username</Label>
                    <Input
                      id="identifier"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="Enter your email or username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Your password"
                    />
                  </div>

                  <Button
                    className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                    onClick={handlePasswordLogin}
                    disabled={submitting || secondaryLoading || !identifier || !password}
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Login
                  </Button>

                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-slate-300"
                    onClick={handlePasswordReset}
                    disabled={secondaryLoading || submitting || cooldownRemaining > 0}
                  >
                    {secondaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                    {cooldownRemaining > 0 ? `Reset available in ${cooldownRemaining}s` : "Set or reset password"}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Choose a username"
                    />
                    <p className="text-xs text-slate-500">3-24 characters. Letters, numbers, dots, dashes, and underscores only.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your password"
                    />
                  </div>

                  <Button
                    className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                    onClick={handleSignup}
                    disabled={submitting || secondaryLoading || !username || !email || !password || !confirmPassword}
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRound className="mr-2 h-4 w-4" />}
                    Create account
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Customer sessions stay active for up to 12 hours on this device before login is required again.
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Fallback: email sign-in link</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Keep this for older accounts or when a customer needs a quick one-time login.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="magic-link-email">Email address</Label>
                  <Input
                    id="magic-link-email"
                    type="email"
                    value={magicLinkEmail}
                    onChange={(event) => setMagicLinkEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-2xl border-slate-300"
                  onClick={handleMagicLink}
                  disabled={secondaryLoading || submitting || cooldownRemaining > 0}
                >
                  {secondaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  {cooldownRemaining > 0 ? `Request again in ${cooldownRemaining}s` : "Send email sign-in link"}
                </Button>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
