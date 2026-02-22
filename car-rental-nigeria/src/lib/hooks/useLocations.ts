// lib/hooks/useLocations.ts
import { useQuery } from '@tanstack/react-query'
import { locationService, Location } from '../services/locationService'

// Query Keys
export const locationQueryKeys = {
  locations: ['locations'] as const,
  cities: ['locations', 'cities'] as const,
  locationsByCity: (city: string) => ['locations', 'city', city] as const,
}

// Get all active locations
export function useLocations() {
  return useQuery({
    queryKey: locationQueryKeys.locations,
    queryFn: () => locationService.getActiveLocations(),
    staleTime: 30 * 60 * 1000, // 30 minutes - locations don't change often
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

// Get all unique cities
export function useCities() {
  return useQuery({
    queryKey: locationQueryKeys.cities,
    queryFn: () => locationService.getCities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

// Get locations by city
export function useLocationsByCity(city: string) {
  return useQuery({
    queryKey: locationQueryKeys.locationsByCity(city),
    queryFn: () => locationService.getLocationsByCity(city),
    enabled: !!city,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}


