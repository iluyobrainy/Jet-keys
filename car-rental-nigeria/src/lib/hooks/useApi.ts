import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"
import { apiService, type CheckoutSettings, type Car, type Booking } from "@/lib/services/apiService"

interface CarsCatalogFilters {
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  dropoffDate?: string
  bodyType?: string
  fuelType?: string
  transmission?: string
  seats?: number
  minPrice?: number
  maxPrice?: number
}

interface CarsCatalogResponse {
  cars: Array<Car & { primaryImage?: string; allowedLocations?: string[] }>
  popularCars: Array<Car & { primaryImage?: string; allowedLocations?: string[] }>
  filters: {
    bodyTypes: string[]
    fuelTypes: string[]
    transmissions: string[]
    seats: number[]
  }
}

interface CarDetailsResponse {
  car: Car & { primaryImage?: string }
  allowedLocations: Array<{ id: string; label: string }>
  nearbyCars: Array<Car & { primaryImage?: string }>
  reviews: Array<Record<string, unknown>>
}

export const queryKeys = {
  checkoutSettings: ["checkoutSettings"] as const,
  carsCatalog: (filters: CarsCatalogFilters) => ["carsCatalog", filters] as const,
  cars: ["cars"] as const,
  adminCars: (search: string) => ["adminCars", search] as const,
  car: (id: string) => ["cars", id] as const,
  carDetails: (id: string) => ["carDetails", id] as const,
  bookings: (scope: string) => ["bookings", scope] as const,
  booking: (id: string) => ["booking", id] as const,
  refundRequests: (scope: string) => ["refundRequests", scope] as const,
  reviews: (carId?: string, scope?: string) => ["reviews", carId || "all", scope || "public"] as const,
  adminUsers: ["adminUsers"] as const,
  locations: ["locations"] as const,
}

export function useCheckoutSettings() {
  return useQuery({
    queryKey: queryKeys.checkoutSettings,
    queryFn: () => apiService.getCheckoutSettings(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useCarsCatalog(filters: CarsCatalogFilters) {
  return useQuery({
    queryKey: queryKeys.carsCatalog(filters),
    queryFn: async () => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value))
        }
      })

      return apiFetch<CarsCatalogResponse>(`/api/cars?${params.toString()}`, {
        skipAuth: true,
      })
    },
    staleTime: 60 * 1000,
  })
}

export function useCars() {
  return useQuery({
    queryKey: queryKeys.cars,
    queryFn: async () => {
      const response = await apiFetch<CarsCatalogResponse>("/api/cars", {
        skipAuth: true,
      })
      return response.cars
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminCars(search = "") {
  return useQuery({
    queryKey: queryKeys.adminCars(search),
    queryFn: async () => {
      const params = new URLSearchParams({
        admin: "true",
      })

      if (search) {
        params.set("search", search)
      }

      const response = await apiFetch<CarsCatalogResponse>(`/api/cars?${params.toString()}`)
      return response.cars
    },
    staleTime: 30 * 1000,
  })
}

export function useCar(id: string) {
  return useQuery({
    queryKey: queryKeys.car(id),
    queryFn: async () => {
      const response = await apiFetch<CarDetailsResponse>(`/api/cars/${id}`, {
        skipAuth: true,
      })
      return response.car
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCarDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.carDetails(id),
    queryFn: () => apiFetch<CarDetailsResponse>(`/api/cars/${id}`, { skipAuth: true }),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      const response = await apiFetch<{ booking: Booking }>(`/api/bookings/${id}`)
      return response.booking
    },
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}

export function useBookings(
  scope: "user" | "admin" = "user",
  options?: { status?: string; paymentStatus?: string; search?: string; enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.bookings(`${scope}-${options?.status || "all"}-${options?.paymentStatus || "all"}-${options?.search || ""}`),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (scope === "admin") {
        params.set("admin", "true")
      }
      if (options?.status) {
        params.set("status", options.status)
      }
      if (options?.paymentStatus) {
        params.set("paymentStatus", options.paymentStatus)
      }
      if (options?.search) {
        params.set("search", options.search)
      }

      const response = await apiFetch<{ bookings: Booking[] }>(`/api/bookings?${params.toString()}`)
      return response.bookings
    },
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingData: Record<string, unknown>) =>
      apiFetch<{ booking: Booking }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("user") })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
    },
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      apiFetch<{ booking: Booking }>(`/api/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.booking(variables.id), response.booking)
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("user") })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, cancellationData }: { bookingId: string; cancellationData: Record<string, unknown> }) =>
      apiFetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        body: JSON.stringify(cancellationData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("user") })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
      queryClient.invalidateQueries({ queryKey: queryKeys.refundRequests("user") })
      queryClient.invalidateQueries({ queryKey: queryKeys.refundRequests("admin") })
    },
  })
}

export function useRefundRequests(scope: "user" | "admin" = "user") {
  return useQuery({
    queryKey: queryKeys.refundRequests(scope),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (scope === "admin") {
        params.set("admin", "true")
      }

      const response = await apiFetch<{ refundRequests: Array<Record<string, unknown>> }>(
        `/api/refund-requests?${params.toString()}`,
      )
      return response.refundRequests
    },
    staleTime: 30 * 1000,
  })
}

export function useProcessRefundRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      apiFetch(`/api/refund-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refundRequests("admin") })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("user") })
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: async () => {
      const response = await apiFetch<{ users: Array<Record<string, unknown>> }>("/api/users")
      return response.users
    },
    staleTime: 30 * 1000,
  })
}

export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations,
    queryFn: async () => {
      const response = await apiFetch<{ locations: Array<Record<string, unknown>> }>("/api/locations", {
        skipAuth: true,
      })
      return response.locations
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch<{ car: Car }>("/api/cars", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCars"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.cars })
    },
  })
}

export function useUpdateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiFetch<{ car: Car }>(`/api/cars/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminCars"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.car(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.carDetails(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.cars })
    },
  })
}

export function useUploadCarImages() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      return apiFetch<{ images: string[] }>("/api/uploads/car-images", {
        method: "POST",
        body: formData,
      })
    },
  })
}

export function useReviews(carId?: string, scope: "public" | "admin" = "public") {
  return useQuery({
    queryKey: queryKeys.reviews(carId, scope),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (carId) {
        params.set("carId", carId)
      }
      if (scope === "admin") {
        params.set("admin", "true")
      }
      const response = await apiFetch<{ reviews: Array<Record<string, unknown>> }>(
        `/api/reviews?${params.toString()}`,
        { skipAuth: scope === "public" },
      )
      return response.reviews
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function useModerateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/reviews/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function usePricing(car: Car | null, days: number) {
  const { data: checkoutSettings } = useCheckoutSettings()

  return useQuery({
    queryKey: ["pricing", car?.id, days, checkoutSettings],
    queryFn: () => {
      if (!car || !checkoutSettings || days <= 0) return null
      return apiService.calculatePricing(car, days, checkoutSettings)
    },
    enabled: Boolean(car) && Boolean(checkoutSettings) && days > 0,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

export function useLateReturnBookings() {
  return useQuery({
    queryKey: ["lateReturnBookings"],
    queryFn: () => apiService.getLateReturnBookings(),
    staleTime: 60 * 1000,
  })
}

export function useRecordActualDropoff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, actualDropoffDate, actualDropoffTime, reason }: { bookingId: string; actualDropoffDate: string; actualDropoffTime?: string; reason?: string }) =>
      apiService.recordActualDropoff(bookingId, actualDropoffDate, actualDropoffTime, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lateReturnBookings"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
    },
  })
}

export function useProcessLateReturnFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, processedBy, processedAmount }: { bookingId: string; processedBy: string; processedAmount?: number }) =>
      apiService.processLateReturnFee(bookingId, processedBy, processedAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lateReturnBookings"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings("admin") })
    },
  })
}

export function useMarkLateReturnNotificationSent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => apiService.markLateReturnNotificationSent(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lateReturnBookings"] })
    },
  })
}
