// app/cars/page.tsx - Optimized Version
"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
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
import { OptimizedImage } from "@/components/ui/optimized-image"
import { PageLoading, SkeletonGrid } from "@/components/ui/page-loading"
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
    reviews: "12",
    seats: "7",
    transmission: "Automatic",
    year: "2022",
    brand: "Hyundai",
    images: ["/Carsectionui/hyundai-palisade.jpg"],
    description: "Luxury SUV with premium features",
    features: ["GPS", "Bluetooth", "Air Conditioning"],
    owner: {
      name: "Cak Su",
      avatar: "/avatars/cak-su.jpg",
      verified: true,
      responseRate: "100%",
      responseDuration: "< 1 hour",
      joinedDate: "2020"
    }
  },
  // Add more popular vehicles...
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <SkeletonGrid count={12} />
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
  const [showFilterModal, setShowFilterModal] = useState(false)
  
  // Pagination settings
  const CARS_PER_PAGE = 12
  
  // Memoized calculations
  const totalPages = useMemo(() => {
    return Math.ceil(cars.length / CARS_PER_PAGE)
  }, [cars.length, CARS_PER_PAGE])
  
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE
    return cars.slice(startIndex, startIndex + CARS_PER_PAGE)
  }, [cars, currentPage, CARS_PER_PAGE])
  
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Car
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Premium car rental service for high-end clients
            </p>
            
            {/* Search Form */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location
                    </label>
                    <LocationPicker
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      placeholder="Select pickup location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drop-off Location
                    </label>
                    <LocationPicker
                      value={dropoffLocation}
                      onChange={setDropoffLocation}
                      placeholder="Select drop-off location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date & Time
                    </label>
                    <DatePickerWithTime
                      value={pickupDate}
                      timeValue={pickupTime}
                      onChange={setPickupDate}
                      onTimeChange={setPickupTime}
                      placeholder="Select pickup date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date & Time
                    </label>
                    <DatePickerWithTime
                      value={dropoffDate}
                      timeValue={dropoffTime}
                      onChange={setDropoffDate}
                      onTimeChange={setDropoffTime}
                      placeholder="Select return date"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Search Cars
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <CarNavMenu />
      
      {/* Popular Vehicles */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Vehicles</h2>
          <Button variant="outline" onClick={() => setShowFilterModal(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {popularVehicles.map((vehicle) => (
            <PopularVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>

      {/* All Vehicles */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            All Vehicles ({cars.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCars.map((car) => (
            <OthersVehicleCard key={car.id} vehicle={car} />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
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


