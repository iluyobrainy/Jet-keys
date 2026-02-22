// lib/hooks/useRentalValidation.ts
import { useMemo } from 'react'
import { useCheckoutSettings } from './useApi'

interface RentalValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  days: number
  hours: number
  canBook: boolean
}

export function useRentalValidation(
  pickupDate: Date | null,
  dropoffDate: Date | null,
  pickupTime?: string,
  dropoffTime?: string
): RentalValidationResult {
  const { data: checkoutSettings } = useCheckoutSettings()

  return useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // If no dates selected, return early
    if (!pickupDate || !dropoffDate) {
      return {
        isValid: false,
        errors: ['Please select pickup and dropoff dates'],
        warnings: [],
        days: 0,
        hours: 0,
        canBook: false
      }
    }

    // Create proper datetime objects with times
    const pickupDateTime = new Date(pickupDate)
    const dropoffDateTime = new Date(dropoffDate)
    
    // Set pickup time if provided
    if (pickupTime) {
      const [pickupHours, pickupMinutes] = pickupTime.split(':').map(Number)
      pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0)
    }
    
    // Set dropoff time if provided
    if (dropoffTime) {
      const [dropoffHours, dropoffMinutes] = dropoffTime.split(':').map(Number)
      dropoffDateTime.setHours(dropoffHours, dropoffMinutes, 0, 0)
    }

    // Calculate duration using proper datetime objects
    const timeDiff = dropoffDateTime.getTime() - pickupDateTime.getTime()
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
    const hours = timeDiff / (1000 * 3600)

    console.log('🔍 Rental Validation Debug:', {
      pickupDateTime: pickupDateTime.toISOString(),
      dropoffDateTime: dropoffDateTime.toISOString(),
      pickupTime,
      dropoffTime,
      days,
      hours,
      timeDiff,
      timeDiffHours: timeDiff / (1000 * 3600)
    })

    // Check if pickup is in the past
    const now = new Date()
    if (pickupDateTime < now) {
      errors.push('Pickup date and time cannot be in the past')
    }

    // Check if dropoff is before pickup
    if (dropoffDateTime <= pickupDateTime) {
      errors.push('Return time must be after pickup time')
    }

    // Check minimum rental duration
    const minimumHours = checkoutSettings?.minimum_rental_hours || 4
    if (hours < minimumHours) {
      errors.push(`Minimum rental duration is ${minimumHours} hours`)
    }

    // Check maximum rental duration
    const maximumDays = checkoutSettings?.maximum_rental_days || 30
    if (days > maximumDays) {
      errors.push(`Maximum rental duration is ${maximumDays} days`)
    }

    // Check advance booking limit
    const advanceBookingDays = checkoutSettings?.advance_booking_days || 7
    const maxAdvanceDate = new Date()
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + advanceBookingDays)
    
    if (pickupDate > maxAdvanceDate) {
      errors.push(`Bookings can only be made up to ${advanceBookingDays} days in advance`)
    }

    // Add warnings for edge cases
    if (days === 1 && hours < 24) {
      warnings.push('You\'re booking for less than 24 hours. Consider extending your rental for better value.')
    }

    if (days > 7) {
      warnings.push('For rentals longer than 7 days, please contact us for special rates.')
    }

    // Check for same-day booking
    const isSameDay = pickupDate.toDateString() === dropoffDate.toDateString()
    if (isSameDay && hours < 8) {
      warnings.push('Same-day rentals under 8 hours may have limited availability.')
    }

    const isValid = errors.length === 0
    const canBook = isValid && checkoutSettings !== undefined

    return {
      isValid,
      errors,
      warnings,
      days,
      hours,
      canBook
    }
  }, [pickupDate, dropoffDate, pickupTime, dropoffTime, checkoutSettings])
}
