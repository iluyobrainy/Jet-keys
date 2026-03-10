"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, CheckCircle2, Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api-client"
import { useAuth } from "@/lib/providers/AuthProvider"
import { getBrowserSupabaseClient } from "@/lib/supabase"

const PASSWORD_MIN_LENGTH = 8

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = getBrowserSupabaseClient()
  const { isAuthenticated, loading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setError("Open the password reset link from your email to continue.")
    }
  }, [isAuthenticated, loading])

  const handleResetPassword = async () => {
    const trimmedPassword = password.trim()

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
      setError("")
      setMessage("")

      const { error: updateError } = await supabase.auth.updateUser({
        password: trimmedPassword,
      })

      if (updateError) {
        throw updateError
      }

      await apiFetch("/api/auth/profile", {
        method: "POST",
      })

      setMessage("Password updated successfully. Redirecting to your bookings...")
      window.setTimeout(() => {
        router.replace("/my-bookings")
      }, 1200)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to update your password.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#dbeafe_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
        <Card className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
          <CardHeader className="space-y-3 px-8 pt-8">
            <Link href="/" className="flex items-center gap-3 text-slate-900">
              <Car className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold">Jet & Keys</span>
            </Link>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-950">Set a new password</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                Use a strong password so you can log in normally next time without waiting for an email link.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
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
              onClick={handleResetPassword}
              disabled={submitting || loading || !isAuthenticated}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
              Save password
            </Button>

            <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Customer sessions stay active for up to 12 hours on this device before sign-in is required again.
            </p>

            {message ? (
              <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </p>
            ) : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
