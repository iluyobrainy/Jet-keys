// lib/services/locationService.ts
import { supabase } from '../supabase'

export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SearchCriteria {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  pickupTime?: string
  dropoffTime?: string
}

class LocationService {
  // Get all active locations
  async getActiveLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching locations:', error)
      throw new Error('Failed to fetch locations')
    }

    // Custom sorting: Lagos first, then others alphabetically
    const sortedData = (data || []).sort((a, b) => {
      // Lagos locations first
      if (a.city === 'Lagos' && b.city !== 'Lagos') return -1
      if (b.city === 'Lagos' && a.city !== 'Lagos') return 1
      
      // Within same city, sort by name
      if (a.city === b.city) {
        return a.name.localeCompare(b.name)
      }
      
      // Other cities alphabetically
      return a.city.localeCompare(b.city)
    })

    return sortedData
  }

  // Get locations by city
  async getLocationsByCity(city: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .eq('city', city)
      .order('name')

    if (error) {
      console.error('Error fetching locations by city:', error)
      throw new Error('Failed to fetch locations')
    }

    return data || []
  }

  // Get all unique cities
  async getCities(): Promise<string[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('city')
      .eq('is_active', true)
      .order('city')

    if (error) {
      console.error('Error fetching cities:', error)
      throw new Error('Failed to fetch cities')
    }

    // Extract unique cities and prioritize Lagos
    const cities = [...new Set(data?.map(item => item.city) || [])]
    const sortedCities = cities.sort((a, b) => {
      if (a === 'Lagos' && b !== 'Lagos') return -1
      if (b === 'Lagos' && a !== 'Lagos') return 1
      return a.localeCompare(b)
    })
    return sortedCities
  }

  // Validate search criteria
  validateSearchCriteria(criteria: SearchCriteria): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!criteria.pickupLocation) {
      errors.push('Pickup location is required')
    }

    if (!criteria.dropoffLocation) {
      errors.push('Dropoff location is required')
    }

    if (!criteria.pickupDate) {
      errors.push('Pickup date is required')
    }

    if (!criteria.dropoffDate) {
      errors.push('Dropoff date is required')
    }

    // Validate dates
    if (criteria.pickupDate && criteria.dropoffDate) {
      const pickupDate = new Date(criteria.pickupDate)
      const dropoffDate = new Date(criteria.dropoffDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (pickupDate < today) {
        errors.push('Pickup date cannot be in the past')
      }

      if (dropoffDate <= pickupDate) {
        errors.push('Dropoff date must be after pickup date')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Format location for display
  formatLocationDisplay(location: Location): string {
    return `${location.name}, ${location.city}`
  }

  // Get location by ID
  async getLocationById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return null
    }

    return data
  }
}

export const locationService = new LocationService()