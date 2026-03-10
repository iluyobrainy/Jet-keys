"use client"

import { useEffect, useState } from "react"
import { BarChart3, Car, CreditCard, Plane, RefreshCw, ShieldCheck } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminApiFetch } from "@/lib/admin-api-client"

type FinanceData = {
  totalRevenue: number
  monthlyRevenue: number
  carRevenue: number
  jetRevenue: number
  totalBookings: number
  successfulBookings: number
  failedBookings: number
  averageBookingValue: number
  topPerformingVehicles: Array<{
    name: string
    revenue: number
    bookings: number
    type: "car" | "jet"
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const data = await adminApiFetch<FinanceData>(`/api/admin/finance?days=${timeRange}`)
        setFinanceData(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load finance data")
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    void fetchFinanceData()
  }, [timeRange])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
            <p className="text-gray-600">Revenue and payment analytics sourced from verified booking and Paystack data.</p>
          </div>
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
          </select>
        </div>

        {loading ? (
          <Card className="rounded-3xl">
            <CardContent className="flex h-64 items-center justify-center text-gray-600">
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
              Loading finance data...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="rounded-3xl border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        {!loading && financeData ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-3xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(financeData.totalRevenue)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(financeData.monthlyRevenue)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-gray-500">Successful Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{financeData.successfulBookings}</p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-purple-600" />
                </CardContent>
              </Card>
              <Card className="rounded-3xl">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-gray-500">Average Booking</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(financeData.averageBookingValue)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <Car className="h-7 w-7 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Car Rentals</p>
                        <p className="text-sm text-gray-500">Paid car bookings</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(financeData.carRevenue)}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-purple-50 p-4">
                    <div className="flex items-center gap-3">
                      <Plane className="h-7 w-7 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Jet Charters</p>
                        <p className="text-sm text-gray-500">Paid jet bookings</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(financeData.jetRevenue)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Paystack Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financeData.paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500">No verified payment channel data yet.</p>
                  ) : (
                    financeData.paymentMethods.map((method) => (
                      <div key={method.method} className="flex items-center justify-between rounded-2xl border p-4">
                        <div>
                          <p className="font-medium text-gray-900">{method.method}</p>
                          <p className="text-sm text-gray-500">{method.count} successful payments</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(method.amount)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financeData.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between rounded-2xl border p-4">
                      <div>
                        <p className="font-medium text-gray-900">{trend.month}</p>
                        <p className="text-sm text-gray-500">{trend.bookings} payments</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(trend.revenue)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Top Performing Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financeData.topPerformingVehicles.length === 0 ? (
                    <p className="text-sm text-gray-500">No vehicle performance data yet.</p>
                  ) : (
                    financeData.topPerformingVehicles.map((vehicle) => (
                      <div key={`${vehicle.type}-${vehicle.name}`} className="flex items-center justify-between rounded-2xl border p-4">
                        <div className="flex items-center gap-3">
                          {vehicle.type === "car" ? <Car className="h-6 w-6 text-blue-600" /> : <Plane className="h-6 w-6 text-purple-600" />}
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.name}</p>
                            <p className="text-sm text-gray-500">{vehicle.bookings} paid bookings</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(vehicle.revenue)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}
