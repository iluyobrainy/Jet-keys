"use client"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import Image from "next/image"
import { 
  Battery, 
  Users, 
  Gauge, 
  Circle, 
  MapPin, 
  Scale, 
  Car, 
  Zap 
} from "lucide-react"

interface SpecItemProps {
  category: string
  value: string
  icon: React.ReactNode
  iconColor: string
}

const SpecItem = memo(({ category, value, icon, iconColor }: SpecItemProps) => (
  <div className="bg-white border border-gray-200 p-3 rounded-[30px] flex items-center justify-between transform-gpu">
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {category}
      </p>
      <p className="text-sm font-semibold text-black">
        {value}
      </p>
    </div>
    <div className={`${iconColor} ml-3`}>
      {icon}
    </div>
  </div>
))

SpecItem.displayName = "SpecItem"

export function CarSpecifications() {
  const [activeTab, setActiveTab] = useState("performances")
  const [isVisible, setIsVisible] = useState(false)
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
      threshold: 0.1, // Reduced threshold for better performance
      rootMargin: '0px 0px -100px 0px'
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

  const specs = [
    {
      id: "battery",
      category: "BATTERY",
      value: "Long Range",
      icon: <Battery className="w-5 h-5" />,
      iconColor: "text-orange-500"
    },
    {
      id: "seating",
      category: "SEATING",
      value: "Up to 5",
      icon: <Users className="w-5 h-5" />,
      iconColor: "text-black"
    },
    {
      id: "acceleration",
      category: "ACCELERATION",
      value: "3.5 s 0-60 mph",
      icon: <Gauge className="w-5 h-5" />,
      iconColor: "text-orange-500"
    },
    {
      id: "wheels",
      category: "WHEELS",
      value: "21\"",
      icon: <Circle className="w-5 h-5" />,
      iconColor: "text-black"
    },
    {
      id: "range",
      category: "RANGE",
      value: "303 miles (EPA est.)",
      icon: <MapPin className="w-5 h-5" />,
      iconColor: "text-orange-500"
    },
    {
      id: "weight",
      category: "WEIGHT",
      value: "4,398 lbs",
      icon: <Scale className="w-5 h-5" />,
      iconColor: "text-black"
    },
    {
      id: "drive",
      category: "DRIVE",
      value: "Dual Motor All-Wheel Drive",
      icon: <Car className="w-5 h-5" />,
      iconColor: "text-orange-500"
    },
    {
      id: "top-speed",
      category: "TOP SPEED",
      value: "155 mph",
      icon: <Zap className="w-5 h-5" />,
      iconColor: "text-black"
    }
  ]

  return (
    <section ref={sectionRef} className="bg-white py-2 sm:py-4 lg:py-6" aria-label="Car Specifications and Performances">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Column - Tesla Interior Image */}
          <div className={`relative order-first transition-all duration-[1800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isVisible 
              ? 'translate-x-0 opacity-100 scale-100' 
              : 'translate-x-[-120px] opacity-0 scale-95'
          }`}>
            <Image
              src="/Homepageui/tesla-interior2.jpg"
              alt="Tesla Model Y interior with steering wheel featuring Tesla logo"
              width={500}
              height={375}
              className="w-full h-auto rounded-[30px] shadow-lg grayscale hover:grayscale-0 transition-all duration-300 max-w-md mx-auto lg:mx-0"
              priority={false}
              quality={75}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Right Column - Specifications Content */}
          <div className={`space-y-4 sm:space-y-6 text-center lg:text-left transition-all duration-[1800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] delay-[400ms] ${
            isVisible 
              ? 'translate-x-0 opacity-100 translate-y-0' 
              : 'translate-x-[120px] opacity-0 translate-y-[20px]'
          }`}>
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight mb-3">
                The Car Specifications and Performances
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Here are the specifications and performances of Tesla Model Y from Battery to every details.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center lg:justify-start" role="tablist" aria-label="Specification categories">
              <button
                onClick={() => setActiveTab("performances")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === "performances"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                }`}
                role="tab"
                aria-selected={activeTab === "performances"}
                aria-controls="performances-panel"
              >
                Performances
              </button>
              <button
                onClick={() => setActiveTab("long-range")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ml-2 ${
                  activeTab === "long-range"
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                }`}
                role="tab"
                aria-selected={activeTab === "long-range"}
                aria-controls="long-range-panel"
              >
                Long Range AWD
              </button>
            </div>

            {/* Specifications Grid */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-label="Vehicle specifications grid"
            >
              {specs.map((spec, index) => (
                <div
                  key={spec.id}
                  className={`transition-all duration-1000 ease-out ${
                    isVisible 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-[30px] opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${600 + (index * 100)}ms`
                  }}
                >
                  <SpecItem
                    category={spec.category}
                    value={spec.value}
                    icon={spec.icon}
                    iconColor={spec.iconColor}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
