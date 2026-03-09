"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Calendar, Car, CreditCard, Loader2, Truck, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { useAdminCars, useAdminUsers, useBookings, useRefundRequests } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"

export default function AdminDashboard() {
  const { data: cars = [], isLoading: carsLoading } = useAdminCars()
  const { data: users = [], isLoading: usersLoading } = useAdminUsers()
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings("admin")
  const { data: refundRequests = [], isLoading: refundsLoading } = useRefundRequests("admin")

  useRealtimeInvalidation("admin-dashboard-live", ["cars", "bookings", "refund_requests", "users"], [["adminCars"], ["bookings"], ["refundRequests"], ["adminUsers"]])

  const loading = carsLoading || usersLoading || bookingsLoading || refundsLoading

  const stats = useMemo(() => {
    const revenue = bookings
      .filter((booking) => booking.payment_status === "paid" || booking.payment_status === "refunded")
      .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0)

    return {
      cars: cars.length,
      users: users.length,
      paidAwaiting: bookings.filter((booking) => booking.status === "paid_awaiting_fulfilment").length,
      active: bookings.filter((booking) => booking.status === "active").length,
      refunds: refundRequests.filter((request) => String(request.status) !== "processed").length,
      revenue,
    }
  }, [bookings, cars.length, refundRequests, users.length])

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
            <p className="text-sm text-slate-600">Realtime overview of the cars-first booking lifecycle.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/admin/cars/add">Add car</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/admin/bookings">Open bookings</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Fleet size", value: stats.cars, icon: Car },
            { label: "Customers", value: stats.users, icon: Users },
            { label: "Paid awaiting fulfilment", value: stats.paidAwaiting, icon: CreditCard },
            { label: "Active rentals", value: stats.active, icon: Truck },
            { label: "Open refunds", value: stats.refunds, icon: Calendar },
            { label: "Captured revenue", value: formatCurrency(stats.revenue), icon: CreditCard },
          ].map((item) => (
            <Card key={item.label} className="rounded-[24px] border-slate-200">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-950">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent paid bookings</CardTitle>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/admin/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="rounded-[20px] bg-slate-50 p-5 text-sm text-slate-500">No paid bookings are available yet.</div>
            ) : null}

            {recentBookings.map((booking) => (
              <div key={booking.id} className="rounded-[24px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{booking.booking_reference || booking.id}</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-950">{booking.customer_name}</h2>
                    <p className="text-sm text-slate-500">{booking.cars?.name || `${booking.cars?.brand || "Car"} ${booking.cars?.model || ""}`.trim()}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 lg:text-right">
                    <p>{formatDate(booking.pickup_date)} to {formatDate(booking.dropoff_date)}</p>
                    <p>{booking.pickup_location} to {booking.dropoff_location}</p>
                    <p className="font-semibold text-slate-950">{formatCurrency(Number(booking.total_amount || 0))}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

