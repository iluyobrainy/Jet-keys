import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Check,
  X
} from "lucide-react"
import Link from "next/link"

// Mock data for bookings
const bookings = [
  {
    id: "1",
    customer: "John Doe",
    email: "john@example.com",
    phone: "+234 123 456 7890",
    car: "Toyota Camry",
    car_id: "1",
    start_date: "2024-01-15",
    end_date: "2024-01-17",
    total_price: 75000,
    status: "pending",
    payment_status: "pending",
    pickup_location: "Lagos Airport",
    return_location: "Lagos Airport",
    created_at: "2024-01-10T10:30:00Z"
  },
  {
    id: "2",
    customer: "Jane Smith",
    email: "jane@example.com",
    phone: "+234 987 654 3210",
    car: "BMW 3 Series",
    car_id: "3",
    start_date: "2024-01-14",
    end_date: "2024-01-16",
    total_price: 135000,
    status: "approved",
    payment_status: "paid",
    pickup_location: "Victoria Island",
    return_location: "Victoria Island",
    created_at: "2024-01-09T14:20:00Z"
  },
  {
    id: "3",
    customer: "Mike Johnson",
    email: "mike@example.com",
    phone: "+234 555 123 4567",
    car: "Honda Accord",
    car_id: "2",
    start_date: "2024-01-13",
    end_date: "2024-01-14",
    total_price: 22000,
    status: "completed",
    payment_status: "paid",
    pickup_location: "Abuja City Center",
    return_location: "Abuja City Center",
    created_at: "2024-01-08T09:15:00Z"
  },
  {
    id: "4",
    customer: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "+234 777 888 9999",
    car: "Mercedes C-Class",
    car_id: "4",
    start_date: "2024-01-12",
    end_date: "2024-01-15",
    total_price: 150000,
    status: "cancelled",
    payment_status: "refunded",
    pickup_location: "Port Harcourt",
    return_location: "Port Harcourt",
    created_at: "2024-01-07T16:45:00Z"
  }
]

export default function AdminBookingsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "completed":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "refunded":
        return <Badge className="bg-orange-500">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage all car rental bookings</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search bookings by customer name or car..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Customer and Car Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.customer}</h3>
                          <p className="text-sm text-gray-600">{booking.email}</p>
                          <p className="text-sm text-gray-600">{booking.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.car}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Pickup:</span>
                          <p className="font-medium">{booking.pickup_location}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Return:</span>
                          <p className="font-medium">{booking.return_location}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Price:</span>
                          <p className="font-medium text-blue-600">₦{booking.total_price.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Booked:</span>
                          <p className="font-medium">{formatDate(booking.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.payment_status)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-xl font-bold">89</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold">67</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-bold">10</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
