import type { Database } from "@/lib/database.types"

export type RentalMode = "within_state" | "interstate"
export type TimingPackage = "12h" | "24h"

export type ServiceState = Database["public"]["Tables"]["service_states"]["Row"]
export type ServiceZone = Database["public"]["Tables"]["service_zones"]["Row"]
export type ServiceArea = Database["public"]["Tables"]["service_areas"]["Row"]
export type CarPricingRate = Database["public"]["Tables"]["car_pricing_rates"]["Row"]
export type CheckoutSettings = Database["public"]["Tables"]["checkout_settings"]["Row"]

type PricingInput = {
  carId: string
  rentalMode: RentalMode
  serviceStateId?: string | null
  originStateId?: string | null
  destinationStateId?: string | null
  zoneId?: string | null
  areaId?: string | null
  timingPackage: TimingPackage
  pickupDate: string
  dropoffDate: string
}

type PricingDeps = {
  checkoutSettings: Partial<CheckoutSettings> | null
  state: ServiceState | null
  zone: ServiceZone | null
  area: ServiceArea | null
  rate: CarPricingRate | null
}

export function generateQuoteReference() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `QTE-${stamp}-${random}`
}

export function getPackageHours(timingPackage: TimingPackage) {
  return timingPackage === "12h" ? 12 : 24
}

export function getRentalHours(pickupDate: string, dropoffDate: string) {
  const start = new Date(pickupDate).getTime()
  const end = new Date(dropoffDate).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0
  }

  return Math.max(0, (end - start) / (1000 * 60 * 60))
}

export function getBillableUnits(pickupDate: string, dropoffDate: string, timingPackage: TimingPackage) {
  const hours = getRentalHours(pickupDate, dropoffDate)
  return Math.max(1, Math.ceil(hours / getPackageHours(timingPackage)))
}

export function calculateControlledPricing(input: PricingInput, deps: PricingDeps) {
  const rentalHours = getRentalHours(input.pickupDate, input.dropoffDate)
  const billableUnits = getBillableUnits(input.pickupDate, input.dropoffDate, input.timingPackage)
  const isAutoPriced = input.rentalMode === "within_state" && deps.state?.is_auto_priced === true

  if (!isAutoPriced) {
    return {
      canAutoPrice: false,
      requiresQuote: true,
      rentalHours,
      billableUnits,
      reason: "This route requires an admin quote before payment.",
    }
  }

  if (!deps.rate?.is_active) {
    return {
      canAutoPrice: false,
      requiresQuote: true,
      rentalHours,
      billableUnits,
      reason: "No active pricing rate is configured for this car and zone.",
    }
  }

  const baseUnitPrice = Number(deps.rate.base_price || 0)
  const basePrice = baseUnitPrice * billableUnits
  const locationSurcharge = Number(deps.area?.surcharge_amount || 0) * billableUnits
  const deliveryFee = Number(deps.checkoutSettings?.delivery_fee || 0)
  const insuranceFee = Number(deps.checkoutSettings?.insurance_fee || 0)
  const taxableSubtotal = basePrice + locationSurcharge + deliveryFee + insuranceFee
  const vatAmount = taxableSubtotal * (Number(deps.checkoutSettings?.vat_rate || deps.checkoutSettings?.vat_percentage || 0) / 100)
  const serviceFee = taxableSubtotal * (Number(deps.checkoutSettings?.service_fee_rate || deps.checkoutSettings?.service_fee || 0) / 100)
  const grandTotal = taxableSubtotal + vatAmount + serviceFee

  return {
    canAutoPrice: true,
    requiresQuote: false,
    rentalHours,
    billableUnits,
    timingPackage: input.timingPackage,
    baseUnitPrice,
    basePrice,
    locationSurcharge,
    deliveryFee,
    insuranceFee,
    vatAmount,
    serviceFee,
    grandTotal,
    state: deps.state,
    zone: deps.zone,
    area: deps.area,
    rate: deps.rate,
  }
}