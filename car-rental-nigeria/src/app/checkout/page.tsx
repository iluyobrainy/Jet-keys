"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, CheckCircle2, CreditCard, Loader2, MapPin, Shield } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api-client"
import { formatDate, formatNumber } from "@/lib/formatters"
import { useCreateBooking, useCar, useCheckoutSettings, usePricing } from "@/lib/hooks/useApi"
import { useBookingPersistence } from "@/lib/hooks/useBookingPersistence"
import { useAuth } from "@/lib/providers/AuthProvider"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const carId = searchParams.get("carId") || ""
  const { loading, isAuthenticated, profile, user } = useAuth()
  const { data: car, isLoading: carLoading } = useCar(carId)
  const { data: checkoutSettings } = useCheckoutSettings()
  const { formData } = useBookingPersistence(carId)
  const createBookingMutation = useCreateBooking()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(`/checkout?carId=${carId}`)}`)
    }
  }, [carId, isAuthenticated, loading, router])

  useEffect(() => {
    setFullName(profile?.name || user?.user_metadata?.full_name || "")
    setEmail(profile?.email || user?.email || "")
    setPhoneNumber(profile?.phone || user?.phone || "")
  }, [profile, user])

  const rentalHours = useMemo(() => {
    if (!formData.pickupDate || !formData.dropoffDate) {
      return 0
    }

    const pickupDate = new Date(formData.pickupDate)
    const dropoffDate = new Date(formData.dropoffDate)

    if (formData.pickupTime) {
      const [hours, minutes] = formData.pickupTime.split(":").map(Number)
      pickupDate.setHours(hours, minutes, 0, 0)
    }

    if (formData.dropoffTime) {
      const [hours, minutes] = formData.dropoffTime.split(":").map(Number)
      dropoffDate.setHours(hours, minutes, 0, 0)
    }

    return Math.max(0, (dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
  }, [formData.dropoffDate, formData.dropoffTime, formData.pickupDate, formData.pickupTime])

  const billableDays = Math.max(1, Math.ceil(rentalHours / 24))
  const { data: pricing } = usePricing(car || null, billableDays)

  const canCheckout =
    Boolean(carId) &&
    Boolean(formData.pickupLocation) &&
    Boolean(formData.dropoffLocation) &&
    Boolean(formData.pickupDate) &&
    Boolean(formData.dropoffDate) &&
    Boolean(fullName.trim()) &&
    Boolean(email.trim()) &&
    Boolean(phoneNumber.trim()) &&
    Boolean(pricing) &&
    agreedToTerms

  const handlePayment = async () => {
    if (!canCheckout || !pricing || !formData.pickupDate || !formData.dropoffDate) {
      setError("Complete your booking details before continuing.")
      return
    }

    try {
      setProcessing(true)
      setError("")

      const bookingResponse = await createBookingMutation.mutateAsync({
        carId,
        pickupDate: formData.pickupDate.toISOString(),
        dropoffDate: formData.dropoffDate.toISOString(),
        pickupTime: formData.pickupTime,
        dropoffTime: formData.dropoffTime,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        totalAmount: pricing.grandTotal,
        deliveryFee: pricing.deliveryFee,
        vatAmount: pricing.vatAmount,
        serviceFee: pricing.serviceFee,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phoneNumber,
        specialRequests,
      })

      const paymentResponse = await apiFetch<{
        authorizationUrl: string
      }>("/api/payments/paystack/initialize", {
        method: "POST",
        body: JSON.stringify({
          bookingId: bookingResponse.booking.id,
        }),
      })

      window.location.href = paymentResponse.authorizationUrl
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Failed to initialize payment.")
      setProcessing(false)
    }
  }

  if (loading || carLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    )
  }

  if (!car || !formData.pickupDate || !formData.dropoffDate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-20">
          <Card className="w-full rounded-[32px] border border-gray-200">
            <CardContent className="space-y-4 p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-950">Your booking selection is missing</h1>
              <p className="text-sm text-slate-600">
                Go back to the car page, choose your dates and locations, then continue to checkout again.
              </p>
              <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                <a href={`/car-info/${carId}`}>Back to car details</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <FooterSection />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-center gap-3 rounded-[24px] bg-white/90 p-4 shadow-sm">
          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4" />
            Customer details
          </div>
          <div className="h-px w-10 bg-slate-200"></div>
          <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
            Paystack payment
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="rounded-[32px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-950">Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Payment creates a paid booking and sends it to the admin fulfilment queue. The admin only starts operational handling after payment verification.
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone number</Label>
                    <Input id="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="specialRequests">Special requests</Label>
                    <Input
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(event) => setSpecialRequests(event.target.value)}
                      placeholder="Any delivery note or extra instruction"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h2 className="mb-4 text-lg font-semibold text-slate-950">Trip summary</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pickup</p>
                        <p className="text-sm font-medium text-slate-900">{formData.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Return</p>
                        <p className="text-sm font-medium text-slate-900">{formData.dropoffLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pickup time</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(formData.pickupDate.toISOString())} at {formData.pickupTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Return time</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(formData.dropoffDate.toISOString())} at {formData.dropoffTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-950">Payment summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Vehicle</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{car.year} {car.brand} {car.model}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Billable duration</span>
                    <span className="font-medium text-slate-950">{billableDays} day(s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Base price</span>
                    <span className="font-medium text-slate-950">
                      NGN {pricing ? formatNumber(pricing.basePrice) : "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Delivery fee</span>
                    <span className="font-medium text-slate-950">
                      NGN {pricing ? formatNumber(pricing.deliveryFee) : formatNumber(checkoutSettings?.delivery_fee || 0)}
                    </span>
                  </div>
                  {(pricing?.vatAmount || 0) > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">VAT</span>
                      <span className="font-medium text-slate-950">NGN {formatNumber(pricing?.vatAmount || 0)}</span>
                    </div>
                  ) : null}
                  {(pricing?.serviceFee || 0) > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service fee</span>
                      <span className="font-medium text-slate-950">NGN {formatNumber(pricing?.serviceFee || 0)}</span>
                    </div>
                  ) : null}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-950">Total</span>
                      <span className="text-xl font-bold text-amber-600">
                        NGN {pricing ? formatNumber(pricing.grandTotal) : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <Checkbox
                    id="checkout-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                    className="mt-1"
                  />
                  <label htmlFor="checkout-terms" className="text-sm leading-relaxed text-slate-600">
                    I agree to Jet & Keys terms, cancellation policy, and payment verification process.
                  </label>
                </div>

                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <Shield className="h-4 w-4" />
                    Secure Paystack checkout
                  </div>
                  Your booking will only enter the admin fulfilment queue after verified payment.
                </div>

                {error ? <p className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

                <Button
                  className="h-14 w-full rounded-2xl bg-slate-950 text-white hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 hover:text-white"
                  onClick={handlePayment}
                  disabled={!canCheckout || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to Paystack...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Paystack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
