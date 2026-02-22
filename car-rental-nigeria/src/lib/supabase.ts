import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtaspdqcyapnfgcsbtte.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0YXNwZHFjeWFwbmZnY3NidHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODYzMTYsImV4cCI6MjA3Mjc2MjMxNn0.fI_8EuIq3caCNIneCS6Rkfr4lgdYKtXE6a5qCz7P4lk'

export const supabase = createClient(supabaseUrl, supabaseKey)

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
  transmission: 'manual' | 'automatic' | 'semi-automatic'
  seats: number
  doors: number
  mileage: number
  color: string
  description: string
  location: string
  images: string[]
  features: string[]
  is_available: boolean
  status: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
  created_at: string
  updated_at: string
}

export interface Jet {
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

// Car functions
export async function getAllCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('is_available', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cars:', error)
    return []
  }

  return data || []
}

export async function getCarById(id: string): Promise<Car | null> {
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

// Jet functions
export async function getAllJets(): Promise<Jet[]> {
  const { data, error } = await supabase
    .from('jets')
    .select('*')
    .eq('is_available', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jets:', error)
    return []
  }

  return data || []
}

export async function getJetById(id: string): Promise<Jet | null> {
  const { data, error } = await supabase
    .from('jets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching jet:', error)
    return null
  }

  return data
}

// Website settings
export async function getWebsiteSettings() {
  const { data, error } = await supabase
    .from('website_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching website settings:', error)
    return null
  }

  return data
}

// Checkout settings
export async function getCheckoutSettings() {
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
        service_fee_rate: 0
      }
    }

    // Handle both old and new column names for backward compatibility
    return {
      delivery_fee: data.delivery_fee || 20000,
      vat_rate: data.vat_rate || data.vat_percentage || 0,
      service_fee_rate: data.service_fee_rate || data.service_fee || 0
    }
  } catch (error) {
    console.warn('Error fetching checkout settings, using defaults:', error)
    return {
      delivery_fee: 20000,
      vat_rate: 0,
      service_fee_rate: 0
    }
  }
}