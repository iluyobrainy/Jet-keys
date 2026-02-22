export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  price_per_day: number
  price_per_week: number
  price_per_month: number
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  seats: number
  doors: number
  mileage: number
  color: string
  description: string
  features: string[]
  images: string[]
  is_available: boolean
  location: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  car_id: string
  user_id: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  pickup_location: string
  return_location: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  is_admin: boolean
  created_at: string
  updated_at: string
}
