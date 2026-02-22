"use client"

import { Navigation } from "@/components/navigation"
import { CarSpecifications } from "@/components/car-specifications"
import { FeatureSection } from "@/components/feature-section"
import { BrandSection } from "@/components/brand-section"
import { OurServicesSection } from "@/components/our-services-section"
import { WhatWeProvideSection } from "@/components/what-we-provide-section"
import { ReviewSection } from "@/components/review-section"
import { FAQSection } from "@/components/faq-section"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LocationPicker } from "@/components/location-picker"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { 
  ArrowRight
} from "lucide-react"
import Image from "next/image"
import { useState, useMemo, lazy, Suspense, memo } from "react"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { useWebsiteSettings } from "@/lib/hooks/useWebsiteSettings"

// Lazy load heavy components
const AuroraBackground = lazy(() => import("@/components/ui/aurora-background").then(module => ({ default: module.AuroraBackground })))

// Memoized booking form component
const BookingForm = memo(({ 
  pickupLocation, 
  setPickupLocation, 
  dropoffLocation, 
  setDropoffLocation, 
  pickupDate, 
  setPickupDate, 
  dropoffDate, 
  setDropoffDate, 
  pickupTime, 
  setPickupTime, 
  dropoffTime, 
  setDropoffTime, 
  bookedDates 
}: {
  pickupLocation: string
  setPickupLocation: (value: string) => void
  dropoffLocation: string
  setDropoffLocation: (value: string) => void
  pickupDate: Date | undefined
  setPickupDate: (value: Date | undefined) => void
  dropoffDate: Date | undefined
  setDropoffDate: (value: Date | undefined) => void
  pickupTime: string | null
  setPickupTime: (value: string | null) => void
  dropoffTime: string | null
  setDropoffTime: (value: string | null) => void
  bookedDates: Date[]
}) => {
  const router = useRouter()

  const handleFindVehicle = () => {
    if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
      alert('Please fill in all required fields')
      return
    }

    // Create search parameters
    const searchParams = new URLSearchParams({
      pickupLocation,
      dropoffLocation,
      pickupDate: pickupDate.toISOString().split('T')[0],
      dropoffDate: dropoffDate.toISOString().split('T')[0],
      ...(pickupTime && { pickupTime }),
      ...(dropoffTime && { dropoffTime })
    })

    // Navigate to cars page with search criteria
    router.push(`/cars?${searchParams.toString()}`)
  }

  return (
  <section className="relative -mt-16 sm:-mt-20 pb-6 sm:pb-8" aria-label="Car Rental Booking Form">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="shadow-xl border-0">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Mobile/Tablet Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:hidden">
              {/* Pick-up Location */}
              <div>
                <label htmlFor="pickup-location" className="block text-sm font-medium text-gray-700 mb-2">Pick-up Location</label>
                <LocationPicker
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Select pick-up location"
                />
              </div>

              {/* Pick-up Date & Time */}
              <div>
                <label htmlFor="pickup-datetime" className="block text-sm font-medium text-gray-700 mb-2">Pick-up Date & Time</label>
                <DatePickerWithTime
                  value={pickupDate}
                  timeValue={pickupTime}
                  onChange={setPickupDate}
                  onTimeChange={setPickupTime}
                  disabledDates={bookedDates}
                  placeholder="Select pick-up date & time"
                />
              </div>

              {/* Drop-off Location */}
              <div>
                <label htmlFor="dropoff-location" className="block text-sm font-medium text-gray-700 mb-2">Drop-off Location</label>
                <LocationPicker
                  value={dropoffLocation}
                  onChange={setDropoffLocation}
                  placeholder="Select drop-off location"
                />
              </div>

              {/* Drop-off Date & Time */}
              <div>
                <label htmlFor="dropoff-datetime" className="block text-sm font-medium text-gray-700 mb-2">Drop-off Date & Time</label>
                <DatePickerWithTime
                  value={dropoffDate}
                  timeValue={dropoffTime}
                  onChange={setDropoffDate}
                  onTimeChange={setDropoffTime}
                  disabledDates={bookedDates}
                  placeholder="Select drop-off date & time"
                />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex flex-row gap-4 items-end">
              {/* Pick-up Location */}
              <div className="flex-1">
                <label htmlFor="pickup-location-desktop" className="block text-sm font-medium text-gray-700 mb-2">Pick-up Location</label>
                <LocationPicker
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Select pick-up location"
                />
              </div>

              {/* Pick-up Date & Time */}
              <div className="flex-1">
                <label htmlFor="pickup-datetime-desktop" className="block text-sm font-medium text-gray-700 mb-2">Pick-up Date & Time</label>
                <DatePickerWithTime
                  value={pickupDate}
                  timeValue={pickupTime}
                  onChange={setPickupDate}
                  onTimeChange={setPickupTime}
                  disabledDates={bookedDates}
                  placeholder="Select pick-up date & time"
                />
              </div>

              {/* Drop-off Location */}
              <div className="flex-1">
                <label htmlFor="dropoff-location-desktop" className="block text-sm font-medium text-gray-700 mb-2">Drop-off Location</label>
                <LocationPicker
                  value={dropoffLocation}
                  onChange={setDropoffLocation}
                  placeholder="Select drop-off location"
                />
              </div>

              {/* Drop-off Date & Time */}
              <div className="flex-1">
                <label htmlFor="dropoff-datetime-desktop" className="block text-sm font-medium text-gray-700 mb-2">Drop-off Date & Time</label>
                <DatePickerWithTime
                  value={dropoffDate}
                  timeValue={dropoffTime}
                  onChange={setDropoffDate}
                  onTimeChange={setDropoffTime}
                  disabledDates={bookedDates}
                  placeholder="Select drop-off date & time"
                />
              </div>
            </div>

            {/* Find Vehicle Button */}
            <div className="flex justify-center lg:justify-end pt-4">
              <Button 
                className="bg-black text-white hover:bg-yellow-500 hover:text-white h-12 px-6 sm:px-8 rounded-[30px] flex items-center space-x-2 whitespace-nowrap w-full sm:w-auto min-w-[160px] sm:min-w-[180px] disabled:opacity-100 transition-colors duration-200 group"
                onClick={handleFindVehicle}
                aria-label="Find available vehicles for selected dates and locations"
              >
                <span>Find a Vehicle</span>
                <ArrowRight className="h-4 w-4 text-yellow-400 group-hover:text-white transition-colors duration-200" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
  )
})

BookingForm.displayName = "BookingForm"

export default function OptimizedHomePage() {
  const { data: websiteSettings, isLoading: settingsLoading } = useWebsiteSettings()
  const [pickupDate, setPickupDate] = useState<Date>()
  const [dropoffDate, setDropoffDate] = useState<Date>()
  const [pickupLocation, setPickupLocation] = useState<string>("")
  const [dropoffLocation, setDropoffLocation] = useState<string>("")
  const [pickupTime, setPickupTime] = useState<string | null>("10:00")
  const [dropoffTime, setDropoffTime] = useState<string | null>("10:00")

  // Memoize booked dates to prevent recreation on every render
  const bookedDates = useMemo(() => [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 26), // Boxing Day
    new Date(2024, 11, 31), // New Year's Eve
    new Date(2025, 0, 1),   // New Year's Day
  ], [])

  // Memoize structured data for SEO
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CarRentalService",
    "name": "Car Rental Nigeria",
    "description": "Premium car rental services across Nigeria. Book your car today and pay on the spot.",
    "url": "https://carrentalnigeria.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressCountry": "Nigeria"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "Nigeria"
    },
    "offers": {
      "@type": "Offer",
      "description": "Car rental services with flexible booking options"
    }
  }), [])

  return (
    <>
      <Head>
        <title>{websiteSettings?.site_name || "Car Rental Nigeria"} - {websiteSettings?.site_description || "Premium Vehicle Hire Services"} | Book & Pay on Spot</title>
        <meta name="description" content={websiteSettings?.site_description || "Premium car rental services across Nigeria. Book your car today and pay on the spot. Available in Lagos, Abuja, Port Harcourt and major cities."} />
        <meta name="keywords" content={websiteSettings?.site_keywords || "car rental, nigeria, lagos, vehicle hire, car hire, rent car, pay on spot, nigeria car rental"} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${websiteSettings?.site_name || "Car Rental Nigeria"} - ${websiteSettings?.site_description || "Premium Vehicle Hire Services"}`} />
        <meta property="og:description" content={websiteSettings?.site_description || "Premium car rental services across Nigeria. Book your car today and pay on the spot."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://carrentalnigeria.com" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Car Rental Nigeria - Premium Vehicle Hire Services" />
        <meta name="twitter:description" content="Premium car rental services across Nigeria. Book your car today and pay on the spot." />
        <meta name="twitter:image" content="/twitter-image.jpg" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Aurora Background wrapping entire content */}
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
          <AuroraBackground className="bg-transparent" showRadialGradient={true}>
            {/* Navigation */}
            <Navigation />

            {/* Hero Section */}
            <section className="pt-16" aria-label="Hero">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Column - Content */}
                  <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                    <div>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl text-black leading-tight">
                        {settingsLoading ? (
                          <div className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded mb-2"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                          </div>
                        ) : (
                          <>
                            <span className="font-normal">{websiteSettings?.hero_title || "LET'S RIDE"}</span>
                            <br />
                            <span className="font-medium">THE FUTURE.</span>
                          </>
                        )}
                      </h1>
                      <div className="w-24 h-1 bg-orange-500 mt-4 mx-auto lg:mx-0"></div>
                    </div>
                    
                    <p className="text-base sm:text-lg text-black max-w-lg mx-auto lg:mx-0">
                      {settingsLoading ? (
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ) : (
                        websiteSettings?.hero_subtitle || "Introducing premium transportation solutions with Hyundai Palisade Facelift and private jet services, offering advanced safety and luxury features for your family trips and business needs."
                      )}
                    </p>
                    
                    <div className="flex justify-center lg:justify-start">
                      <Button 
                        variant="ghost"
                        className="bg-black text-white hover:!bg-yellow-500 hover:!text-white h-12 px-6 sm:px-8 rounded-[30px] flex items-center space-x-2 whitespace-nowrap min-w-[160px] sm:min-w-[180px] transition-colors duration-200 group"
                        aria-label="Get started with car rental booking"
                      >
                        <svg className="h-4 w-4 text-yellow-400 group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span>GET STARTED</span>
                      </Button>
                    </div>
                  </div>

                  {/* Right Column - Car Image */}
                  <div className="relative order-first lg:order-last">
                    <Image
                      src="/Carsectionui/hyundai-palisade.jpg"
                      alt="Hyundai Palisade Facelift SUV available for rent in Nigeria"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-lg shadow-lg"
                      priority={true}
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Form */}
            <BookingForm
              pickupLocation={pickupLocation}
              setPickupLocation={setPickupLocation}
              dropoffLocation={dropoffLocation}
              setDropoffLocation={setDropoffLocation}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              dropoffDate={dropoffDate}
              setDropoffDate={setDropoffDate}
              pickupTime={pickupTime}
              setPickupTime={setPickupTime}
              dropoffTime={dropoffTime}
              setDropoffTime={setDropoffTime}
              bookedDates={bookedDates}
            />
          </AuroraBackground>
        </Suspense>

        {/* Rest of the sections outside aurora background */}
        {/* Car Specifications Section */}
        <CarSpecifications />

        {/* Feature Section */}
        <FeatureSection />

        {/* Brand Section */}
        <BrandSection />

        {/* Our Services Section */}
        <OurServicesSection />

        {/* What We Provide Section */}
        <WhatWeProvideSection />

        {/* Review Section */}
        <ReviewSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer Section */}
        <FooterSection />
      </div>
    </>
  )
}

