"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch } from "@/lib/api-client"

function BookingCompleteContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your payment...")

  useEffect(() => {
    const bookingId = searchParams.get("bookingId")
    const reference = searchParams.get("reference")

    if (!bookingId || !reference) {
      setMessage("Missing payment details.")
      setState("error")
      return
    }

    const verify = async () => {
      try {
        const response = await apiFetch<{ booking?: { car_id?: string | null } }>("/api/payments/paystack/verify", {
          method: "POST",
          body: JSON.stringify({ bookingId, reference }),
        })
        const carId = response.booking?.car_id
        if (carId) {
          window.localStorage.removeItem(`jet-keys-booking-form-${carId}`)
        }
        setMessage("Payment verified. Your booking is now waiting for fulfilment.")
        setState("success")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to verify payment.")
        setState("error")
      }
    }

    void verify()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <CardContent className="space-y-6 p-8 text-center">
          {state === "loading" ? (
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600" />
          ) : (
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-950">Booking complete</h1>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/cars">Back to car selection</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/my-bookings">View my bookings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <BookingCompleteContent />
    </Suspense>
  )
}
