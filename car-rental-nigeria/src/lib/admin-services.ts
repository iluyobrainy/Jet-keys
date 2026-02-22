import { supabase } from './supabase'
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
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
  }
}





