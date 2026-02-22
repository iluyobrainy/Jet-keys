"use client"

import Image from "next/image"
import { MapPin, ShieldCheck, Clock, Users } from "lucide-react"
import { useState, useEffect, useRef, memo, useCallback } from "react"

interface FeatureBlockProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureBlock = memo(({ icon, title, description }: FeatureBlockProps) => (
  <div className="text-center p-3 max-w-[200px]">
    <div className="flex justify-center mb-3">
      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
        <div className="text-white">
          {icon}
        </div>
      </div>
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-xs text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
))

FeatureBlock.displayName = "FeatureBlock"

export function WhatWeProvideSection() {
  const [isVisible, setIsVisible] = useState(true)
  
  // Add CSS animation directly
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes simpleSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .simple-spin {
        animation: simpleSpin 20s linear infinite !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, []) // Start visible to test animation
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Optimized scroll detection for animation trigger
  const handleIntersection = useCallback(([entry]: IntersectionObserverEntry[]) => {
    if (entry.isIntersecting && !hasAnimated) {
      setIsVisible(true)
      setHasAnimated(true)
    }
  }, [hasAnimated])

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px' // Trigger when section is 100px from bottom of viewport
    })

    const currentSection = sectionRef.current
    if (currentSection) {
      observer.observe(currentSection)
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection)
      }
    }
  }, [handleIntersection])

  const features = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "CROSS COUNTRY & AIR TRAVEL",
      description: "Experience seamless ground transportation and private jet services for domestic and international travel across Nigeria and beyond."
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "NO HIDDEN CHARGES",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "RESERVE ANYTIME",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "24/7 SUPPORT",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ]

  return (
    <section ref={sectionRef} className="bg-gray-50" aria-label="What We Provide - Car Rental Services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Providing Reliable Car Rentals
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-black max-w-4xl mx-auto">
              INTRODUCING TESLA MODEL Y, AN AUTOPILOT CAR THAT ADVANCED SAFETY AND CONVENIENCE FEATURES
            </p>
          </div>

          {/* Central Content */}
          <div className="relative">
            {/* Desktop Layout - Central Car with Surrounding Blocks */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-3 gap-8 items-center justify-center max-w-6xl mx-auto">
                {/* Left Column */}
                <div className="space-y-8 flex flex-col items-center">
                  {/* Top Left */}
                  <FeatureBlock
                    icon={<MapPin className="w-5 h-5" />}
                    title="CROSS COUNTRY DRIVE"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  />
                  
                  {/* Bottom Left */}
                  <FeatureBlock
                    icon={<ShieldCheck className="w-5 h-5" />}
                    title="NO HIDDEN CHARGES"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  />
                </div>

                {/* Center Column - Car */}
                <div className="relative flex justify-center">
                  <div className="relative">
                    {/* Four Corner Dots */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    
                    {/* G-Wagon Image */}
                    <div className={`relative z-10 transition-all duration-1500 ease-out ${
                      isVisible 
                        ? 'translate-x-0 opacity-100 scale-100' 
                        : 'translate-x-[-150px] opacity-0 scale-95'
                    }`}>
                      <Image
                        src="/Homepageui/gwagon.png"
                        alt="G-Wagon SUV vehicle for reliable car rentals"
                        width={300}
                        height={225}
                        className="w-full h-auto object-contain max-w-sm mx-auto"
                        priority={false}
                        quality={75}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Spinning Wheel Circle - Simple Approach */}
                    <div 
                      className="absolute inset-0 w-80 h-80 border-2 border-dashed border-orange-500 rounded-full m-auto pointer-events-none simple-spin"
                      style={{
                        zIndex: 20,
                        borderColor: '#f97316',
                        borderWidth: '3px',
                        borderStyle: 'dashed'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8 flex flex-col items-center">
                  {/* Top Right */}
                  <FeatureBlock
                    icon={<Clock className="w-5 h-5" />}
                    title="RESERVE ANYTIME"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  />
                  
                  {/* Bottom Right */}
                  <FeatureBlock
                    icon={<Users className="w-5 h-5" />}
                    title="24/7 SUPPORT"
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  />
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout - Stacked Grid */}
            <div className="lg:hidden">
              {/* Central Image with Dashed Circle Effect */}
              <div className="relative flex justify-center mb-12">
                <div className="relative">
                  {/* Dashed Circle Effect */}
                  <div className={`absolute inset-0 w-80 h-80 border-2 border-dashed border-red-500 rounded-full m-auto transition-all duration-3000 ease-out ${
                    isVisible ? 'animate-spin' : 'opacity-0'
                  }`}></div>
                  
                  {/* Red Dots */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                  
                  {/* G-Wagon Image */}
                  <div className={`relative z-10 transition-all duration-1500 ease-out ${
                    isVisible 
                      ? 'translate-x-0 opacity-100 scale-100' 
                      : 'translate-x-[-150px] opacity-0 scale-95'
                  }`}>
                    <Image
                      src="/Homepageui/gwagon.png"
                      alt="G-Wagon SUV vehicle for reliable car rentals"
                      width={300}
                      height={225}
                      className="w-full h-auto object-contain max-w-sm mx-auto"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Blocks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <FeatureBlock
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
