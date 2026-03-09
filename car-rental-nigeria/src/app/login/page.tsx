"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Car, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBrowserSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/lib/providers/AuthProvider"
import { env } from "@/lib/env"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getBrowserSupabaseClient()
  const { isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(nextPath)
    }
  }, [isAuthenticated, loading, nextPath, router])

  const handleEmailLogin = async () => {
    setSubmitting(true)
    setError("")
    setMessage("")

    const { error: loginError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${env.appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (loginError) {
      setError(loginError.message)
    } else {
      setMessage("Check your email for the sign-in link.")
    }

    setSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    setSubmitting(true)
    setError("")

    const { error: loginError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${env.appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (loginError) {
      setError(loginError.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
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
                Sign in before checkout so your bookings, refunds, and reviews stay attached to your account.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Bookings</p>
                  <p className="mt-2 text-xl font-semibold">Private booking history</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Payments</p>
                  <p className="mt-2 text-xl font-semibold">Verified checkout flow</p>
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
                <CardTitle className="text-3xl font-bold text-slate-950">Sign in to continue</CardTitle>
                <p className="mt-2 text-sm text-slate-600">
                  Use email sign-in or Google. Your booking will remain attached to this account.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <Button
                className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                onClick={handleEmailLogin}
                disabled={submitting || !email}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Email sign-in link
              </Button>

              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl border-slate-300"
                onClick={handleGoogleLogin}
                disabled={submitting}
              >
                Continue with Google
              </Button>

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
