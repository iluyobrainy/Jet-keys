"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookings, useCancelBooking } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"
import { useAuth } from "@/lib/providers/AuthProvider"
import { formatDate, formatNumber } from "@/lib/formatters"
import type { Booking } from "@/lib/services/apiService"

const statusTheme: Record<string, string> = {
  checkout_draft: "bg-slate-100 text-slate-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  paid_awaiting_fulfilment: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-indigo-100 text-indigo-800",
  completed: "bg-gray-100 text-gray-800",
  cancel_requested: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
}

function getStatusIcon(status: string) {
  switch (status) {
    case "checkout_draft":
      return <FileText className="h-4 w-4" />
    case "payment_pending":
      return <Clock className="h-4 w-4" />
    case "paid_awaiting_fulfilment":
      return <CheckCircle className="h-4 w-4" />
    case "active":
      return <RefreshCw className="h-4 w-4" />
    case "cancel_requested":
      return <AlertCircle className="h-4 w-4" />
    case "cancelled":
      return <X className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

function canCancelBooking(status: string) {
  return ["payment_pending", "paid_awaiting_fulfilment", "pending", "approved"].includes(status)
}

function canRequestRefund(status: string) {
  return ["active", "returned", "completed"].includes(status)
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { loading: authLoading, isAuthenticated } = useAuth()
  const { data: bookings = [], isLoading, refetch } = useBookings("user")
  const cancelBookingMutation = useCancelBooking()
  useRealtimeInvalidation("my-bookings-live", ["bookings", "refund_requests"], [["bookings"], ["refundRequests"]])

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showCancellationLoading, setShowCancellationLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [cancellationError, setCancellationError] = useState("")
  const [cancellationReason, setCancellationReason] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [lastRefundDetails, setLastRefundDetails] = useState<{
    bankName: string
    accountName: string
    accountNumber: string
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=%2Fmy-bookings")
    }
  }, [authLoading, isAuthenticated, router])

  const resetCancellationForm = () => {
    setCancellationError("")
    setCancellationReason("")
    setBankName("")
    setAccountName("")
    setAccountNumber("")
    setSelectedBooking(null)
    setShowCancel(false)
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim() || !bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      setCancellationError("Fill in the reason and refund account details before submitting.")
      return
    }

    try {
      setCancellationError("")
      setLastRefundDetails({
        bankName,
        accountName,
        accountNumber,
      })

      await cancelBookingMutation.mutateAsync({
        bookingId: selectedBooking.id,
        cancellationData: {
          reason: cancellationReason,
          bankName,
          accountName,
          accountNumber,
        },
      })

      setShowCancel(false)
      setShowCancellationLoading(true)
      await new Promise((resolve) => window.setTimeout(resolve, 3000))
      resetCancellationForm()
      refetch()
      setShowCancellationLoading(false)
      setShowSuccess(true)
    } catch (error) {
      setShowCancellationLoading(false)
      setCancellationError(error instanceof Error ? error.message : "Failed to submit cancellation request.")
    }
  }

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900"></div>
            Loading your bookings...
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  return (
    <AuroraBackground className="min-h-screen">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-black">
            My <span className="text-orange-500">Bookings</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Track paid bookings, active rentals, cancellation requests, and completed trips from one place.
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="rounded-[30px] border-0 bg-white/85 shadow-xl">
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold text-slate-950">No bookings yet</h2>
              <p className="mt-3 text-sm text-slate-600">
                Your paid bookings will appear here after checkout.
              </p>
              <Button
                className="mt-6 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => router.push("/cars")}
              >
                Browse cars
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: Booking) => (
              <Card key={booking.id} className="rounded-[30px] border-0 bg-white/88 shadow-xl">
                <CardHeader className="pb-0">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-950">
                        {booking.cars?.name || `${booking.cars?.brand || "Car"} ${booking.cars?.model || ""}`.trim() || "Car booking"}
                      </CardTitle>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {booking.booking_reference || `#${String(booking.id).slice(0, 8).toUpperCase()}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${statusTheme[booking.status] || statusTheme.completed} px-4 py-2 text-sm`}>
                        <span className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          {String(booking.status).replaceAll("_", " ")}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 text-sm capitalize">
                        {String(booking.payment_status).replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] bg-slate-50 p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        <Calendar className="h-4 w-4" />
                        Dates
                      </p>
                      <p className="text-sm font-medium text-slate-900">{formatDate(booking.pickup_date)}</p>
                      <p className="text-sm text-slate-600">to {formatDate(booking.dropoff_date)}</p>
                    </div>
                    <div className="rounded-[24px] bg-slate-50 p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        <MapPin className="h-4 w-4" />
                        Route
                      </p>
                      <p className="text-sm font-medium text-slate-900">{booking.pickup_location}</p>
                      <p className="text-sm text-slate-600">to {booking.dropoff_location}</p>
                    </div>
                    <div className="rounded-[24px] bg-slate-50 p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        <CreditCard className="h-4 w-4" />
                        Amount
                      </p>
                      <p className="text-lg font-bold text-slate-950">NGN {formatNumber(booking.total_amount)}</p>
                      {booking.refund_status ? (
                        <p className="text-xs capitalize text-slate-500">Refund {booking.refund_status.replaceAll("_", " ")}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetails(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </Button>
                    {canCancelBooking(booking.status) || canRequestRefund(booking.status) ? (
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-2xl bg-red-500 text-white hover:bg-red-600"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowCancel(true)
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {canCancelBooking(booking.status) ? "Cancel booking" : "Request refund review"}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Booking details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Booking reference</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedBooking.booking_reference || selectedBooking.id}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Customer</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedBooking.customer_name}</p>
                  <p className="text-sm text-slate-600">{selectedBooking.customer_email}</p>
                  <p className="text-sm text-slate-600">{selectedBooking.customer_phone}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-blue-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-600">Pickup</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedBooking.pickup_location}</p>
                  <p className="text-sm text-slate-600">{formatDate(selectedBooking.pickup_date)}</p>
                </div>
                <div className="rounded-[24px] bg-blue-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-600">Return</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedBooking.dropoff_location}</p>
                  <p className="text-sm text-slate-600">{formatDate(selectedBooking.dropoff_date)}</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Payment</p>
                <p className="mt-2 text-xl font-bold text-slate-950">NGN {formatNumber(selectedBooking.total_amount)}</p>
                <p className="mt-1 text-sm capitalize text-slate-600">
                  {selectedBooking.payment_status?.replaceAll("_", " ")}
                </p>
              </div>

              {selectedBooking.bank_name || selectedBooking.refund_status ? (
                <div className="rounded-[24px] bg-red-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-red-600">Refund details</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedBooking.bank_name || "Bank not supplied"} - {selectedBooking.account_name || "Account name pending"} ({selectedBooking.account_number || "Account number pending"})
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-600">
                    {selectedBooking.refund_status?.replaceAll("_", " ") || "Awaiting review"}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showCancel && selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl rounded-[30px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cancel booking</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetCancellationForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {canCancelBooking(selectedBooking.status)
                  ? "Direct cancellation is only available before the rental starts. This request will be logged for refund review."
                  : "This rental has already started or completed. Your request will be sent for refund review instead of direct cancellation."}
              </div>
              {cancellationError ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {cancellationError}
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Reason for cancellation</label>
                <textarea
                  value={cancellationReason}
                  onChange={(event) => setCancellationReason(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  placeholder="Tell us why you need to cancel."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Bank name</label>
                  <input
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-400"
                    placeholder="e.g. GTBank"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Account name</label>
                  <input
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-400"
                    placeholder="Account holder name"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-900">Account number</label>
                  <input
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-400"
                    placeholder="10-digit account number"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={resetCancellationForm}>
                  Keep booking
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-2xl bg-red-500 text-white hover:bg-red-600"
                  onClick={handleCancelBooking}
                  disabled={cancelBookingMutation.isPending}
                >
                  Submit cancellation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showCancellationLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-[30px]">
            <CardContent className="space-y-4 p-8 text-center">
              <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-slate-200"></div>
              <div className="space-y-2">
                <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-200"></div>
                <div className="mx-auto h-3 w-52 animate-pulse rounded bg-slate-100"></div>
                <div className="mx-auto h-3 w-36 animate-pulse rounded bg-slate-100"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md rounded-[30px]">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-950">Cancellation request submitted</h2>
              <p className="mt-3 text-sm text-slate-600">
                Your refund review is now pending. The destination account stored for this request is shown below.
              </p>
              <div className="mt-6 rounded-[24px] bg-blue-50 p-4 text-left text-sm text-blue-900">
                <p><strong>Bank:</strong> {lastRefundDetails?.bankName || "Not supplied"}</p>
                <p><strong>Account:</strong> {lastRefundDetails?.accountName || "Not supplied"} ({lastRefundDetails?.accountNumber || "Not supplied"})</p>
                <p><strong>Processing time:</strong> 4 working days</p>
              </div>
              <Button className="mt-6 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => setShowSuccess(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <FooterSection />
    </AuroraBackground>
  )
}
