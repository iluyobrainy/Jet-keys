"use client"

import { Suspense, useEffect, useState } from "react"
import type { EmailOtpType } from "@supabase/supabase-js"
import { useRouter, useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api-client"
import { getBrowserSupabaseClient } from "@/lib/supabase"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getBrowserSupabaseClient()
      const nextPath = searchParams.get("next") || "/"
      const code = searchParams.get("code")
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      const errorDescription = searchParams.get("error_description")
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      if (errorDescription) {
        setError(errorDescription)
        return
      }

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            throw exchangeError
          }
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          })

          if (verifyError) {
            throw verifyError
          }
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            throw sessionError
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error("Sign-in could not be completed. Please try again.")
        }

        await apiFetch("/api/auth/profile", {
          method: "POST",
        })

        window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`)
        router.replace(nextPath)
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : "Sign-in failed. Please try again.")
      }
    }

    void handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        {error ? (
          <>
            <p className="mb-3 text-lg font-semibold text-white">Sign-in failed</p>
            <p className="mx-auto max-w-sm text-sm text-white/70">{error}</p>
            <button
              className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950"
              onClick={() => router.replace("/login")}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-amber-300"></div>
            <p className="text-sm text-white/70">Completing sign-in...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-amber-300"></div>
            <p className="text-sm text-white/70">Completing sign-in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
