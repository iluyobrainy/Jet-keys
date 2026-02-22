// app/my-bookings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Car, 
  CreditCard, 
  X, 
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  CalendarDays,
  Navigation as NavigationIcon,
  FileText,
  ChevronRight,
  Star,
  Shield,
  Zap
} from "lucide-react"
import { useBookings, useCancelBooking } from "@/lib/hooks/useApi"
import { formatDate, formatNumber } from "@/lib/formatters"

export default function MyBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // For now, we'll show all bookings (in a real app, this would be user-specific)
  // Later we'll implement proper user authentication
  const { data: bookings, isLoading, refetch } = useBookings("all")
  const cancelBookingMutation = useCancelBooking()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'active': return <Car className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const canCancel = (booking: any) => {
    return ['pending', 'confirmed'].includes(booking.status)
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim() || !bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      alert('Please fill in all cancellation details including bank information')
      return
    }

    try {
      await cancelBookingMutation.mutateAsync({
        bookingId: selectedBooking.id,
        cancellationData: {
          reason: cancellationReason,
          bankName: bankName,
          accountName: accountName,
          accountNumber: accountNumber
        }
      })

      // Reset form
      setCancellationReason("")
      setBankName("")
      setAccountName("")
      setAccountNumber("")
      setShowCancelModal(false)
      setSelectedBooking(null)
      
      // Refresh bookings
      refetch()
      
      // Show success modal
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Cancellation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Failed to cancel booking: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading your bookings...</span>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  return (
    <AuroraBackground className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center lg:text-left">
          <div className="inline-block">
            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
              My <span className="text-orange-500">Bookings</span>
            </h1>
            <div className="w-24 h-1 bg-orange-500 mx-auto lg:mx-0 mb-4"></div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto lg:mx-0">
            Manage your car rental bookings and track your journey with us
          </p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your journey by exploring our premium car collection and make your first booking.
              </p>
              <Button 
                onClick={() => window.location.href = '/cars'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Car className="h-5 w-5 mr-2" />
                Browse Available Cars
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {booking.cars?.name || 'Car Booking'}
                          </CardTitle>
                          <p className="text-sm text-gray-500 font-mono">
                            #{booking.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`${getStatusColor(booking.status)} px-4 py-2 text-sm font-semibold`}>
                        <span className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </Badge>
                      {booking.status === 'cancelled' && booking.refund_status && (
                        <Badge className={`${booking.refund_status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-3 py-1 text-xs`}>
                          <span className="flex items-center gap-1">
                            {booking.refund_status === 'processed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            Refund {booking.refund_status}
                          </span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Trip Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Trip Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                            <p className="font-semibold text-gray-900">{formatDate(booking.pickup_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
                            <p className="font-semibold text-gray-900">{formatDate(booking.dropoff_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <NavigationIcon className="h-4 w-4 text-orange-500" />
                        Locations
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                            <p className="font-semibold text-gray-900">{booking.pickup_location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
                            <p className="font-semibold text-gray-900">{booking.dropoff_location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <span className="text-orange-500 font-bold text-lg">₦</span>
                        Payment
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                            <p className="font-bold text-lg text-gray-900">₦{formatNumber(booking.total_amount)}</p>
                          </div>
                        </div>
                        {booking.cancellation_fee > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <X className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Cancellation Fee</p>
                              <p className="font-semibold text-red-600">₦{formatNumber(booking.cancellation_fee)}</p>
                            </div>
                          </div>
                        )}
                        {booking.refund_amount > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <RefreshCw className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Refund Amount</p>
                              <p className="font-semibold text-green-600">₦{formatNumber(booking.refund_amount)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-200"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetailsModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {canCancel(booking) && (
                      <Button 
                        variant="destructive" 
                        className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-105"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowCancelModal(true)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            console.log('Backdrop clicked')
            setShowCancelModal(false)
            setSelectedBooking(null)
            setCancellationReason("")
            setBankName("")
            setAccountName("")
            setAccountNumber("")
          }
        }}>
          <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-red-600">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Cancel Booking
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('Close button clicked')
                    setShowCancelModal(false)
                    setSelectedBooking(null)
                    setCancellationReason("")
                    setBankName("")
                    setAccountName("")
                    setAccountNumber("")
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col flex-1 overflow-hidden">
              <CardContent className="space-y-4 overflow-y-auto flex-1 p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-yellow-700">
                  Cancellation fee: 10% of total amount<br/>
                  Refund amount: 90% of total amount
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Total Amount:</span>
                  <span>₦{formatNumber(selectedBooking.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cancellation Fee (10%):</span>
                  <span className="text-red-600">₦{formatNumber(selectedBooking.total_amount * 0.1)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Refund Amount:</span>
                  <span className="text-green-600">₦{formatNumber(selectedBooking.total_amount * 0.9)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please tell us why you're cancelling..."
                />
              </div>

              {/* Bank Details Section */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Refund Bank Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Access Bank, GTBank, First Bank"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Account holder's name as it appears on bank records"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10-digit account number"
                      maxLength={10}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Refund Information:</strong> Refunds will be processed within 4 working days to the bank account provided above. 
                    A cancellation fee may apply based on our refund policy.
                  </p>
                </div>
              </div>
              </CardContent>
              
              {/* Sticky Footer */}
              <div className="border-t bg-white p-6 flex-shrink-0">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      console.log('Keep Booking button clicked')
                      setShowCancelModal(false)
                      setSelectedBooking(null)
                      setCancellationReason("")
                      setBankName("")
                      setAccountName("")
                      setAccountNumber("")
                    }}
                  >
                    Keep Booking
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleCancelBooking}
                    disabled={!cancellationReason.trim() || !bankName.trim() || !accountName.trim() || !accountNumber.trim() || cancelBookingMutation.isPending}
                  >
                    {cancelBookingMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Booking Cancelled Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your refund has been processed and will be credited to your bank account within 4 working days.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Refund Details:</strong><br/>
                    • Amount will be credited to: {bankName}<br/>
                    • Account: {accountName} ({accountNumber})<br/>
                    • Processing time: 4 working days
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Thank you for choosing Jet & Keys! We appreciate your business.
                </p>
              </div>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Booking Details
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedBooking(null)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="overflow-y-auto flex-1 p-6">
              <div className="space-y-6">
                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Booking ID:</span>
                        <p className="font-medium">{selectedBooking.id}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedBooking.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(selectedBooking.status)}
                              {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Vehicle:</span>
                        <p className="font-medium">{selectedBooking.cars?.name || 'Car Details Not Available'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Customer:</span>
                        <p className="font-medium">{selectedBooking.customer_name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trip Details</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-blue-700">Pickup Date:</span>
                        <p className="font-medium text-blue-900">{formatDate(selectedBooking.pickup_date)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700">Return Date:</span>
                        <p className="font-medium text-blue-900">{formatDate(selectedBooking.dropoff_date)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700">Pickup Location:</span>
                        <p className="font-medium text-blue-900">{selectedBooking.pickup_location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-blue-700">Return Location:</span>
                        <p className="font-medium text-blue-900">{selectedBooking.dropoff_location}</p>
                      </div>
                      {selectedBooking.pickup_time && (
                        <div>
                          <span className="text-sm text-blue-700">Pickup Time:</span>
                          <p className="font-medium text-blue-900">{selectedBooking.pickup_time}</p>
                        </div>
                      )}
                      {selectedBooking.dropoff_time && (
                        <div>
                          <span className="text-sm text-blue-700">Return Time:</span>
                          <p className="font-medium text-blue-900">{selectedBooking.dropoff_time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-green-700">Total Amount:</span>
                        <p className="font-bold text-green-900 text-lg">₦{formatNumber(selectedBooking.total_amount)}</p>
                      </div>
                      {selectedBooking.payment_status && (
                        <div>
                          <span className="text-sm text-green-700">Payment Status:</span>
                          <p className="font-medium text-green-900 capitalize">{selectedBooking.payment_status}</p>
                        </div>
                      )}
                      {selectedBooking.delivery_fee > 0 && (
                        <div>
                          <span className="text-sm text-green-700">Delivery Fee:</span>
                          <p className="font-medium text-green-900">₦{formatNumber(selectedBooking.delivery_fee)}</p>
                        </div>
                      )}
                      {selectedBooking.vat_amount > 0 && (
                        <div>
                          <span className="text-sm text-green-700">VAT:</span>
                          <p className="font-medium text-green-900">₦{formatNumber(selectedBooking.vat_amount)}</p>
                        </div>
                      )}
                      {selectedBooking.service_fee > 0 && (
                        <div>
                          <span className="text-sm text-green-700">Service Fee:</span>
                          <p className="font-medium text-green-900">₦{formatNumber(selectedBooking.service_fee)}</p>
                        </div>
                      )}
                      {selectedBooking.late_return_fee > 0 && (
                        <div>
                          <span className="text-sm text-red-700">Late Return Fee:</span>
                          <p className="font-bold text-red-900">₦{formatNumber(selectedBooking.late_return_fee)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Late Return Details (if applicable) */}
                {selectedBooking.late_return_fee > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Late Return Details</h3>
                    <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-orange-700">Hours Late:</span>
                          <p className="font-bold text-orange-900">{selectedBooking.late_return_hours?.toFixed(1) || 0} hours</p>
                        </div>
                        <div>
                          <span className="text-sm text-orange-700">Late Return Fee:</span>
                          <p className="font-bold text-orange-900">₦{formatNumber(selectedBooking.late_return_fee)}</p>
                        </div>
                        {selectedBooking.actual_dropoff_date && (
                          <div>
                            <span className="text-sm text-orange-700">Actual Return Date:</span>
                            <p className="font-medium text-orange-900">{formatDate(selectedBooking.actual_dropoff_date)}</p>
                          </div>
                        )}
                        {selectedBooking.late_return_reason && (
                          <div className="md:col-span-2">
                            <span className="text-sm text-orange-700">Reason:</span>
                            <p className="font-medium text-orange-900">{selectedBooking.late_return_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Details (if cancelled) */}
                {selectedBooking.status === 'cancelled' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Details</h3>
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-red-700">Cancelled Date:</span>
                          <p className="font-medium text-red-900">{selectedBooking.cancellation_date ? formatDate(selectedBooking.cancellation_date) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-red-700">Refund Status:</span>
                          <p className="font-medium text-red-900 capitalize">{selectedBooking.refund_status || 'Pending'}</p>
                        </div>
                        {selectedBooking.cancellation_reason && (
                          <div className="md:col-span-2">
                            <span className="text-sm text-red-700">Cancellation Reason:</span>
                            <p className="font-medium text-red-900">{selectedBooking.cancellation_reason}</p>
                          </div>
                        )}
                        {selectedBooking.refund_amount > 0 && (
                          <div>
                            <span className="text-sm text-red-700">Refund Amount:</span>
                            <p className="font-bold text-red-900">₦{formatNumber(selectedBooking.refund_amount)}</p>
                          </div>
                        )}
                        {selectedBooking.bank_name && (
                          <div>
                            <span className="text-sm text-red-700">Refund Bank:</span>
                            <p className="font-medium text-red-900">{selectedBooking.bank_name} - {selectedBooking.account_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">{selectedBooking.customer_email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedBooking.customer_phone}</p>
                      </div>
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
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedBooking(null)
                  }}
                >
                  Close
                </Button>
                {canCancel(selectedBooking) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowCancelModal(true)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <FooterSection />
    </AuroraBackground>
  )
}
