import { createClient } from '@supabase/supabase-js'

// Use static NEXT_PUBLIC lookups so values are inlined in browser bundles.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON ??
  ''
).trim()

if (!supabaseUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseKey) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})

// Never require the service-role key in the browser. If this module is imported
// by client components, fall back to the anon client to avoid hydration crashes.
const isServer = typeof window === 'undefined'
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

export const supabaseAdmin = isServer && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase

// Database Types
export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          name: string
          brand: string
          model: string
          year: number
          price_per_day: number
          price_per_week: number
          price_per_month: number
          fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid'
          transmission: 'manual' | 'automatic' | 'semi-automatic'
          seats: number
          doors: number
          mileage: number
          color: string
          description: string
          features: string[]
          images: string[]
          is_available: boolean
          location: string
          status: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          model: string
          year: number
          price_per_day: number
          price_per_week: number
          price_per_month: number
          fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid'
          transmission: 'manual' | 'automatic' | 'semi-automatic'
          seats: number
          doors: number
          mileage: number
          color: string
          description: string
          features: string[]
          images: string[]
          is_available: boolean
          location: string
          status?: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          model?: string
          year?: number
          price_per_day?: number
          price_per_week?: number
          price_per_month?: number
          fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid'
          transmission?: 'manual' | 'automatic'
          seats?: number
          doors?: number
          mileage?: number
          color?: string
          description?: string
          features?: string[]
          images?: string[]
          is_available?: boolean
          location?: string
          status?: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at?: string
          updated_at?: string
        }
      }
      jets: {
        Row: {
          id: string
          name: string
          manufacturer: string
          model: string
          year: number
          price_per_hour: number
          price_per_day: number
          capacity: number
          range: number
          max_speed: number
          description: string
          features: string[]
          images: string[]
          is_available: boolean
          location: string
          status: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          manufacturer: string
          model: string
          year: number
          price_per_hour: number
          price_per_day: number
          capacity: number
          range: number
          max_speed: number
          description: string
          features: string[]
          images: string[]
          is_available: boolean
          location: string
          status?: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          manufacturer?: string
          model?: string
          year?: number
          price_per_hour?: number
          price_per_day?: number
          capacity?: number
          range?: number
          max_speed?: number
          description?: string
          features?: string[]
          images?: string[]
          is_available?: boolean
          location?: string
          status?: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          car_id?: string
          jet_id?: string
          booking_type: 'car' | 'jet'
          pickup_date: string
          dropoff_date: string
          pickup_location: string
          dropoff_location: string
          total_amount: number
          status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          customer_name: string
          customer_email: string
          customer_phone: string
          special_requests?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id?: string
          jet_id?: string
          booking_type: 'car' | 'jet'
          pickup_date: string
          dropoff_date: string
          pickup_location: string
          dropoff_location: string
          total_amount: number
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          customer_name: string
          customer_email: string
          customer_phone: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
          jet_id?: string
          booking_type?: 'car' | 'jet'
          pickup_date?: string
          dropoff_date?: string
          pickup_location?: string
          dropoff_location?: string
          total_amount?: number
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          special_requests?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          role: 'admin' | 'user'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      website_settings: {
        Row: {
          id: string
          key: string
          value: string
          type: 'string' | 'number' | 'boolean' | 'json'
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          type: 'string' | 'number' | 'boolean' | 'json'
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          type?: 'string' | 'number' | 'boolean' | 'json'
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      checkout_settings: {
        Row: {
          id: string
          vat_percentage: number
          service_fee: number
          insurance_fee: number
          delivery_fee: number
          currency: string
          payment_methods: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vat_percentage: number
          service_fee: number
          insurance_fee: number
          delivery_fee: number
          currency: string
          payment_methods: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vat_percentage?: number
          service_fee?: number
          insurance_fee?: number
          delivery_fee?: number
          currency?: string
          payment_methods?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
