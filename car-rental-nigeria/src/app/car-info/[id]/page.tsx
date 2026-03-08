"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { LocationPicker } from "@/components/location-picker"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { useCar, useCheckoutSettings, usePricing, useCreateBooking } from "@/lib/hooks/useApi"
import { useBookingPersistence } from "@/lib/hooks/useBookingPersistence"
import { useRentalValidation } from "@/lib/hooks/useRentalValidation"
import { RentalValidation } from "@/components/ui/rental-validation"
import { CarFeaturesDisplay, CarFeaturesCompact } from "@/components/car-features-display"
import { formatNumber } from "@/lib/formatters"
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  Settings,
  Car as CarIcon,
  CheckCircle,
  Flag,
  ChevronDown,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function CarInfoPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  
  // Use React Query hooks
  const { data: car, isLoading: carLoading, error: carError } = useCar(carId)
  const { data: checkoutSettings } = useCheckoutSettings()
  const createBookingMutation = useCreateBooking()
  
  // Use persistent booking form
  const { formData, updateField, clearSavedData, hasData } = useBookingPersistence(carId)
  
  // Use rental validation
  const rentalValidation = useRentalValidation(
    formData.pickupDate,
    formData.dropoffDate,
    formData.pickupTime,
    formData.dropoffTime
  )
  
  // Local state for UI
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Calculate days for pricing (considering times)
  const days = useMemo(() => {
    if (!formData.pickupDate || !formData.dropoffDate) return 0
    
    // Create proper datetime objects with times
    const pickupDateTime = new Date(formData.pickupDate)
    const dropoffDateTime = new Date(formData.dropoffDate)
    
    // Set pickup time if provided
    if (formData.pickupTime) {
      const [pickupHours, pickupMinutes] = formData.pickupTime.split(':').map(Number)
      pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0)
    }
    
    // Set dropoff time if provided
    if (formData.dropoffTime) {
      const [dropoffHours, dropoffMinutes] = formData.dropoffTime.split(':').map(Number)
      dropoffDateTime.setHours(dropoffHours, dropoffMinutes, 0, 0)
    }
    
    // Calculate duration using proper datetime objects
    const timeDiff = dropoffDateTime.getTime() - pickupDateTime.getTime()
    const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    console.log('🔍 Pricing Calculation Debug:', {
      pickupDateTime: pickupDateTime.toISOString(),
      dropoffDateTime: dropoffDateTime.toISOString(),
      pickupTime: formData.pickupTime,
      dropoffTime: formData.dropoffTime,
      calculatedDays,
      timeDiff,
      timeDiffHours: timeDiff / (1000 * 3600)
    })
    
    return calculatedDays
  }, [formData.pickupDate, formData.dropoffDate, formData.pickupTime, formData.dropoffTime])

  // Use pricing hook
  const { data: rentalDetails } = usePricing(car, days)

  // Handle booking submission
  const handleBooking = async () => {
    if (!formData.pickupLocation || !formData.dropoffLocation || !formData.pickupDate || !formData.dropoffDate || !rentalDetails) {
      alert('Please fill in all booking details')
      return
    }

    // Check rental validation
    if (!rentalValidation.canBook) {
      alert(`Cannot proceed with booking:\n${rentalValidation.errors.join('\n')}`)
      return
    }

    try {
      const bookingData = {
        car_id: carId,
        booking_type: 'car',
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        pickup_date: formData.pickupDate.toISOString(),
        dropoff_date: formData.dropoffDate.toISOString(),
        pickup_time: formData.pickupTime,
        dropoff_time: formData.dropoffTime,
        total_amount: rentalDetails.grandTotal,
        delivery_fee: rentalDetails.deliveryFee,
        vat_amount: rentalDetails.vatAmount,
        service_fee: rentalDetails.serviceFee,
        status: 'pending',
        payment_status: 'pending',
        customer_name: 'Customer Name', // Will be filled in checkout
        customer_email: 'customer@example.com', // Will be filled in checkout
        customer_phone: '+2340000000000', // Will be filled in checkout
        special_requests: `Pickup: ${formData.pickupTime}, Return: ${formData.dropoffTime}`
      }

      const data = await createBookingMutation.mutateAsync(bookingData)
      
      // Clear saved data after successful booking
      clearSavedData()
      
      // Redirect to checkout with booking ID
      router.push(`/checkout?bookingId=${data.id}&carId=${carId}`)
      
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  // Use car images or fallback to default images
  const carImages = useMemo(() => {
    if (car?.images && car.images.length > 0) {
      // Filter out any invalid image URLs (like /uploads/ paths that don't exist)
      const validImages = car.images.filter(img => 
        img && 
        !img.startsWith('/uploads/') && 
        (img.startsWith('http') || img.startsWith('/'))
      )
      if (validImages.length > 0) {
        return validImages
      }
    }
    // Fallback to default images
    return [
      "/Carinfoui/car-main.jpg",
      "/Carinfoui/car-interior.jpg", 
      "/Carinfoui/car-rear.jpg",
      "/Carinfoui/car-front.jpg"
    ]
  }, [car?.images])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + carImages.length) % carImages.length)
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % carImages.length)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [carImages.length])

  // Auto-slide carousel every 4 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused, carImages.length])

  // If car not found, show error or redirect
  if (carLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 w-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (carError || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
          <p className="text-gray-600 mb-6">The car you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Handle touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentImageIndex((currentImageIndex + 1) % carImages.length)
    } else if (isRightSwipe) {
      setCurrentImageIndex((currentImageIndex - 1 + carImages.length) % carImages.length)
    }
  }

  // Convert car data to feature format
  const carFeatures = [
    { id: 'seats', value: car.seats, label: 'Seats', icon: 'seats', type: 'number' },
    { id: 'doors', value: car.doors, label: 'Doors', icon: 'doors', type: 'number' },
    { id: 'mileage', value: car.mileage, label: 'Mileage', icon: 'mileage', type: 'number', suffix: 'km' },
    { id: 'fuel_type', value: car.fuel_type, label: 'Fuel Type', icon: 'fuel_type', type: 'text' },
    { id: 'transmission', value: car.transmission, label: 'Transmission', icon: 'transmission', type: 'text' },
    { id: 'year', value: car.year, label: 'Year', icon: 'year', type: 'number' },
    { id: 'color', value: car.color, label: 'Color', icon: 'color', type: 'text' }
  ]

  // Parse features from car.features array
  const parsedFeatures = car.features?.map(feature => {
    // Check if it's a boolean feature (just the name)
    const booleanFeatures = [
      'GPS Navigation', 'Air Conditioning', 'Cruise Control', 'Power Windows',
      'Apple CarPlay', 'Android Auto', 'Aux Input', 'Bluetooth', 'Premium Sound System',
      'Heated Seats', 'Leather Seats', 'Power Steering', 'Sunroof', 'ABS Brakes',
      'Airbags', 'Backup Camera', 'Parking Sensors', 'Lane Assist', 'Blind Spot Monitoring',
      'Adaptive Cruise Control', 'Emergency Braking', 'Wireless Charging'
    ]
    
    if (booleanFeatures.includes(feature)) {
      return {
        id: feature.toLowerCase().replace(/\s+/g, '_'),
        value: true,
        label: feature,
        icon: feature.toLowerCase().replace(/\s+/g, '_'),
        type: 'boolean' as const
      }
    }
    
    // Check if it's a key-value feature (e.g., "Seats: 5")
    if (feature.includes(':')) {
      const [label, value] = feature.split(':').map(s => s.trim())
      return {
        id: label.toLowerCase().replace(/\s+/g, '_'),
        value: value,
        label: label,
        icon: label.toLowerCase().replace(/\s+/g, '_'),
        type: 'text' as const
      }
    }
    
    return null
  }).filter(Boolean) || []

  const allFeatures = [...carFeatures, ...parsedFeatures]

  const reviews = [
    {
      name: "Marvin McKinney",
      avatar: "/Carinfoui/avatar1.jpg",
      rating: 5,
      date: "2 days ago",
      content: "Garazi made our road trip a breeze with extensive fleet and detailed descriptions."
    },
    {
      name: "Bessi Rakabuming", 
      avatar: "/Carinfoui/avatar2.jpg",
      rating: 5,
      date: "3 days ago",
      content: "Garazi is our go-to for business travel and the Car Details page is a game-changer."
    },
    {
      name: "Kristin Watson",
      avatar: "/Carinfoui/avatar3.jpg", 
      rating: 5,
      date: "3 days ago",
      content: "Garazi blends technology with a top-notch rental experience and intuitive design."
    }
  ]

  const nearbyCars = [
    {
      image: "/Carinfoui/toyota-innova.jpg",
      title: "2020 - Toyota Innova",
      provider: "Bung Handuk",
      distance: "2.2 km from centre",
      features: ["7 seats", "Manual"],
      rating: 4.0,
      reviews: 180,
      price: "NGN 150,000 /day"
    },
    {
      image: "/Carinfoui/toyota-landcruiser.jpg", 
      title: "2022 Toyota Land C...",
      provider: "Provider name",
      distance: "distance from centre",
      features: ["features"],
      rating: 4.0,
      reviews: 180,
      price: "NGN 150,000 /day"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Our Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="pt-4 pb-2">
          <Button
            variant="outline"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Car Selection</span>
          </Button>
        </div>
        {/* Full Width Car Gallery - Grid Layout */}
        <div className="mb-8 mt-16">
          <div className="relative">
            {/* Grid Container */}
            <div 
              className="flex items-center justify-center gap-2 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {carImages.map((image, index) => {
                const isActive = index === currentImageIndex
                
                return (
                  <div
                    key={index}
                    className={`relative transition-all duration-500 ease-in-out cursor-pointer ${
                      isActive 
                        ? 'w-[60%] h-[300px] md:h-[350px]' 
                        : 'w-[12%] h-[300px] md:h-[350px]'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <div className={`relative w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-lg transition-all duration-500 ${
                      isActive ? 'shadow-xl' : 'hover:shadow-md'
                    }`}>
                      <Image
                        src={image}
                        alt={`Chery Tiggo 4 Pro view ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {index + 1}
                        </div>
                      )}
                      
                      {/* Pause indicator */}
                      {isActive && isPaused && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ⏸️ Paused
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentImageIndex((currentImageIndex - 1 + carImages.length) % carImages.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
            >
              <ArrowRight className="h-5 w-5 text-gray-700 rotate-180" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((currentImageIndex + 1) % carImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
            >
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-4">
              {carImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-purple-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Car Info */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                          <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{car.year} - {car.brand} {car.model}</h1>
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span>{car.location}</span>
                            <span>{car.distance}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-blue-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Free cancellation
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {car.rating} ({car.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                <CarFeaturesDisplay features={allFeatures} />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700">
                  {car.description || `${car.brand} ${car.model} is a reliable vehicle perfect for your transportation needs.`}
                </p>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Image
                    src="/Carinfoui/owner-avatar.jpg"
                    alt="Owner avatar"
                    width={60}
                    height={60}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{car.owner?.name || "Car Owner"}</h3>
                      {car.owner?.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {car.rating} ({car.reviews} reviews)
                      </span>
                        <span>Joined {car.owner?.joinedDate || "recently"}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Map</p>
                      <p className="text-sm text-gray-500">Street view with zoom controls</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">4.0 (180 reviews)</span>
                    <Button variant="outline" size="sm">
                      All reviews <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 sm:gap-4 sm:p-4">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-gray-900">{review.name}</h4>
                          <div className="flex shrink-0">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 sm:text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="flex w-full items-center justify-center sm:w-auto">
                    See All Reviews <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Other Cars Nearby */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Other Cars Nearby</h2>
                <div className="space-y-4">
                  {nearbyCars.map((nearbyCar, index) => (
                    <div key={index} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 transition-shadow hover:shadow-md sm:flex-row sm:gap-4 sm:p-4">
                      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-200 sm:h-16 sm:w-20">
                        <Image
                          src={nearbyCar.image}
                          alt={nearbyCar.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 font-medium text-gray-900">{nearbyCar.title}</h3>
                        <p className="mb-2 text-sm text-gray-600">{nearbyCar.provider} - {nearbyCar.distance}</p>
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{nearbyCar.features.join(" - ")}</span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-blue-600">Free cancellation</span>
                            <span className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {nearbyCar.rating} ({nearbyCar.reviews} reviews)
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-gray-500">Basic price from</p>
                            <p className="font-semibold text-gray-900">{nearbyCar.price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Book Information</h2>
                
                {/* Duration Note */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-purple-800">
                    Duration maximum to rent this car is 1 month.
                  </p>
                </div>

                {/* Booking Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                    <LocationPicker
                      value={formData.pickupLocation}
                      onChange={(value) => updateField('pickupLocation', value)}
                      placeholder="Select pickup location"
                      />
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date & Time</label>
                    <DatePickerWithTime
                      value={formData.pickupDate}
                      timeValue={formData.pickupTime}
                      onChange={(value) => updateField('pickupDate', value)}
                      onTimeChange={(value) => updateField('pickupTime', value)}
                      placeholder="Select pickup date & time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Location</label>
                    <LocationPicker
                      value={formData.dropoffLocation}
                      onChange={(value) => updateField('dropoffLocation', value)}
                      placeholder="Select drop-off location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date & Time</label>
                    <DatePickerWithTime
                      value={formData.dropoffDate}
                      timeValue={formData.dropoffTime}
                      onChange={(value) => updateField('dropoffDate', value)}
                      onTimeChange={(value) => updateField('dropoffTime', value)}
                      placeholder="Select return date & time"
                    />
                  </div>
                </div>

                {/* Rental Validation */}
                <RentalValidation
                  isValid={rentalValidation.isValid}
                  errors={rentalValidation.errors}
                  warnings={rentalValidation.warnings}
                  days={rentalValidation.days}
                  hours={rentalValidation.hours}
                  canBook={rentalValidation.canBook}
                  checkoutSettings={checkoutSettings}
                />

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  {rentalDetails ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Price ({rentalDetails.days} days)</span>
                        <span className="text-gray-900">NGN {formatNumber(rentalDetails.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-900">NGN {formatNumber(rentalDetails.deliveryFee)}</span>
                      </div>
                      {rentalDetails.insuranceFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Insurance Fee</span>
                          <span className="text-gray-900">NGN {formatNumber(rentalDetails.insuranceFee)}</span>
                        </div>
                      )}
                      {rentalDetails.vatAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">VAT ({checkoutSettings?.vat_rate || 0}%)</span>
                          <span className="text-gray-900">NGN {formatNumber(rentalDetails.vatAmount)}</span>
                        </div>
                      )}
                      {rentalDetails.serviceFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Service Fee ({checkoutSettings?.service_fee_rate || 0}%)</span>
                          <span className="text-gray-900">NGN {formatNumber(rentalDetails.serviceFee)}</span>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Price</span>
                          <span className="text-lg font-bold text-yellow-600">NGN {formatNumber(rentalDetails.grandTotal)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">NGN {formatNumber(checkoutSettings?.delivery_fee || 20000)}</span>
                  </div>
                  {checkoutSettings?.insurance_fee && checkoutSettings.insurance_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance Fee</span>
                      <span className="text-gray-900">NGN {formatNumber(checkoutSettings.insurance_fee)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Price</span>
                          <span className="text-lg font-bold text-yellow-600">Select dates to calculate</span>
                    </div>
                  </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleBooking}
                    disabled={createBookingMutation.isPending || !rentalDetails || !rentalValidation.canBook}
                    className="w-full bg-black text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600 hover:text-white hover:shadow-lg hover:shadow-yellow-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Booking...
                      </>
                    ) : (
                      'Continue to Checkout'
                    )}
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <Flag className="h-4 w-4 mr-2" />
                    Report This Car
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Footer */}
      <FooterSection />
    </div>
  )
}

