// components/ui/rental-validation.tsx
import React from 'react'
import { AlertCircle, Info, CheckCircle, Clock, Calendar } from 'lucide-react'
import { Card, CardContent } from './card'

interface RentalValidationProps {
  isValid: boolean
  errors: string[]
  warnings: string[]
  days: number
  hours: number
  canBook: boolean
  checkoutSettings?: {
    minimum_rental_hours: number
    maximum_rental_days: number
    advance_booking_days: number
  }
}

export function RentalValidation({
  isValid,
  errors,
  warnings,
  days,
  hours,
  canBook,
  checkoutSettings
}: RentalValidationProps) {
  if (!checkoutSettings) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Info className="h-4 w-4" />
            <span className="text-sm">Loading rental rules...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Rental Duration Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Rental Duration</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-900">{days} day{days !== 1 ? 's' : ''}</p>
              <p className="text-sm text-blue-700">{hours.toFixed(1)} hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Rules Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Minimum: {checkoutSettings.minimum_rental_hours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Maximum: {checkoutSettings.maximum_rental_days} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Advance booking: {checkoutSettings.advance_booking_days} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Booking Issues</span>
              </div>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-800">
                <Info className="h-4 w-4" />
                <span className="font-medium">Recommendations</span>
              </div>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isValid && errors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Booking duration is valid!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




