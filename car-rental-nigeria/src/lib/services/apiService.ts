// lib/services/apiService.ts
import { supabase } from '../supabase'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface CheckoutSettings {
  delivery_fee: number
  vat_rate: number
  service_fee_rate: number
  insurance_fee?: number
  late_return_fee?: number
  cancellation_fee_rate?: number
  minimum_rental_hours?: number
  maximum_rental_days?: number
  advance_booking_days?: number
  payment_methods?: string[]
  currency?: string
  terms_and_conditions?: string
  privacy_policy?: string
  refund_policy?: string
  contact_email?: string
  contact_phone?: string
  business_address?: string
}

export interface Booking {
  id: string
  car_id: string
  booking_type: string
  pickup_location: string
  dropoff_location: string
  pickup_date: string
  dropoff_date: string
  pickup_time?: string
  dropoff_time?: string
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
  // Cancellation and refund fields
  cancellation_reason?: string
  cancellation_date?: string
  refund_amount?: number
  refund_status?: 'pending' | 'processed' | 'failed'
  bank_name?: string
  account_name?: string
  account_number?: string
  refund_processed_date?: string
  refund_processed_by?: string
  refund_reference?: string
  // Late return fields
  actual_dropoff_date?: string
  actual_dropoff_time?: string
  late_return_fee?: number
  late_return_hours?: number
  late_return_reason?: string
  late_return_processed_date?: string
  late_return_processed_by?: string
  late_return_notification_sent?: boolean
  late_return_notification_date?: string
  cars?: {
    name: string
    brand: string
    model: string
    images: string[]
  }
}

export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  price_per_day: number
  price_per_week: number
  price_per_month: number
  fuel_type: string
  transmission: string
  seats: number
  doors: number
  mileage: number
  color: string
  description: string
  features: string[]
  images: string[]
  is_available: boolean
  location: string
  status: string
  created_at: string
  updated_at: string
}

class ApiService {
  // Checkout Settings
  async getCheckoutSettings(): Promise<CheckoutSettings> {
    try {
      const { data, error } = await supabase
        .from('checkout_settings')
        .select('*')
        .single()

      if (error) {
        console.warn('Checkout settings not found, using defaults:', error.message)
        return {
          delivery_fee: 20000,
          vat_rate: 0,
          service_fee_rate: 0,
          insurance_fee: 0,
          late_return_fee: 0,
          cancellation_fee_rate: 0,
          minimum_rental_hours: 4,
          maximum_rental_days: 30,
          advance_booking_days: 7,
          payment_methods: ['card', 'bank_transfer', 'cash'],
          currency: 'NGN',
          terms_and_conditions: '',
          privacy_policy: '',
          refund_policy: '',
          contact_email: '',
          contact_phone: '',
          business_address: ''
        }
      }

      console.log('✅ Checkout settings fetched successfully:', data)

      // Handle both old and new column names for backward compatibility
      const settings = {
        delivery_fee: data.delivery_fee || 20000,
        vat_rate: data.vat_rate || data.vat_percentage || 0,
        service_fee_rate: data.service_fee_rate || data.service_fee || 0,
        insurance_fee: data.insurance_fee || 0,
        late_return_fee: data.late_return_fee || 0,
        cancellation_fee_rate: data.cancellation_fee_rate || 0,
        minimum_rental_hours: data.minimum_rental_hours || 4,
        maximum_rental_days: data.maximum_rental_days || 30,
        advance_booking_days: data.advance_booking_days || 7,
        payment_methods: data.payment_methods || ['card', 'bank_transfer', 'cash'],
        currency: data.currency || 'NGN',
        terms_and_conditions: data.terms_and_conditions || '',
        privacy_policy: data.privacy_policy || '',
        refund_policy: data.refund_policy || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        business_address: data.business_address || ''
      }

      console.log('✅ Processed checkout settings:', settings)
      return settings
    } catch (error) {
      console.warn('Error fetching checkout settings, using defaults:', error)
      return {
        delivery_fee: 20000,
        vat_rate: 0,
        service_fee_rate: 0,
        insurance_fee: 0,
        late_return_fee: 0,
        cancellation_fee_rate: 0,
        minimum_rental_hours: 4,
        maximum_rental_days: 30,
        advance_booking_days: 7,
        payment_methods: ['card', 'bank_transfer', 'cash'],
        currency: 'NGN',
        terms_and_conditions: '',
        privacy_policy: '',
        refund_policy: '',
        contact_email: '',
        contact_phone: '',
        business_address: ''
      }
    }
  }

  // Cars
  async getAllCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('is_available', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cars:', error)
      throw new Error('Failed to fetch cars')
    }

    return data || []
  }

  async getCarById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching car:', error)
      return null
    }

    return data
  }

  // Bookings
  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    console.log('📝 Creating booking with data:', bookingData)
    
    // Validate rental duration
    if (bookingData.pickup_date && bookingData.dropoff_date) {
      // Create proper datetime objects with times
      const pickupDateTime = new Date(bookingData.pickup_date)
      const dropoffDateTime = new Date(bookingData.dropoff_date)
      
      // Set pickup time if provided
      if (bookingData.pickup_time) {
        const [pickupHours, pickupMinutes] = bookingData.pickup_time.split(':').map(Number)
        pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0)
      }
      
      // Set dropoff time if provided
      if (bookingData.dropoff_time) {
        const [dropoffHours, dropoffMinutes] = bookingData.dropoff_time.split(':').map(Number)
        dropoffDateTime.setHours(dropoffHours, dropoffMinutes, 0, 0)
      }
      
      // Calculate duration using proper datetime objects
      const timeDiff = dropoffDateTime.getTime() - pickupDateTime.getTime()
      const hours = timeDiff / (1000 * 3600)
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
      
      console.log('🔍 Backend Validation Debug:', {
        pickupDateTime: pickupDateTime.toISOString(),
        dropoffDateTime: dropoffDateTime.toISOString(),
        pickupTime: bookingData.pickup_time,
        dropoffTime: bookingData.dropoff_time,
        hours,
        days,
        timeDiff
      })
      
      // Get checkout settings for validation
      const checkoutSettings = await this.getCheckoutSettings()
      
      // Validate minimum rental duration
      if (hours < (checkoutSettings.minimum_rental_hours || 4)) {
        throw new Error(`Minimum rental duration is ${checkoutSettings.minimum_rental_hours || 4} hours`)
      }
      
      // Validate maximum rental duration
      if (days > (checkoutSettings.maximum_rental_days || 30)) {
        throw new Error(`Maximum rental duration is ${checkoutSettings.maximum_rental_days || 30} days`)
      }
      
      // Validate advance booking limit
      const advanceBookingDays = checkoutSettings.advance_booking_days || 7
      const maxAdvanceDate = new Date()
      maxAdvanceDate.setDate(maxAdvanceDate.getDate() + advanceBookingDays)
      
      if (pickupDateTime > maxAdvanceDate) {
        throw new Error(`Bookings can only be made up to ${advanceBookingDays} days in advance`)
      }
      
      // Validate pickup is not in the past
      const now = new Date()
      if (pickupDateTime < now) {
        throw new Error('Pickup date and time cannot be in the past')
      }
      
      // Validate dropoff is after pickup
      if (dropoffDateTime <= pickupDateTime) {
        throw new Error('Return time must be after pickup time')
      }
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    console.log('✅ Booking created successfully:', data)
    return data
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return null
    }

    return data
  }

  async getBookingsByUserId(_userId: string): Promise<Booking[]> {
    // For now, return all bookings (in production, filter by actual user)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    console.log('📋 Fetched bookings:', data)
    return data || []
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      throw new Error(`Failed to update booking: ${error.message}`)
    }

    return data
  }

  // Calculate pricing with checkout settings
  async calculatePricing(
    car: Car,
    days: number,
    checkoutSettings: CheckoutSettings
  ) {
    const basePrice = car.price_per_day * days
    const deliveryFee = checkoutSettings.delivery_fee
    const insuranceFee = checkoutSettings.insurance_fee || 0
    const vatAmount = (basePrice + deliveryFee + insuranceFee) * (checkoutSettings.vat_rate / 100)
    const serviceFee = (basePrice + deliveryFee + insuranceFee) * (checkoutSettings.service_fee_rate / 100)
    const grandTotal = basePrice + deliveryFee + insuranceFee + vatAmount + serviceFee

    console.log('💰 Pricing calculation:', {
      carName: car.name,
      days,
      basePrice,
      deliveryFee,
      insuranceFee,
      vatRate: checkoutSettings.vat_rate,
      vatAmount,
      serviceFeeRate: checkoutSettings.service_fee_rate,
      serviceFee,
      grandTotal
    })

    return {
      days,
      basePrice,
      totalPrice: basePrice,
      deliveryFee,
      insuranceFee,
      vatAmount,
      serviceFee,
      grandTotal
    }
  }

  // Calculate refund amount based on cancellation policy
  calculateRefundAmount(
    booking: Booking,
    checkoutSettings: CheckoutSettings
  ): number {
    const totalPaid = booking.total_amount
    const cancellationFeeRate = checkoutSettings.cancellation_fee_rate || 0
    
    // Calculate cancellation fee
    const cancellationFee = totalPaid * (cancellationFeeRate / 100)
    
    // Refund amount = total paid - cancellation fee
    const refundAmount = totalPaid - cancellationFee
    
    console.log('💸 Refund calculation:', {
      bookingId: booking.id,
      totalPaid,
      cancellationFeeRate,
      cancellationFee,
      refundAmount
    })
    
    return Math.max(0, refundAmount) // Ensure non-negative refund
  }

  // Cancel booking with refund details
  async cancelBooking(
    bookingId: string,
    cancellationData: {
      reason: string
      bankName: string
      accountName: string
      accountNumber: string
    }
  ): Promise<Booking> {
    console.log('🚫 Cancelling booking:', { bookingId, cancellationData })
    
    // Get current booking and checkout settings
    const booking = await this.getBookingById(bookingId)
    const checkoutSettings = await this.getCheckoutSettings()
    
    if (!booking) {
      throw new Error('Booking not found')
    }
    
    // Calculate refund amount
    const refundAmount = this.calculateRefundAmount(booking, checkoutSettings)
    
    // Prepare update data - only include fields that exist
    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }
    
    // Try to add new fields if they exist (after migration)
    try {
      // Check if new columns exist by attempting to update them
      updateData.cancellation_reason = cancellationData.reason
      updateData.cancellation_date = new Date().toISOString()
      updateData.refund_amount = refundAmount
      updateData.refund_status = 'pending'
      updateData.bank_name = cancellationData.bankName
      updateData.account_name = cancellationData.accountName
      updateData.account_number = cancellationData.accountNumber
    } catch (_error) {
      console.warn('New cancellation fields not available yet, using fallback')
    }
    
    // Update booking with cancellation details
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .single()
    
    if (error) {
      console.error('❌ Error cancelling booking:', error)
      throw new Error(`Failed to cancel booking: ${error.message}`)
    }
    
    console.log('✅ Booking cancelled successfully:', data)
    return data
  }

  // Process refund (admin function)
  async processRefund(
    bookingId: string,
    processedBy: string,
    refundReference: string
  ): Promise<Booking> {
    console.log('💳 Processing refund:', { bookingId, processedBy, refundReference })
    
    const { data, error } = await supabase
      .from('bookings')
      .update({
        refund_status: 'processed',
        refund_processed_date: new Date().toISOString(),
        refund_processed_by: processedBy,
        refund_reference: refundReference,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .single()
    
    if (error) {
      console.error('❌ Error processing refund:', error)
      throw new Error(`Failed to process refund: ${error.message}`)
    }
    
    console.log('✅ Refund processed successfully:', data)
    return data
  }

  // Late Return Fee Management
  
  // Calculate late return fee
  calculateLateReturnFee(
    scheduledDropoff: string,
    actualDropoff: string,
    lateFeePerDay: number
  ): { fee: number; hoursLate: number; daysLate: number } {
    const scheduled = new Date(scheduledDropoff)
    const actual = new Date(actualDropoff)
    
    // Calculate hours late
    const hoursLate = Math.max(0, (actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60))
    
    // If not late, return 0
    if (hoursLate <= 0) {
      return { fee: 0, hoursLate: 0, daysLate: 0 }
    }
    
    // Calculate days late (round up)
    const daysLate = Math.ceil(hoursLate / 24)
    
    // Calculate fee (minimum 1 day charge)
    const fee = Math.max(daysLate, 1) * lateFeePerDay
    
    return { fee, hoursLate, daysLate }
  }

  // Record actual dropoff and calculate late return fee
  async recordActualDropoff(
    bookingId: string,
    actualDropoffDate: string,
    actualDropoffTime?: string,
    reason?: string
  ): Promise<Booking> {
    console.log('🚗 Recording actual dropoff:', { bookingId, actualDropoffDate, actualDropoffTime, reason })
    
    // Get the booking to access scheduled dropoff date
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('dropoff_date')
      .eq('id', bookingId)
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching booking:', fetchError)
      throw new Error(`Failed to fetch booking: ${fetchError.message}`)
    }
    
    // Get late return fee from checkout settings
    const checkoutSettings = await this.getCheckoutSettings()
    const lateFeePerDay = checkoutSettings.late_return_fee || 25000
    
    // Calculate late return fee
    const { fee, hoursLate } = this.calculateLateReturnFee(
      booking.dropoff_date,
      actualDropoffDate,
      lateFeePerDay
    )
    
    // Update booking with actual dropoff and late return fee
    const { data, error } = await supabase
      .from('bookings')
      .update({
        actual_dropoff_date: actualDropoffDate,
        actual_dropoff_time: actualDropoffTime,
        late_return_fee: fee,
        late_return_hours: hoursLate,
        late_return_reason: reason,
        late_return_notification_sent: fee > 0 ? false : true, // Mark for notification if there's a fee
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .single()
    
    if (error) {
      console.error('❌ Error recording actual dropoff:', error)
      throw new Error(`Failed to record actual dropoff: ${error.message}`)
    }
    
    console.log('✅ Actual dropoff recorded successfully:', data)
    return data
  }

  // Process late return fee (admin function)
  async processLateReturnFee(
    bookingId: string,
    processedBy: string,
    processedAmount?: number
  ): Promise<Booking> {
    console.log('💰 Processing late return fee:', { bookingId, processedBy, processedAmount })
    
    const updateData: Record<string, unknown> = {
      late_return_processed_date: new Date().toISOString(),
      late_return_processed_by: processedBy,
      updated_at: new Date().toISOString()
    }
    
    // If a specific amount is provided, update the fee
    if (processedAmount !== undefined) {
      updateData.late_return_fee = processedAmount
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .single()
    
    if (error) {
      console.error('❌ Error processing late return fee:', error)
      throw new Error(`Failed to process late return fee: ${error.message}`)
    }
    
    console.log('✅ Late return fee processed successfully:', data)
    return data
  }

  // Get bookings with late return fees (admin function)
  async getLateReturnBookings(): Promise<Booking[]> {
    console.log('📋 Fetching bookings with late return fees')
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .gt('late_return_fee', 0)
      .order('actual_dropoff_date', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching late return bookings:', error)
      throw new Error(`Failed to fetch late return bookings: ${error.message}`)
    }
    
    console.log('✅ Late return bookings fetched successfully:', data?.length || 0)
    return data || []
  }

  // Mark late return notification as sent
  async markLateReturnNotificationSent(bookingId: string): Promise<Booking> {
    console.log('📧 Marking late return notification as sent:', bookingId)
    
    const { data, error } = await supabase
      .from('bookings')
      .update({
        late_return_notification_sent: true,
        late_return_notification_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .single()
    
    if (error) {
      console.error('❌ Error marking notification as sent:', error)
      throw new Error(`Failed to mark notification as sent: ${error.message}`)
    }
    
    console.log('✅ Notification marked as sent successfully:', data)
    return data
  }
}

export const apiService = new ApiService()
