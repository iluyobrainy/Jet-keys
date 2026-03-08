"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  CreditCard,
  Calendar,
  MapPin,
  Clock
} from "lucide-react"
import { formatDate } from "@/lib/formatters"

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

interface CheckoutInfoSectionProps {
  car?: any
  booking?: Booking | null
}

export function CheckoutInfoSection({ car, booking }: CheckoutInfoSectionProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(true)

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Booking Hold Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Your Booking is on Hold
            </h3>
            <p className="text-sm text-gray-700">
              We hold your booking until Feb 14, 12:00 AM. If your reserve change, we will get back to you.
            </p>
          </div>
        </div>
      </div>

      {/* Book Information */}
      <Card className="rounded-[28px] border border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Book Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Banner */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-800">
                Congratulations! We have sent your book details to the vehicle owner.
              </p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="space-y-4">
            {/* Full Name - Always on its own line */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Full Name</Label>
              <div className="text-sm font-medium text-gray-900 break-words">{fullName || "Not provided"}</div>
            </div>
            
            {/* Email and Phone - Side by side on larger screens, stacked on smaller */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Email</Label>
                <div className="text-sm font-medium text-gray-900 break-words">{email || "Not provided"}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Phone Number</Label>
                <div className="text-sm font-medium text-gray-900 break-words">{phoneNumber || "Not provided"}</div>
              </div>
            </div>

            {/* Booking Details */}
            {booking && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-gray-900">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-xs text-gray-500">Pickup Location</Label>
                      <div className="text-sm text-gray-900">{booking.pickup_location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-xs text-gray-500">Drop-off Location</Label>
                      <div className="text-sm text-gray-900">{booking.dropoff_location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-xs text-gray-500">Pickup Date</Label>
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.pickup_date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-xs text-gray-500">Return Date</Label>
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.dropoff_date)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="rounded-[28px] border border-black/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Please fill out your personal information below.
          </p>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-900">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card className="rounded-[28px] border border-black/5 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cancelation Policy
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                At Garazi, we understand that plans can change unexpectedly. That's why we've crafted our cancellation policy to provide you with flexibility and peace of mind. When you book a car with us, you have the freedom to modify or cancel your reservation without incurring any cancellation fees up to 12 hours/days before your scheduled pick-up time.
              </p>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">
                See more details
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
