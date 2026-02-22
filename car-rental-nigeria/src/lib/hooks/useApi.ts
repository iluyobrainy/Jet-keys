// lib/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService, CheckoutSettings, Car, Booking } from '../services/apiService'

// Query Keys
export const queryKeys = {
  checkoutSettings: ['checkoutSettings'] as const,
  cars: ['cars'] as const,
  car: (id: string) => ['cars', id] as const,
  bookings: (userId: string) => ['bookings', userId] as const,
  booking: (id: string) => ['bookings', id] as const,
  lateReturnBookings: ['lateReturnBookings'] as const,
}

// Checkout Settings Hook
export function useCheckoutSettings() {
  return useQuery({
    queryKey: queryKeys.checkoutSettings,
    queryFn: () => apiService.getCheckoutSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes - checkout settings rarely change
    gcTime: 60 * 60 * 1000, // 60 minutes - keep longer
    retry: 1, // Reduce retries for faster failure
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })
}

// Cars Hooks
export function useCars() {
  return useQuery({
    queryKey: queryKeys.cars,
    queryFn: () => apiService.getAllCars(),
    staleTime: 10 * 60 * 1000, // 10 minutes - cars don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep longer
    retry: 1, // Reduce retries for faster failure
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })
}

export function useCar(id: string) {
  return useQuery({
    queryKey: queryKeys.car(id),
    queryFn: () => apiService.getCarById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1, // Reduce retries for faster failure
    refetchOnMount: false, // Don't refetch on mount if data exists
  })
}

// Booking Hooks
export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => apiService.getBookingById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

export function useBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => apiService.getBookingsByUserId(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bookingData: Partial<Booking>) => 
      apiService.createBooking(bookingData),
    onSuccess: (data) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.cars })
    },
    onError: (error) => {
      console.error('Booking creation failed:', error)
    },
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Booking> }) =>
      apiService.updateBooking(id, updates),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(variables.id), data)
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: queryKeys.cars })
    },
    onError: (error) => {
      console.error('Booking update failed:', error)
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      cancellationData 
    }: { 
      bookingId: string
      cancellationData: {
        reason: string
        bankName: string
        accountName: string
        accountNumber: string
      }
    }) => apiService.cancelBooking(bookingId, cancellationData),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(variables.bookingId), data)
      // Invalidate bookings list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings('all') })
    },
    onError: (error) => {
      console.error('Booking cancellation failed:', error)
    },
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      processedBy, 
      refundReference 
    }: { 
      bookingId: string
      processedBy: string
      refundReference: string
    }) => apiService.processRefund(bookingId, processedBy, refundReference),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(variables.bookingId), data)
      // Invalidate bookings list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings('all') })
    },
    onError: (error) => {
      console.error('Refund processing failed:', error)
    },
  })
}

// Pricing Hook
export function usePricing(car: Car | null, days: number) {
  const { data: checkoutSettings } = useCheckoutSettings()
  
  return useQuery({
    queryKey: ['pricing', car?.id, days, checkoutSettings],
    queryFn: () => {
      if (!car || !checkoutSettings || days <= 0) return null
      return apiService.calculatePricing(car, days, checkoutSettings)
    },
    enabled: !!car && !!checkoutSettings && days > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Late Return Fee Hooks

export function useLateReturnBookings() {
  return useQuery({
    queryKey: queryKeys.lateReturnBookings,
    queryFn: () => apiService.getLateReturnBookings(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

export function useRecordActualDropoff() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      actualDropoffDate, 
      actualDropoffTime, 
      reason 
    }: { 
      bookingId: string
      actualDropoffDate: string
      actualDropoffTime?: string
      reason?: string
    }) => apiService.recordActualDropoff(bookingId, actualDropoffDate, actualDropoffTime, reason),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(variables.bookingId), data)
      // Invalidate bookings list and late return bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings('all') })
      queryClient.invalidateQueries({ queryKey: queryKeys.lateReturnBookings })
    },
    onError: (error) => {
      console.error('Recording actual dropoff failed:', error)
    },
  })
}

export function useProcessLateReturnFee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      processedBy, 
      processedAmount 
    }: { 
      bookingId: string
      processedBy: string
      processedAmount?: number
    }) => apiService.processLateReturnFee(bookingId, processedBy, processedAmount),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(variables.bookingId), data)
      // Invalidate bookings list and late return bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings('all') })
      queryClient.invalidateQueries({ queryKey: queryKeys.lateReturnBookings })
    },
    onError: (error) => {
      console.error('Processing late return fee failed:', error)
    },
  })
}

export function useMarkLateReturnNotificationSent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bookingId: string) => 
      apiService.markLateReturnNotificationSent(bookingId),
    onSuccess: (data, bookingId) => {
      // Update the specific booking in cache
      queryClient.setQueryData(queryKeys.booking(bookingId), data)
      // Invalidate late return bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.lateReturnBookings })
    },
    onError: (error) => {
      console.error('Marking notification as sent failed:', error)
    },
  })
}
