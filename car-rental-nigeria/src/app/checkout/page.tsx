"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { CheckoutInfoSection } from "@/components/checkout-info-section"
import { CheckoutPaymentSection } from "@/components/checkout-payment-section"
import { useCar, useBooking } from "@/lib/hooks/useApi"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface Booking {
  id: string
  car_id: string
  booking_type: string
  pickup_location: string
  dropoff_location: string
  pickup_date: string
  dropoff_date: string
  total_amount: number
  status: string
  payment_status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  special_requests?: string
  created_at: string
  updated_at: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const carId = searchParams.get('carId')
  const bookingId = searchParams.get('bookingId')

  // Use React Query hooks
  const { data: car, isLoading: carLoading } = useCar(carId || '')
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId || '')

  const loading = carLoading || bookingLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Car Details</span>
          </button>
        </div>
      </div>

      {/* Progress Bar - Centered */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 gap-3 rounded-[24px] bg-gray-50 p-3 sm:flex sm:items-center sm:justify-center sm:space-x-8 sm:bg-transparent sm:p-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">1</span>
              </div>
              <span className="text-xs font-medium text-black sm:text-sm">Personal Details</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">2</span>
              </div>
              <span className="text-xs font-medium text-black sm:text-sm">Payment</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">3</span>
              </div>
              <span className="text-xs font-medium text-gray-600 sm:text-sm">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading checkout details...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Info */}
            <div className="lg:col-span-2">
              <CheckoutInfoSection car={car} booking={booking} />
            </div>

            {/* Right Column - Payment Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CheckoutPaymentSection car={car} booking={booking} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
