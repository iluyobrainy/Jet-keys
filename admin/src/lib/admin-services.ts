import { supabase, supabaseAdmin } from './supabase'
import { Database } from './supabase'

type Car = Database['public']['Tables']['cars']['Row']
type CarInsert = Database['public']['Tables']['cars']['Insert']
type CarUpdate = Database['public']['Tables']['cars']['Update']

type Jet = Database['public']['Tables']['jets']['Row']
type JetInsert = Database['public']['Tables']['jets']['Insert']
type JetUpdate = Database['public']['Tables']['jets']['Update']

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']
type BookingUpdate = Database['public']['Tables']['bookings']['Update']

type User = Database['public']['Tables']['users']['Row']
type WebsiteSetting = Database['public']['Tables']['website_settings']['Row']
type CheckoutSetting = Database['public']['Tables']['checkout_settings']['Row']

// Car Management Services
export const carService = {
  // Get all cars
  async getAllCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get car by ID
  async getCarById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new car
  async createCar(car: CarInsert): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .insert(car)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update car
  async updateCar(id: string, updates: CarUpdate): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete car
  async deleteCar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get cars by status
  async getCarsByStatus(status: 'active' | 'maintenance' | 'inactive'): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get available cars
  async getAvailableCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('is_available', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Jet Management Services
export const jetService = {
  // Get all jets
  async getAllJets(): Promise<Jet[]> {
    const { data, error } = await supabase
      .from('jets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get jet by ID
  async getJetById(id: string): Promise<Jet | null> {
    const { data, error } = await supabase
      .from('jets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new jet
  async createJet(jet: JetInsert): Promise<Jet> {
    const { data, error } = await supabase
      .from('jets')
      .insert(jet)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update jet
  async updateJet(id: string, updates: JetUpdate): Promise<Jet> {
    const { data, error } = await supabase
      .from('jets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete jet
  async deleteJet(id: string): Promise<void> {
    const { error } = await supabase
      .from('jets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get available jets
  async getAvailableJets(): Promise<Jet[]> {
    const { data, error } = await supabase
      .from('jets')
      .select('*')
      .eq('is_available', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Booking Management Services
export const bookingService = {
  // Get all bookings
  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new booking
  async createBooking(booking: BookingInsert): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update booking
  async updateBooking(id: string, updates: BookingUpdate): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get bookings by status
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get bookings by payment status
  async getBookingsByPaymentStatus(paymentStatus: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .eq('payment_status', paymentStatus)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get active bookings (currently rented)
  async getActiveBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get completed bookings
  async getCompletedBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// User Management Services
export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Website Settings Services
export const websiteService = {
  // Get website settings as a single object
  async getWebsiteSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .order('key')
      
      if (error) throw error
      
      // Convert array of key-value pairs to object
      const settings: any = {}
      if (data) {
        data.forEach(setting => {
          settings[setting.key] = setting.value
        })
      }
      
      return settings
    } catch (error) {
      console.error('Error fetching website settings:', error)
      // Return default settings if database error
      return {
        site_name: "Jet & Keys",
        site_description: "Premium car rental and private jet services",
        site_keywords: "car rental, jet charter, luxury transportation, nigeria",
        hero_title: "Premium Car Rental & Private Jet Services",
        hero_subtitle: "Experience luxury transportation with unmatched quality and reliability",
        hero_image: "",
        about_title: "About Jet & Keys",
        about_description: "We provide premium car rental and private jet services with unmatched quality and reliability.",
        about_image: "",
        contact_email: "info@jetandkeys.com",
        contact_phone: "+234 800 000 0000",
        contact_address: "Lagos, Nigeria",
        social_facebook: "",
        social_twitter: "",
        social_instagram: "",
        social_linkedin: "",
        primary_color: "#000000",
        secondary_color: "#f97316",
        accent_color: "#fbbf24",
        logo_url: "",
        favicon_url: "",
        maintenance_mode: false,
        maintenance_message: "We're currently performing maintenance. Please check back later.",
        google_analytics_id: "",
        google_maps_api_key: "",
        payment_gateway_public_key: "",
        payment_gateway_secret_key: "",
        email_smtp_host: "",
        email_smtp_port: 587,
        email_smtp_username: "",
        email_smtp_password: "",
        email_from_address: "",
        email_from_name: ""
      }
    }
  },

  // Update website settings
  async updateWebsiteSettings(settings: any): Promise<void> {
    try {
      // Convert object to array of key-value pairs
      // Use 'string' as the default type value
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        type: 'string' // Use 'string' as the default type
      }))

      // Upsert all settings
      const { error } = await supabase
        .from('website_settings')
        .upsert(settingsArray, { onConflict: 'key' })
      
      if (error) throw error
      
      console.log('✅ Website settings updated successfully')
    } catch (error) {
      console.error('❌ Error updating website settings:', error)
      throw error
    }
  }
}

export const settingsService = {
  // Get all website settings
  async getWebsiteSettings(): Promise<WebsiteSetting[]> {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .order('key')
    
    if (error) throw error
    return data || []
  },

  // Get setting by key
  async getSettingByKey(key: string): Promise<WebsiteSetting | null> {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('key', key)
      .single()
    
    if (error) throw error
    return data
  },

  // Update setting
  async updateSetting(key: string, value: string): Promise<WebsiteSetting> {
    const { data, error } = await supabase
      .from('website_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get checkout settings
  async getCheckoutSettings(): Promise<CheckoutSetting | null> {
    const { data, error } = await supabase
      .from('checkout_settings')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  // Update checkout settings
  async updateCheckoutSettings(settings: Partial<CheckoutSetting>): Promise<CheckoutSetting> {
    const { data, error } = await supabase
      .from('checkout_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Checkout Services
export const checkoutService = {
  // Get checkout configuration
  async getCheckoutConfig() {
    const { data, error } = await supabase
      .from('checkout_settings')
      .select('*')
      .single()

    if (error) {
      console.warn('Checkout settings not found, using defaults:', error.message)
      return {
        vat_rate: 7.5,
        service_fee_rate: 2.5,
        insurance_fee: 5000,
        delivery_fee: 10000,
        late_return_fee: 25000,
        cancellation_fee_rate: 10,
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

    return data
  },

  // Update checkout configuration
  async updateCheckoutConfig(config: any) {
    // First, try to update existing record
    const { data: existingData, error: fetchError } = await supabase
      .from('checkout_settings')
      .select('id')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('checkout_settings')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('checkout_settings')
        .insert({
          ...config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}

// Analytics Services
export const analyticsService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const [
      carsResult,
      jetsResult,
      bookingsResult,
      usersResult,
      activeBookingsResult,
      completedBookingsResult
    ] = await Promise.all([
      supabase.from('cars').select('id', { count: 'exact' }),
      supabase.from('jets').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'completed')
    ])

    const [
      revenueResult,
      failedPaymentsResult
    ] = await Promise.all([
      supabase.from('bookings').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('payment_status', 'failed')
    ])

    const totalRevenue = revenueResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

    return {
      totalCars: carsResult.count || 0,
      totalJets: jetsResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalUsers: usersResult.count || 0,
      activeBookings: activeBookingsResult.count || 0,
      completedBookings: completedBookingsResult.count || 0,
      totalRevenue,
      failedPayments: failedPaymentsResult.count || 0
    }
  },

  // Get recent bookings
  async getRecentBookings(limit: number = 10) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Get finance analytics
  async getFinanceAnalytics(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get all bookings within the time range
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model),
        jets(name, manufacturer, model)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching bookings for finance analytics:', error)
      throw error
    }

    if (!bookings || bookings.length === 0) {
      return null
    }

    // Calculate metrics
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    const monthlyRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.created_at)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
      })
      .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)

    const carBookings = bookings.filter(booking => booking.booking_type === 'car')
    const jetBookings = bookings.filter(booking => booking.booking_type === 'jet')
    
    const carRevenue = carBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    const jetRevenue = jetBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)

    const totalBookings = bookings.length
    const successfulBookings = bookings.filter(booking => booking.status === 'completed' || booking.status === 'active').length
    const failedBookings = bookings.filter(booking => booking.status === 'cancelled' || booking.status === 'failed').length
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Top performing vehicles
    const vehicleStats = new Map()
    bookings.forEach(booking => {
      const vehicleName = booking.cars?.name || booking.jets?.name || 'Unknown'
      const vehicleType = booking.booking_type
      const key = `${vehicleName}-${vehicleType}`
      
      if (!vehicleStats.has(key)) {
        vehicleStats.set(key, {
          name: vehicleName,
          revenue: 0,
          bookings: 0,
          type: vehicleType
        })
      }
      
      const stats = vehicleStats.get(key)
      stats.revenue += booking.total_amount || 0
      stats.bookings += 1
    })

    const topPerformingVehicles = Array.from(vehicleStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })
      
      const monthRevenue = monthBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        bookings: monthBookings.length
      })
    }

    // Payment methods (mock data for now)
    const paymentMethods = [
      { method: 'Credit Card', count: Math.floor(totalBookings * 0.6), amount: Math.floor(totalRevenue * 0.6) },
      { method: 'Bank Transfer', count: Math.floor(totalBookings * 0.3), amount: Math.floor(totalRevenue * 0.3) },
      { method: 'Cash', count: Math.floor(totalBookings * 0.1), amount: Math.floor(totalRevenue * 0.1) }
    ]

    return {
      totalRevenue,
      monthlyRevenue,
      carRevenue,
      jetRevenue,
      totalBookings,
      successfulBookings,
      failedBookings,
      averageBookingValue,
      topPerformingVehicles,
      monthlyTrends,
      paymentMethods
    }
  }
}

// Cancellation Management Services
export const cancellationService = {
  // Get all cancelled bookings
  async getCancelledBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model, images)
      `)
      .eq('status', 'cancelled')
      .order('cancellation_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching cancelled bookings:', error)
      throw error
    }
    
    return data || []
  },

  // Process refund
  async processRefund(
    bookingId: string, 
    processedBy: string, 
    refundReference: string
  ): Promise<Booking> {
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
      console.error('Error processing refund:', error)
      throw error
    }
    
    return data
  },

  // Get cancellation statistics
  async getCancellationStats() {
    const [
      pendingRefundsResult,
      processedRefundsResult,
      failedRefundsResult,
      totalRefundAmountResult
    ] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled').eq('refund_status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled').eq('refund_status', 'processed'),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'cancelled').eq('refund_status', 'failed'),
      supabase.from('bookings').select('refund_amount').eq('status', 'cancelled')
    ])

    const totalRefundAmount = totalRefundAmountResult.data?.reduce((sum, booking) => sum + (booking.refund_amount || 0), 0) || 0

    return {
      pendingRefunds: pendingRefundsResult.count || 0,
      processedRefunds: processedRefundsResult.count || 0,
      failedRefunds: failedRefundsResult.count || 0,
      totalRefundAmount
    }
  }
}

// Late Return Fee Service
export const lateReturnService = {
  // Get all bookings with late return fees
  async getLateReturnBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars(name, brand, model, images),
        jets(name, manufacturer, model, images)
      `)
      .gt('late_return_fee', 0)
      .order('actual_dropoff_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Record actual dropoff and calculate late return fee
  async recordActualDropoff(
    bookingId: string,
    actualDropoffDate: string,
    actualDropoffTime?: string,
    reason?: string
  ): Promise<Booking> {
    // Get the booking to access scheduled dropoff date
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('dropoff_date')
      .eq('id', bookingId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Get late return fee from checkout settings
    const { data: checkoutSettings } = await supabase
      .from('checkout_settings')
      .select('late_return_fee')
      .single()
    
    const lateFeePerDay = checkoutSettings?.late_return_fee || 25000
    
    // Calculate late return fee
    const scheduled = new Date(booking.dropoff_date)
    const actual = new Date(actualDropoffDate)
    const hoursLate = Math.max(0, (actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60))
    const daysLate = Math.ceil(hoursLate / 24)
    const fee = hoursLate > 0 ? Math.max(daysLate, 1) * lateFeePerDay : 0
    
    // Update booking with actual dropoff and late return fee
    const { data, error } = await supabase
      .from('bookings')
      .update({
        actual_dropoff_date: actualDropoffDate,
        actual_dropoff_time: actualDropoffTime,
        late_return_fee: fee,
        late_return_hours: hoursLate,
        late_return_reason: reason,
        late_return_notification_sent: fee > 0 ? false : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images),
        jets(name, manufacturer, model, images)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Process late return fee
  async processLateReturnFee(
    bookingId: string,
    processedBy: string,
    processedAmount?: number
  ): Promise<Booking> {
    const updateData: any = {
      late_return_processed_date: new Date().toISOString(),
      late_return_processed_by: processedBy,
      updated_at: new Date().toISOString()
    }
    
    if (processedAmount !== undefined) {
      updateData.late_return_fee = processedAmount
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        cars(name, brand, model, images),
        jets(name, manufacturer, model, images)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Mark late return notification as sent
  async markNotificationSent(bookingId: string): Promise<Booking> {
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
        cars(name, brand, model, images),
        jets(name, manufacturer, model, images)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Get late return statistics
  async getLateReturnStats(): Promise<{
    totalLateReturns: number
    pendingNotifications: number
    totalLateReturnFees: number
    averageLateReturnFee: number
  }> {
    const [
      { count: totalLateReturns },
      { count: pendingNotifications },
      { data: lateReturnFees }
    ] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }).gt('late_return_fee', 0),
      supabase.from('bookings').select('id', { count: 'exact' }).gt('late_return_fee', 0).eq('late_return_notification_sent', false),
      supabase.from('bookings').select('late_return_fee').gt('late_return_fee', 0)
    ])

    const totalLateReturnFees = lateReturnFees?.reduce((sum, booking) => sum + (booking.late_return_fee || 0), 0) || 0
    const averageLateReturnFee = totalLateReturns ? totalLateReturnFees / totalLateReturns : 0

    return {
      totalLateReturns: totalLateReturns || 0,
      pendingNotifications: pendingNotifications || 0,
      totalLateReturnFees,
      averageLateReturnFee
    }
  }
}

