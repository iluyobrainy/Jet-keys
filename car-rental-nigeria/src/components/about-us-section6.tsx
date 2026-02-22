"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function AboutUsSection6() {
  const [activeIndex, setActiveIndex] = useState(0)

  const services = [
    {
      id: 0,
      title: "Car Rental",
      description: "Our professional and reliable car rental services provide premium vehicles for all your transportation needs. Choose from our extensive fleet of luxury and economy cars.",
      image: "/Aboutusui/car-rental-service.jpg",
      alt: "Car rental service"
    },
    {
      id: 1,
      title: "Jet Rental",
      description: "Experience luxury air travel with our private jet rental services. Professional pilots, premium aircraft, and unmatched comfort for your business and leisure trips.",
      image: "/Aboutusui/jet-rental-service.jpg",
      alt: "Jet rental service"
    },
    {
      id: 2,
      title: "Security Services",
      description: "Comprehensive security solutions for your vehicles and properties. Professional security personnel, advanced monitoring systems, and 24/7 protection services.",
      image: "/Aboutusui/security-service.jpg",
      alt: "Security service"
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % services.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [services.length])

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index)
  }

  const currentService = services[activeIndex]

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black text-center mb-12">
          Our Services
        </h2>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Dynamic Content */}
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
              {currentService.title}
            </h3>
            <p className="text-base sm:text-lg text-black leading-relaxed mb-6">
              {currentService.description}
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors w-fit">
              Learn More
            </button>
          </div>

          {/* Right Side - Service Carousel */}
          <div className="relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {services.map((service) => (
                  <div key={service.id} className="w-full flex-shrink-0">
                    <Image
                      src={service.image}
                      alt={service.alt}
                      width={600}
                      height={320}
                      className="w-full h-64 sm:h-80 object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={`w-8 h-2 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
