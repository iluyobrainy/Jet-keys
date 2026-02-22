"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Car, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plane,
  Eye,
  ArrowRight
} from "lucide-react"
import { useEffect, useState } from "react"
import { analyticsService } from "@/lib/admin-services"
import Link from "next/link"

interface DashboardStats {
  totalCars: number
  totalJets: number
  totalBookings: number
  totalUsers: number
  activeBookings: number
  completedBookings: number
  totalRevenue: number
  failedPayments: number
}

interface RecentBooking {
  id: string
  customer_name: string
  customer_email: string
  booking_type: 'car' | 'jet'
  pickup_date: string
  dropoff_date: string
  total_amount: number
  status: string
  payment_status: string
  cars?: { name: string; brand: string; model: string }
  jets?: { name: string; manufacturer: string; model: string }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getRecentBookings(5)
        ])
        
        setStats(statsData)
        setRecentBookings(bookingsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "active":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "completed":
        return <Badge className="bg-purple-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "refunded":
        return <Badge className="bg-yellow-500"><ArrowRight className="h-3 w-3 mr-1" />Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const statsCards = stats ? [
    {
      title: "Total Cars",
      value: stats.totalCars.toString(),
      change: "+2",
      changeType: "positive",
      icon: Car,
      color: "text-blue-600"
    },
    {
      title: "Total Jets",
      value: stats.totalJets.toString(),
      change: "+1",
      changeType: "positive",
      icon: Plane,
      color: "text-purple-600"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: "+8",
      changeType: "positive",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-orange-600"
    },
    {
      title: "Active Rentals",
      value: stats.activeBookings.toString(),
      change: "+3",
      changeType: "positive",
      icon: CheckCircle,
      color: "text-emerald-600"
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12",
      changeType: "positive",
      icon: Users,
      color: "text-indigo-600"
    }
  ] : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your Jet & Keys business</p>
          </div>
          <div className="flex space-x-3">
            <Button asChild>
              <Link href="/admin/cars/add">
                <Car className="h-4 w-4 mr-2" />
                Add Car
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/bookings">
                <Eye className="h-4 w-4 mr-2" />
                View All Bookings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-600">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/bookings">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">{booking.customer_email}</p>
                        <p className="text-sm text-gray-500">
                          {booking.booking_type === 'car' 
                            ? `${booking.cars?.brand} ${booking.cars?.model}` 
                            : `${booking.jets?.manufacturer} ${booking.jets?.model}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(booking.pickup_date).toLocaleDateString()}
                        </p>
                        <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.payment_status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent bookings found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & System Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/admin/cars/add">
                  <Car className="h-5 w-5 mr-3 text-blue-600" />
                  Add New Car
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/jets/add">
                  <Plane className="h-5 w-5 mr-3 text-purple-600" />
                  Add New Jet
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/bookings">
                  <Calendar className="h-5 w-5 mr-3 text-green-600" />
                  View All Bookings
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="h-5 w-5 mr-3 text-purple-600" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats && stats.failedPayments > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">{stats.failedPayments} failed payments</p>
                    <p className="text-xs text-red-600">Review payment issues</p>
                  </div>
                </div>
              )}
              {stats && stats.activeBookings > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{stats.activeBookings} active rentals</p>
                    <p className="text-xs text-blue-600">Monitor ongoing rentals</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">System running smoothly</p>
                  <p className="text-xs text-green-600">All services operational</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
