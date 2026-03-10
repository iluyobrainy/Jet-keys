import type { Database } from "@/lib/database.types"
import { getBillableDays } from "@/lib/server/car-utils"

type CheckoutSettings = Database["public"]["Tables"]["checkout_settings"]["Row"]
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"]

export function generateBookingReference() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `JNK-${timestamp}-${random}`
}

export function validateRentalWindow(
  pickupDate: string,
  dropoffDate: string,
  settings: CheckoutSettings | null,
) {
  const errors: string[] = []
  const pickup = new Date(pickupDate)
  const dropoff = new Date(dropoffDate)
  const now = new Date()
  const { hours, days } = getBillableDays(pickupDate, dropoffDate)
  const minimumHours = settings?.minimum_rental_hours || 4
  const maximumDays = settings?.maximum_rental_days || 30
  const advanceBookingDays = settings?.advance_booking_days || 30
  const maxAdvanceDate = new Date()

  maxAdvanceDate.setDate(maxAdvanceDate.getDate() + advanceBookingDays)

  if (pickup.getTime() < now.getTime()) {
    errors.push("Pickup date and time cannot be in the past")
  }

  if (dropoff.getTime() <= pickup.getTime()) {
    errors.push("Return time must be after pickup time")
  }

  if (hours < minimumHours) {
    errors.push(`Minimum rental duration is ${minimumHours} hours`)
  }

  if (days > maximumDays) {
    errors.push(`Maximum rental duration is ${maximumDays} days`)
  }

  if (pickup.getTime() > maxAdvanceDate.getTime()) {
    errors.push(`Bookings can only be made up to ${advanceBookingDays} days in advance`)
  }

  return {
    errors,
    days,
    hours,
    isValid: errors.length === 0,
  }
}

export function canUserCancelBooking(booking: BookingRow) {
  return ["paid_awaiting_fulfilment", "payment_pending", "approved", "pending"].includes(booking.status)
}

export function canUserRequestRefund(booking: BookingRow) {
  return false
}
