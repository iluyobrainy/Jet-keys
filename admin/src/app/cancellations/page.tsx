// admin/src/app/cancellations/page.tsx
"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cancellationService } from "@/lib/admin-services"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  User, 
  Calendar,
  MapPin,
  Car,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  Copy
} from "lucide-react"

interface CancelledBooking {
  id: string
  car_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_location: string
  dropoff_location: string
  pickup_date: string
  dropoff_date: string
  total_amount: number
  cancellation_reason: string
  cancellation_date: string
  refund_amount: number
  refund_status: 'pending' | 'processed' | 'failed'
  bank_name: string
  account_name: string
  account_number: string
  refund_processed_date?: string
  refund_processed_by?: string
  refund_reference?: string
  cars?: {
    name: string
    brand: string
    model: string
  }
}

export default function CancellationsPage() {
  const [cancelledBookings, setCancelledBookings] = useState<CancelledBooking[]>([])
  const [stats, setStats] = useState({
    pendingRefunds: 0,
    processedRefunds: 0,
    failedRefunds: 0,
    totalRefundAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<CancelledBooking | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [refundReference, setRefundReference] = useState("")
  const [processedBy, setProcessedBy] = useState("")

  // Fetch cancelled bookings
  const fetchCancelledBookings = async () => {
    try {
      setLoading(true)
      const [bookings, statistics] = await Promise.all([
        cancellationService.getCancelledBookings(),
        cancellationService.getCancellationStats()
      ])
      setCancelledBookings(bookings as any)
      setStats(statistics)
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCancelledBookings()
  }, [])

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { showDetailsModal, selectedBooking: selectedBooking?.id })
  }, [showDetailsModal, selectedBooking])

  // Process refund
  const handleProcessRefund = async (bookingId: string) => {
    if (!refundReference.trim() || !processedBy.trim()) {
      alert('Please fill in refund reference and processed by fields')
      return
    }

    try {
      await cancellationService.processRefund(bookingId, processedBy, refundReference)
      
      // TODO: Add email notification here
      // await emailService.sendRefundProcessed(selectedBooking)
      
      setShowProcessModal(false)
      setRefundReference("")
      setProcessedBy("")
      setSelectedBooking(null)
      fetchCancelledBookings()
      alert('✅ Refund processed successfully!\n\nCustomer will receive confirmation email.\n\nNext: Complete manual bank transfer.')
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('❌ Failed to process refund. Please try again.')
    }
  }

  // Filter bookings
  const filteredBookings = cancelledBookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.cars?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || booking.refund_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cancellation Management</h1>
          <p className="text-gray-600 mt-1">Manage cancelled bookings and process refunds</p>
        </div>
        <Button onClick={fetchCancelledBookings} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingRefunds}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Processed Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.processedRefunds}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Failed Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.failedRefunds}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Refund Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{stats.totalRefundAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, email, car, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancelled Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.cars?.name || 'Unknown Car'}
                    </h3>
                    <Badge className={getStatusColor(booking.refund_status)}>
                      {getStatusIcon(booking.refund_status)}
                      <span className="ml-1 capitalize">{booking.refund_status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{booking.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Cancelled: {new Date(booking.cancellation_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.pickup_location} → {booking.dropoff_location}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Refund: ₦{booking.refund_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{booking.bank_name} - {booking.account_name} ({booking.account_number})</span>
                      </div>
                      <div className="text-gray-500">
                        <span className="font-medium">Reason:</span> {booking.cancellation_reason}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('View Details clicked for booking:', booking.id)
                      setSelectedBooking(booking)
                      setShowDetailsModal(true)
                      console.log('Modal state set to true')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {booking.refund_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowProcessModal(true)
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Process Refund
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Refund Modal */}
      {showProcessModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Process Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {selectedBooking.customer_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Refund Amount:</strong> ₦{selectedBooking.refund_amount?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Bank:</strong> {selectedBooking.bank_name} - {selectedBooking.account_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Account:</strong> 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs ml-1">
                    {selectedBooking.account_number}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedBooking.account_number || '')
                      alert('Account number copied!')
                    }}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reference *
                </label>
                <Input
                  value={refundReference}
                  onChange={(e) => setRefundReference(e.target.value)}
                  placeholder="e.g., REF-2024-001, Transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processed By *
                </label>
                <Input
                  value={processedBy}
                  onChange={(e) => setProcessedBy(e.target.value)}
                  placeholder="Admin name or ID"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowProcessModal(false)
                    setSelectedBooking(null)
                    setRefundReference("")
                    setProcessedBy("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleProcessRefund(selectedBooking.id)}
                  disabled={!refundReference.trim() || !processedBy.trim()}
                >
                  Process Refund
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Booking Details - {selectedBooking.cars?.name || 'Unknown Car'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-6">
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedBooking.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.customer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedBooking.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Car:</span>
                      <span className="font-medium">{selectedBooking.cars?.name || 'Unknown Car'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Location:</span>
                      <span className="font-medium">{selectedBooking.pickup_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Drop-off Location:</span>
                      <span className="font-medium">{selectedBooking.dropoff_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Date:</span>
                      <span className="font-medium">{new Date(selectedBooking.pickup_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-medium">{new Date(selectedBooking.dropoff_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">₦{selectedBooking.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Information</h3>
                  <div className="bg-red-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancellation Date:</span>
                      <span className="font-medium">{selectedBooking.cancellation_date ? new Date(selectedBooking.cancellation_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{selectedBooking.cancellation_reason || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="font-medium text-green-600">₦{selectedBooking.refund_amount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Status:</span>
                      <Badge className={getStatusColor(selectedBooking.refund_status || 'pending')}>
                        {getStatusIcon(selectedBooking.refund_status || 'pending')}
                        <span className="ml-1 capitalize">{selectedBooking.refund_status || 'pending'}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Bank Details</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">{selectedBooking.bank_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">{selectedBooking.account_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {selectedBooking.account_number || 'N/A'}
                        </span>
                        {selectedBooking.account_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedBooking.account_number || '')
                              alert('Account number copied to clipboard!')
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Information (if processed) */}
                {selectedBooking.refund_status === 'processed' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing Information</h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed Date:</span>
                        <span className="font-medium">{selectedBooking.refund_processed_date ? new Date(selectedBooking.refund_processed_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed By:</span>
                        <span className="font-medium">{selectedBooking.refund_processed_by || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Reference:</span>
                        <span className="font-medium">{selectedBooking.refund_reference || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            {/* Modal Footer */}
            <div className="border-t bg-white p-6 flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedBooking(null)
                  }}
                >
                  Close
                </Button>
                {selectedBooking.refund_status === 'pending' && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowProcessModal(true)
                    }}
                  >
                    Process Refund
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
