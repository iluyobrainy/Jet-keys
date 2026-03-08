"use client"

import { useState, useMemo, useCallback, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { CarNavMenu } from "@/components/car-nav-menu"
import { PopularVehicleCard } from "@/components/popular-vehicle-card"
import { OthersVehicleCard } from "@/components/others-vehicle-card"
import { PaginationControls } from "@/components/pagination-controls"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LocationPicker } from "@/components/location-picker"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useCars } from "@/lib/hooks/useApi"
import { useComponentPerformance } from "@/lib/hooks/usePerformance"
import { 
  ArrowRight,
  Filter,
  X,
  Loader2
} from "lucide-react"

// Mock data for popular vehicles
const popularVehicles = [
  {
    id: "hyundai-palisade",
    model: "2022 - Hyundai Palisade Facelift",
    location: "Garasi Cak Su",
    distance: "1.6 km",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/hyundai-palisade.jpg",
    rating: "5.0",
    trips: "180"
  },
  {
    id: "honda-hrv",
    model: "2022 - Honda HR-V Turbo",
    location: "Rakabuming Suhu",
    distance: "2.2 km",
    price: "NGN 150,000 / day",
    imageSrc: "/Carsectionui/honda-hrv.jpg",
    rating: "5.0",
    trips: "211"
  }
]

interface CarData {
  id: string
  year: string
  brand: string
  model: string
  location: string
  distance: string
  seats: string
  transmission: string
  rating: string
  reviews: string
  price: string
  imageSrc: string
  images: string[]
  description: string
  features: string[]
  owner: {
    name: string
    avatar: string
    verified: boolean
    responseRate: string
    responseDuration: string
    joinedDate: string
  }
}

// Loading component
function CarsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading cars...</span>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  )
}

// Error component
function CarsError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to load cars</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={retry}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  )
}

// Main component
function CarsContent() {
  // Performance monitoring
  useComponentPerformance('CarsContent')
  
  // Get search parameters from URL
  const searchParams = useSearchParams()
  
  // Use React Query for data fetching
  const { data: cars = [], isLoading, error, refetch } = useCars()
  
  // Local state for form and UI
  const [pickupDate, setPickupDate] = useState<Date>()
  const [dropoffDate, setDropoffDate] = useState<Date>()
  const [pickupLocation, setPickupLocation] = useState<string>("")
  const [dropoffLocation, setDropoffLocation] = useState<string>("")
  const [pickupTime, setPickupTime] = useState<string | null>("10:00")
  const [dropoffTime, setDropoffTime] = useState<string | null>("10:00")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Initialize form data from URL parameters
  useEffect(() => {
    if (searchParams) {
      const urlPickupLocation = searchParams.get('pickupLocation')
      const urlDropoffLocation = searchParams.get('dropoffLocation')
      const urlPickupDate = searchParams.get('pickupDate')
      const urlDropoffDate = searchParams.get('dropoffDate')
      const urlPickupTime = searchParams.get('pickupTime')
      const urlDropoffTime = searchParams.get('dropoffTime')
      
      if (urlPickupLocation) setPickupLocation(urlPickupLocation)
      if (urlDropoffLocation) setDropoffLocation(urlDropoffLocation)
      if (urlPickupDate) setPickupDate(new Date(urlPickupDate))
      if (urlDropoffDate) setDropoffDate(new Date(urlDropoffDate))
      if (urlPickupTime) setPickupTime(urlPickupTime)
      if (urlDropoffTime) setDropoffTime(urlDropoffTime)
    }
  }, [searchParams])
  
  // Mock booked dates for demonstration
  const bookedDates = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 26), // Boxing Day
    new Date(2024, 11, 31), // New Year's Eve
    new Date(2025, 0, 1),   // New Year's Day
  ]
  
  // Pagination settings
  const CARS_PER_PAGE = 12

  // Filter and transform cars data for display
  const transformedCars = useMemo(() => {
    let filteredCars = cars

    // Apply location-based filtering if search criteria are provided
    if (pickupLocation || dropoffLocation) {
      filteredCars = cars.filter(car => {
        // For now, we'll show all cars regardless of location
        // In a real implementation, you would filter based on:
        // - Car availability in the pickup location
        // - Car availability in the dropoff location
        // - Distance between locations
        return true
      })
    }

    // Apply date-based filtering if dates are provided
    if (pickupDate && dropoffDate) {
      filteredCars = filteredCars.filter(car => {
        // For now, we'll show all cars regardless of dates
        // In a real implementation, you would filter based on:
        // - Car availability during the selected dates
        // - Existing bookings that conflict with the dates
        return true
      })
    }

    return filteredCars.map(car => ({
      id: car.id,
      year: car.year.toString(),
      brand: car.brand,
      model: car.model,
      location: car.location,
      distance: "2.2 km from centre",
      seats: `${car.seats} seats`,
      transmission: car.transmission,
      rating: "4.0",
      reviews: "180",
      price: `NGN ${car.price_per_day.toLocaleString()} / day`,
      imageSrc: (() => {
        if (car.images && car.images.length > 0) {
          const validImage = car.images.find(img => 
            img && 
            !img.startsWith('/uploads/') && 
            (img.startsWith('http') || img.startsWith('/'))
          )
          if (validImage) return validImage
        }
        return "/Carsectionui/toyota-innova.jpg"
      })(),
      images: car.images || [],
      description: car.description,
      features: car.features || [],
      owner: {
        name: "Rakabuming Hubner",
        avatar: "/Carinfoui/owner-avatar.jpg",
        verified: true,
        responseRate: "100%",
        responseDuration: "1 hour",
        joinedDate: "8 months ago"
      }
    }))
  }, [cars, pickupLocation, dropoffLocation, pickupDate, dropoffDate])
  
  // Memoized calculations
  const totalPages = useMemo(() => {
    return Math.ceil(transformedCars.length / CARS_PER_PAGE)
  }, [transformedCars.length, CARS_PER_PAGE])
  
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE
    return transformedCars.slice(startIndex, startIndex + CARS_PER_PAGE)
  }, [transformedCars, currentPage, CARS_PER_PAGE])
  
  // Memoized callbacks
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
  const handleSearch = useCallback(() => {
    if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
      alert('Please fill in all search fields')
      return
    }
    // Navigate to search results or filter cars
    console.log('Searching with:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate })
  }, [pickupLocation, dropoffLocation, pickupDate, dropoffDate])
  
  // Error handling
  if (error) {
    return <CarsError error={error} retry={refetch} />
  }
  
  // Loading state
  if (isLoading) {
    return <CarsLoading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Booking Form - Same as Homepage */}
      <section className="relative py-6 sm:py-8" aria-label="Car Rental Booking Form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Mobile/Tablet Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:hidden">
                  {/* Pick-up Location */}
                  <div className="space-y-2">
                    <label htmlFor="pickup-location" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Pick-up Location</label>
                    <LocationPicker
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      placeholder="Select pick-up location"
                      id="pickup-location"
                    />
                  </div>

                  {/* Pick-up Date & Time */}
                  <div className="space-y-2">
                    <label htmlFor="pickup-datetime" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Pick-up Date & Time</label>
                    <DatePickerWithTime
                      value={pickupDate}
                      timeValue={pickupTime}
                      onChange={setPickupDate}
                      onTimeChange={setPickupTime}
                      disabledDates={bookedDates}
                      placeholder="Select pick-up date & time"
                      id="pickup-datetime"
                    />
                  </div>

                  {/* Drop-off Location */}
                  <div className="space-y-2">
                    <label htmlFor="dropoff-location" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Drop-off Location</label>
                    <LocationPicker
                      value={dropoffLocation}
                      onChange={setDropoffLocation}
                      placeholder="Select drop-off location"
                      id="dropoff-location"
                    />
                  </div>

                  {/* Drop-off Date & Time */}
                  <div className="space-y-2">
                    <label htmlFor="dropoff-datetime" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Drop-off Date & Time</label>
                    <DatePickerWithTime
                      value={dropoffDate}
                      timeValue={dropoffTime}
                      onChange={setDropoffDate}
                      onTimeChange={setDropoffTime}
                      disabledDates={bookedDates}
                      placeholder="Select drop-off date & time"
                      id="dropoff-datetime"
                    />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-row gap-4 items-end">
                  {/* Pick-up Location */}
                  <div className="flex-1 space-y-2">
                    <label htmlFor="pickup-location-desktop" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Pick-up Location</label>
                    <LocationPicker
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      placeholder="Select pick-up location"
                      id="pickup-location-desktop"
                    />
                  </div>

                  {/* Pick-up Date & Time */}
                  <div className="flex-1 space-y-2">
                    <label htmlFor="pickup-datetime-desktop" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Pick-up Date & Time</label>
                    <DatePickerWithTime
                      value={pickupDate}
                      timeValue={pickupTime}
                      onChange={setPickupDate}
                      onTimeChange={setPickupTime}
                      disabledDates={bookedDates}
                      placeholder="Select pick-up date & time"
                      id="pickup-datetime-desktop"
                    />
                  </div>

                  {/* Drop-off Location */}
                  <div className="flex-1 space-y-2">
                    <label htmlFor="dropoff-location-desktop" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Drop-off Location</label>
                    <LocationPicker
                      value={dropoffLocation}
                      onChange={setDropoffLocation}
                      placeholder="Select drop-off location"
                      id="dropoff-location-desktop"
                    />
                  </div>

                  {/* Drop-off Date & Time */}
                  <div className="flex-1 space-y-2">
                    <label htmlFor="dropoff-datetime-desktop" className="block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Drop-off Date & Time</label>
                    <DatePickerWithTime
                      value={dropoffDate}
                      timeValue={dropoffTime}
                      onChange={setDropoffDate}
                      onTimeChange={setDropoffTime}
                      disabledDates={bookedDates}
                      placeholder="Select drop-off date & time"
                      id="dropoff-datetime-desktop"
                    />
                  </div>

                  {/* Find Vehicle Button - Now on same line */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-transparent mb-2">&nbsp;</label>
                    <Button 
                      className="h-14 w-full rounded-2xl bg-black px-6 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 group hover:bg-yellow-500 hover:text-white sm:min-w-[220px]"
                      onClick={() => {
                        if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
                          return
                        }
                        // Handle vehicle search here
                        console.log('Searching for vehicles...')
                      }}
                      aria-label="Find available vehicles for selected dates and locations"
                    >
                      <span>Find a Vehicle</span>
                      <ArrowRight className="ml-2 h-4 w-4 text-yellow-400 transition-colors duration-200 group-hover:text-white" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {/* Find Vehicle Button - Mobile */}
                <div className="flex justify-center lg:hidden pt-2 sm:pt-4">
                  <Button 
                    className="h-14 w-full rounded-2xl bg-black px-6 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 group hover:bg-yellow-500 hover:text-white sm:min-w-[220px]"
                    onClick={() => {
                      if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
                        return
                      }
                      // Handle vehicle search here
                      console.log('Searching for vehicles...')
                    }}
                    aria-label="Find available vehicles for selected dates and locations"
                  >
                    <span>Find a Vehicle</span>
                    <ArrowRight className="ml-2 h-4 w-4 text-yellow-400 transition-colors duration-200 group-hover:text-white" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar Navigation Menu */}
        <div className="hidden md:block">
          <CarNavMenu />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div 
              className="fixed left-0 top-0 h-full w-80 bg-white z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CarNavMenu />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden bg-white border-b p-4">
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(true)}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              Show Filters
            </Button>
          </div>

          {/* Car Selection Content */}
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Header */}
              <div className="flex justify-end mb-6">
                <p className="text-sm font-medium text-gray-600">
                  {isLoading ? 'Loading...' : `Showing ${transformedCars.length} Vehicles available`}
                </p>
              </div>

              {/* Popular Vehicles Section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Vehicles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularVehicles.map((vehicle) => (
                    <PopularVehicleCard
                      key={vehicle.id}
                      id={vehicle.id}
                      model={vehicle.model}
                      location={vehicle.location}
                      distance={vehicle.distance}
                      price={vehicle.price}
                      imageSrc={vehicle.imageSrc}
                      rating={vehicle.rating}
                      trips={vehicle.trips}
                    />
                  ))}
                </div>
              </section>

              {/* Others Section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  All Vehicles ({transformedCars.length})
                </h2>
                {paginatedCars.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No vehicles available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedCars.map((vehicle) => (
                    <OthersVehicleCard
                      key={vehicle.id}
                      id={vehicle.id}
                      year={vehicle.year}
                      brand={vehicle.brand}
                      model={vehicle.model}
                      location={vehicle.location}
                      distance={vehicle.distance}
                      seats={vehicle.seats}
                      transmission={vehicle.transmission}
                      rating={vehicle.rating}
                      reviews={vehicle.reviews}
                      price={vehicle.price}
                      imageSrc={vehicle.imageSrc}
                    />
                  ))}
                  </div>
                )}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={transformedCars.length}
                  itemsPerPage={CARS_PER_PAGE}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={() => {}} // Not used in this implementation
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}

// Main export with error boundary
export default function CarsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CarsLoading />}>
        <CarsContent />
      </Suspense>
    </ErrorBoundary>
  )
}
