"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tag } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDate, formatNumber } from "@/lib/formatters"

interface Booking {
  id: string
  car_id: string
  booking_type: string
  pickup_location: string
  dropoff_location: string
  pickup_date: string
  dropoff_date: string
  total_amount: number
  delivery_fee?: number
  vat_amount?: number
  service_fee?: number
  status: string
  payment_status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  special_requests?: string
  created_at: string
  updated_at: string
}

interface CheckoutPaymentSectionProps {
  car?: any
  booking?: Booking | null
}

export function CheckoutPaymentSection({ car, booking }: CheckoutPaymentSectionProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!booking) {
      alert('No booking found. Please try again.')
      return
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions.')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update booking status to completed
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id)

      if (error) {
        console.error('Error updating booking:', error)
        alert('Payment processed but failed to update booking status. Please contact support.')
        return
      }

      // Show success message
      alert('Payment successful! Your booking has been confirmed.')
      
      // Redirect to success page or home
      window.location.href = '/'
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">3</span>
        </div>
        <span className="text-sm font-medium text-gray-600">Complete</span>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vehicle</span>
              <span className="text-sm font-medium text-gray-900">
                {car ? `${car.year} ${car.brand} ${car.model}` : "1 Vehicle"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pickup Location</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-48">
                {booking ? booking.pickup_location : (car ? car.location : "Not specified")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pickup Date</span>
              <span className="text-sm font-medium text-gray-900">
                {booking ? formatDate(booking.pickup_date) : "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Return Date</span>
              <span className="text-sm font-medium text-gray-900">
                {booking ? formatDate(booking.dropoff_date) : "Not specified"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Price Details */}
          <div className="space-y-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Price Details
            </CardTitle>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Base Price</span>
                <span className="text-sm font-medium text-gray-900">
                  {booking ? `NGN ${formatNumber(booking.total_amount - (booking.delivery_fee || 0) - (booking.vat_amount || 0) - (booking.service_fee || 0))}` : (car ? `NGN ${formatNumber(car.price_per_day || 0)}/day` : "NGN 150,000/day")}
                </span>
              </div>
              {booking?.delivery_fee && booking.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivery Fee</span>
                  <span className="text-sm font-medium text-gray-900">NGN {formatNumber(booking.delivery_fee)}</span>
                </div>
              )}
              {booking?.vat_amount && booking.vat_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">VAT</span>
                  <span className="text-sm font-medium text-gray-900">NGN {formatNumber(booking.vat_amount)}</span>
                </div>
              )}
              {booking?.service_fee && booking.service_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Fee</span>
                  <span className="text-sm font-medium text-gray-900">NGN {formatNumber(booking.service_fee)}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="text-lg font-semibold text-gray-900">
                  {booking ? `NGN ${formatNumber(booking.total_amount)}` : "NGN 620,000.00"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agreement Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                By clicking this, I agree to Garazi{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              disabled={!agreedToTerms || isProcessing}
              className="w-full bg-black text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600 hover:text-white hover:shadow-lg hover:shadow-yellow-200 transition-all duration-300 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                'Pay for My Booking'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
