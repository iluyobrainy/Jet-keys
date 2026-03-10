"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle,
  CreditCard,
  Eye,
  Plane,
  RefreshCw,
  Users,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminApiFetch } from "@/lib/admin-api-client"

type DashboardStats = {
  totalCars: number
  totalJets: number
  totalUsers: number
  totalBookings: number
  readyBookings: number
  activeBookings: number
  completedBookings: number
  failedPayments: number
  totalRevenue: number
  successfulPayments: number
}

type RecentBooking = {
  id: string
  booking_reference?: string | null
  customer_name: string
  customer_email: string
  booking_type: "car" | "jet"
  pickup_date: string
  dropoff_date: string
  total_amount: number
  status: string
  payment_status: string
  cars?: { name?: string; brand?: string; model?: string }
  jets?: { name?: string; manufacturer?: string; model?: string }
}

type RecentPayment = {
  id: string
  booking_id: string
  provider_reference: string
  amount: number
  status: string
  channel?: string | null
  created_at: string
  booking?: {
    booking_reference?: string | null
    customer_name?: string | null
  } | null
}

type DashboardResponse = {
  stats: DashboardStats
  recentBookings: RecentBooking[]
  recentPayments: RecentPayment[]
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
  })
}

function getStatusBadge(status: string) {
  const normalized = status.split("_").join(" ")

  if (status === "approved" || status === "paid_awaiting_fulfilment") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{normalized}</Badge>
  }

  if (status === "active") {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{normalized}</Badge>
  }

  if (status === "completed") {
    return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{normalized}</Badge>
  }

  if (status === "payment_pending") {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{normalized}</Badge>
  }

  return <Badge variant="outline">{normalized}</Badge>
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApiFetch<DashboardResponse>("/api/admin/dashboard")
        setDashboard(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    void fetchDashboard()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !dashboard) {
    return (
      <AdminLayout>
        <Card className="rounded-3xl border-red-200 bg-red-50">
          <CardContent className="p-6 text-sm text-red-700">{error || "Failed to load dashboard"}</CardContent>
        </Card>
      </AdminLayout>
    )
  }

  const { stats, recentBookings, recentPayments } = dashboard
  const statCards = [
    {
      title: "Cars",
      value: stats.totalCars,
      subtitle: "Fleet listed on the platform",
      icon: Car,
      color: "text-blue-600",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      subtitle: "Registered customer accounts",
      icon: Users,
      color: "text-indigo-600",
    },
    {
      title: "Paid Bookings",
      value: stats.successfulPayments,
      subtitle: `${stats.readyBookings} ready for fulfilment`,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtitle: "Verified payment total from Paystack",
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      title: "Active Rentals",
      value: stats.activeBookings,
      subtitle: `${stats.completedBookings} completed so far`,
      icon: Calendar,
      color: "text-sky-600",
    },
    {
      title: "Jets",
      value: stats.totalJets,
      subtitle: `${stats.failedPayments} failed payments to review`,
      icon: Plane,
      color: "text-purple-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Live fleet, customer, booking, and Paystack payment activity.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/cars/add">
                <Car className="mr-2 h-4 w-4" />
                Add Car
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bookings">
                <Eye className="mr-2 h-4 w-4" />
                View Bookings
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <Card key={card.title} className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="mt-2 text-sm text-gray-500">{card.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/bookings">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No live bookings available yet.</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          {booking.booking_reference || booking.id}
                        </p>
                        <p className="mt-2 font-semibold text-gray-900">
                          {booking.booking_type === "car"
                            ? [booking.cars?.brand, booking.cars?.model].filter(Boolean).join(" ") || booking.cars?.name
                            : [booking.jets?.manufacturer, booking.jets?.model].filter(Boolean).join(" ") || booking.jets?.name}
                        </p>
                        <p className="text-sm text-gray-600">{booking.customer_name}</p>
                        <p className="text-sm text-gray-500">{booking.customer_email}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(Number(booking.total_amount || 0))}</p>
                        <p className="text-sm text-gray-500">{formatDate(booking.pickup_date)}</p>
                        <div className="flex flex-wrap justify-end gap-2">
                          {getStatusBadge(booking.status)}
                          {getStatusBadge(booking.payment_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Paystack Payments</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/finance">
                  Open finance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No payment activity has been recorded yet.</p>
              ) : (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          {payment.booking?.booking_reference || payment.provider_reference}
                        </p>
                        <p className="mt-2 font-semibold text-gray-900">
                          {payment.booking?.customer_name || "Linked booking"}
                        </p>
                        <p className="text-sm text-gray-500">{payment.channel || "Paystack"}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(Number(payment.amount || 0))}</p>
                        <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
