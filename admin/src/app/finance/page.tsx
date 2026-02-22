"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Car,
  Plane,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { useEffect, useState } from "react"
import { analyticsService } from "@/lib/admin-services"

interface FinanceData {
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
    type: 'car' | 'jet'
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

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        console.log('🔍 Fetching finance data for', timeRange, 'days')
        const data = await analyticsService.getFinanceAnalytics(parseInt(timeRange))
        console.log('📊 Finance data received:', data)
        setFinanceData(data)
      } catch (error) {
        console.error('❌ Error fetching finance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading finance data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!financeData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No finance data available</h3>
          <p className="text-gray-600 mb-4">No bookings found in the last {timeRange} days</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Check if bookings exist in the database</p>
            <p>• Try selecting a longer time range</p>
            <p>• Verify booking data has proper total_amount values</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance & Analytics</h1>
            <p className="text-gray-600">Track revenue, bookings, and business performance</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(financeData.totalRevenue)}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5% from last period
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">₦</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(financeData.monthlyRevenue)}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.2% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(financeData.totalBookings)}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15.3% from last period
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(financeData.averageBookingValue)}
                  </p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    -2.1% from last period
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Car className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Car Rentals</p>
                      <p className="text-sm text-gray-600">Vehicle rentals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(financeData.carRevenue)}</p>
                    <p className="text-sm text-gray-600">
                      {((financeData.carRevenue / financeData.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Jet Charters</p>
                      <p className="text-sm text-gray-600">Private jet rentals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(financeData.jetRevenue)}</p>
                    <p className="text-sm text-gray-600">
                      {((financeData.jetRevenue / financeData.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Successful</p>
                      <p className="text-sm text-gray-600">Completed bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatNumber(financeData.successfulBookings)}</p>
                    <p className="text-sm text-gray-600">
                      {((financeData.successfulBookings / financeData.totalBookings) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium">Failed</p>
                      <p className="text-sm text-gray-600">Cancelled/failed bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatNumber(financeData.failedBookings)}</p>
                    <p className="text-sm text-gray-600">
                      {((financeData.failedBookings / financeData.totalBookings) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financeData.topPerformingVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {vehicle.type === 'car' ? (
                        <Car className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Plane className="h-6 w-6 text-purple-600" />
                      )}
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">{vehicle.bookings} bookings</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(vehicle.revenue)}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {financeData.paymentMethods.map((method, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <p className="font-medium">{method.method}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{formatCurrency(method.amount)}</p>
                    <p className="text-sm text-gray-600">{method.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financeData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{trend.month}</p>
                    <p className="text-sm text-gray-600">{trend.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(trend.revenue)}</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(trend.revenue / Math.max(...financeData.monthlyTrends.map(t => t.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

