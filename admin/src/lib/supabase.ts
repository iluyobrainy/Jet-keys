import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtaspdqcyapnfgcsbtte.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXNwZHFjeWFwbmZnY3NidHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODYzMTYsImV4cCI6MjA3Mjc2MjMxNn0.fI_8EuIq3caCNIneCS6Rkfr4lgdYKtXE6a5qCz7P4lk'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Service role client for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXNwZHFjeWFwbmZnY3NidHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE4NjMxNiwiZXhwIjoyMDcyNzYyMzE2fQ.LP4IkykiPSAovloBz4kbpzFN8y4XKMw0vOSWVQUL5Yc'
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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


