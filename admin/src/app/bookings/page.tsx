"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plane,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { adminApiFetch } from "@/lib/admin-api-client"

type BookingData = {
  id: string
  booking_reference?: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_type: "car" | "jet"
  pickup_date: string
  dropoff_date: string
  pickup_location: string
  dropoff_location: string
  total_amount: number
  status: string
  payment_status: string
  special_requests?: string | null
  created_at: string
  cars?: { name?: string; brand?: string; model?: string }
  jets?: { name?: string; manufacturer?: string; model?: string }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusBadge(status: string) {
  const normalized = status.split("_").join(" ")

  if (status === "approved" || status === "paid_awaiting_fulfilment") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{normalized}</Badge>
  }

  if (status === "payment_pending") {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{normalized}</Badge>
  }

  if (status === "active") {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{normalized}</Badge>
  }

  if (status === "returned") {
    return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">{normalized}</Badge>
  }

  if (status === "completed") {
    return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{normalized}</Badge>
  }

  if (status === "cancelled" || status === "cancel_requested") {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{normalized}</Badge>
  }

  return <Badge variant="outline">{normalized}</Badge>
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState("")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") {
          params.set("status", statusFilter)
        }
        if (paymentFilter !== "all") {
          params.set("paymentStatus", paymentFilter)
        }
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim())
        }

        const query = params.toString()
        const data = await adminApiFetch<BookingData[]>(`/api/admin/bookings${query ? `?${query}` : ""}`)
        setBookings(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    void fetchBookings()
  }, [paymentFilter, searchTerm, statusFilter])

  const stats = useMemo(
    () => ({
      total: bookings.length,
      ready: bookings.filter((booking) => booking.status === "approved" || booking.status === "paid_awaiting_fulfilment").length,
      active: bookings.filter((booking) => booking.status === "active").length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      revenue: bookings
        .filter((booking) => booking.payment_status === "paid")
        .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0),
    }),
    [bookings],
  )

  const handleStatusUpdate = async (bookingId: string, nextStatus: string) => {
    try {
      setUpdatingId(bookingId)
      const updated = await adminApiFetch<BookingData>(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })

      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)))
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Failed to update booking")
    } finally {
      setUpdatingId("")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Live booking records coming from website checkout and verified payments.</p>
        </div>

        {error ? (
          <Card className="rounded-3xl border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Ready</p><p className="text-2xl font-bold">{stats.ready}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold">{stats.active}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold">{stats.completed}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Paid Revenue</p><p className="text-xl font-bold">{formatCurrency(stats.revenue)}</p></CardContent></Card>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setLoading(true)
                  setSearchTerm(event.target.value)
                }}
                placeholder="Search by booking ref, customer, email, car, or location"
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => {
                setLoading(true)
                setStatusFilter(event.target.value)
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="payment_pending">Payment pending</option>
              <option value="approved">Approved</option>
              <option value="paid_awaiting_fulfilment">Paid awaiting fulfilment</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="completed">Completed</option>
              <option value="cancel_requested">Cancel requested</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(event) => {
                setLoading(true)
                setPaymentFilter(event.target.value)
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All payment states</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="pending_verification">Pending verification</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="rounded-3xl">
            <CardContent className="flex h-52 items-center justify-center text-gray-600">
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
              Loading bookings...
            </CardContent>
          </Card>
        ) : null}

        {!loading && bookings.length === 0 ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-gray-500">No bookings matched the current filters.</CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-3xl">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      {booking.booking_reference || booking.id}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">
                      {booking.booking_type === "car"
                        ? [booking.cars?.brand, booking.cars?.model].filter(Boolean).join(" ") || booking.cars?.name || "Car booking"
                        : [booking.jets?.manufacturer, booking.jets?.model].filter(Boolean).join(" ") || booking.jets?.name || "Jet booking"}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{booking.customer_name}</div>
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{booking.customer_email}</div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{booking.customer_phone}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(Number(booking.total_amount || 0))}</p>
                    <p className="text-sm text-gray-500">Created {formatDate(booking.created_at)}</p>
                    <div className="flex flex-wrap justify-end gap-2">
                      {statusBadge(booking.status)}
                      {statusBadge(booking.payment_status)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" />{formatDate(booking.pickup_date)}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" />{formatDate(booking.dropoff_date)}</div>
                  </div>
                  <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{booking.pickup_location}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{booking.dropoff_location}</div>
                  </div>
                </div>

                {booking.special_requests ? (
                  <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-600">
                    <strong className="text-gray-900">Special requests:</strong> {booking.special_requests}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {(booking.status === "approved" || booking.status === "paid_awaiting_fulfilment") && (
                    <Button
                      onClick={() => handleStatusUpdate(booking.id, "active")}
                      disabled={updatingId === booking.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updatingId === booking.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plane className="mr-2 h-4 w-4" />}
                      Start rental
                    </Button>
                  )}

                  {booking.status === "active" && (
                    <Button
                      onClick={() => handleStatusUpdate(booking.id, "returned")}
                      disabled={updatingId === booking.id}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {updatingId === booking.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Car className="mr-2 h-4 w-4" />}
                      Mark returned
                    </Button>
                  )}

                  {booking.status === "returned" && (
                    <Button
                      onClick={() => handleStatusUpdate(booking.id, "completed")}
                      disabled={updatingId === booking.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {updatingId === booking.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Complete booking
                    </Button>
                  )}

                  {booking.status === "payment_pending" && (
                    <div className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">
                      <Clock className="mr-2 h-4 w-4" />
                      Waiting for payment verification
                    </div>
                  )}

                  {booking.payment_status === "failed" && (
                    <div className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm text-red-700">
                      <XCircle className="mr-2 h-4 w-4" />
                      Payment failed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
