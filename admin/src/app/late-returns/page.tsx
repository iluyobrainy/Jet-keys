"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Send,
  Calendar,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  X
} from "lucide-react"
import { useEffect, useState } from "react"
import { lateReturnService } from "@/lib/admin-services"

interface LateReturnBooking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_date: string
  dropoff_date: string
  actual_dropoff_date?: string
  actual_dropoff_time?: string
  late_return_fee: number
  late_return_hours: number
  late_return_reason?: string
  late_return_processed_date?: string
  late_return_processed_by?: string
  late_return_notification_sent: boolean
  late_return_notification_date?: string
  cars?: {
    name: string
    brand: string
    model: string
  }
  jets?: {
    name: string
    manufacturer: string
    model: string
  }
}

interface LateReturnStats {
  totalLateReturns: number
  pendingNotifications: number
  totalLateReturnFees: number
  averageLateReturnFee: number
}

export default function LateReturnPage() {
  const [bookings, setBookings] = useState<LateReturnBooking[]>([])
  const [stats, setStats] = useState<LateReturnStats>({
    totalLateReturns: 0,
    pendingNotifications: 0,
    totalLateReturnFees: 0,
    averageLateReturnFee: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<LateReturnBooking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  
  // Form states for recording actual dropoff
  const [actualDropoffDate, setActualDropoffDate] = useState("")
  const [actualDropoffTime, setActualDropoffTime] = useState("")
  const [lateReturnReason, setLateReturnReason] = useState("")
  
  // Form states for processing fee
  const [processedAmount, setProcessedAmount] = useState("")
  const [processedBy, setProcessedBy] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookingsData, statsData] = await Promise.all([
        lateReturnService.getLateReturnBookings(),
        lateReturnService.getLateReturnStats()
      ])
      setBookings(bookingsData as any)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching late return data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordActualDropoff = async () => {
    if (!selectedBooking || !actualDropoffDate) return
    
    try {
      await lateReturnService.recordActualDropoff(
        selectedBooking.id,
        actualDropoffDate,
        actualDropoffTime || undefined,
        lateReturnReason || undefined
      )
      
      setShowRecordModal(false)
      setSelectedBooking(null)
      setActualDropoffDate("")
      setActualDropoffTime("")
      setLateReturnReason("")
      fetchData()
    } catch (error) {
      console.error('Error recording actual dropoff:', error)
      alert('Failed to record actual dropoff')
    }
  }

  const handleProcessFee = async () => {
    if (!selectedBooking || !processedBy) return
    
    try {
      await lateReturnService.processLateReturnFee(
        selectedBooking.id,
        processedBy,
        processedAmount ? parseFloat(processedAmount) : undefined
      )
      
      setShowProcessModal(false)
      setSelectedBooking(null)
      setProcessedAmount("")
      setProcessedBy("")
      fetchData()
    } catch (error) {
      console.error('Error processing late return fee:', error)
      alert('Failed to process late return fee')
    }
  }

  const handleMarkNotificationSent = async (bookingId: string) => {
    try {
      await lateReturnService.markNotificationSent(bookingId)
      fetchData()
    } catch (error) {
      console.error('Error marking notification as sent:', error)
      alert('Failed to mark notification as sent')
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVehicleName = (booking: LateReturnBooking) => {
    if (booking.cars) {
      return `${booking.cars.brand} ${booking.cars.model}`
    }
    if (booking.jets) {
      return `${booking.jets.manufacturer} ${booking.jets.model}`
    }
    return 'Unknown Vehicle'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading late return data...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Late Return Fees</h1>
            <p className="text-gray-600">Manage late return fees and notifications</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Late Returns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLateReturns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingNotifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 text-green-600 flex items-center justify-center text-xl font-bold">₦</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalLateReturnFees)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Fee</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageLateReturnFee)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Late Return Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Late Return Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Late Returns</h3>
                <p className="text-gray-600">No bookings with late return fees found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getVehicleName(booking)}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {booking.late_return_hours.toFixed(1)}h late
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{booking.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Scheduled: {formatDate(booking.dropoff_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Actual: {booking.actual_dropoff_date ? formatDate(booking.actual_dropoff_date) : 'Not recorded'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-lg text-red-600">{formatCurrency(booking.late_return_fee)}</p>
                          <p className="text-sm text-gray-500">Late Return Fee</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowDetailsModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {!booking.late_return_notification_sent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkNotificationSent(booking.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Late Return Details
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{selectedBooking.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{selectedBooking.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedBooking.customer_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{getVehicleName(selectedBooking)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Dates */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Dates</h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-green-700">Pickup Date:</span>
                          <p className="font-medium text-green-900">{formatDate(selectedBooking.pickup_date)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-green-700">Scheduled Return:</span>
                          <p className="font-medium text-green-900">{formatDate(selectedBooking.dropoff_date)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-green-700">Actual Return:</span>
                          <p className="font-medium text-green-900">
                            {selectedBooking.actual_dropoff_date ? formatDate(selectedBooking.actual_dropoff_date) : 'Not recorded'}
                          </p>
                        </div>
                        {selectedBooking.actual_dropoff_time && (
                          <div>
                            <span className="text-sm text-green-700">Actual Return Time:</span>
                            <p className="font-medium text-green-900">{selectedBooking.actual_dropoff_time}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Late Return Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Late Return Details</h3>
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-red-700">Hours Late:</span>
                          <p className="font-bold text-red-900 text-lg">{selectedBooking.late_return_hours.toFixed(1)} hours</p>
                        </div>
                        <div>
                          <span className="text-sm text-red-700">Late Return Fee:</span>
                          <p className="font-bold text-red-900 text-lg">{formatCurrency(selectedBooking.late_return_fee)}</p>
                        </div>
                        {selectedBooking.late_return_reason && (
                          <div className="md:col-span-2">
                            <span className="text-sm text-red-700">Reason:</span>
                            <p className="font-medium text-red-900">{selectedBooking.late_return_reason}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-red-700">Notification Sent:</span>
                          <p className="font-medium text-red-900">
                            {selectedBooking.late_return_notification_sent ? 'Yes' : 'No'}
                          </p>
                        </div>
                        {selectedBooking.late_return_processed_date && (
                          <div>
                            <span className="text-sm text-red-700">Processed Date:</span>
                            <p className="font-medium text-red-900">{formatDate(selectedBooking.late_return_processed_date)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Modal Footer */}
              <div className="border-t bg-white p-6 flex-shrink-0">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                  {!selectedBooking.late_return_notification_sent && (
                    <Button
                      onClick={() => handleMarkNotificationSent(selectedBooking.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Mark Notification Sent
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
