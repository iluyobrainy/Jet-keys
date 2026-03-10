"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Car, Loader2, LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminAuth } from "@/lib/admin-auth-client"

const DEFAULT_ADMIN_EMAIL = "Admin@com"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isAdmin, loading, refreshProfile } = useAdminAuth()
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL)
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams])

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      router.replace(nextPath)
    }
  }, [isAdmin, isAuthenticated, loading, nextPath, router])

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter the admin email and password.")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to log in right now.")
      }

      await refreshProfile()
      router.replace(nextPath)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in right now.")
    } finally {
      setSubmitting(false)
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
                Temporary admin access is now a single credential login so you can move quickly while we finish the permanent auth flow.
              </p>
              <div className="rounded-[28px] border border-blue-400/20 bg-blue-400/10 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-300" />
                  <div className="space-y-2 text-sm leading-6 text-white/80">
                    <p>Email: <span className="font-semibold text-white">Admin@com</span></p>
                    <p>Password: <span className="font-semibold text-white">Admin@123</span></p>
                    <p>This is temporary. We can switch it back to proper staff auth later.</p>
                  </div>
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
                  Use the temporary admin email and password below to access the dashboard.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                <p><strong>Email:</strong> Admin@com</p>
                <p><strong>Password:</strong> Admin@123</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Admin@com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin@123"
                />
              </div>

              <Button
                className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                onClick={handleLogin}
                disabled={submitting || !email || !password}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
                Login
              </Button>

              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
