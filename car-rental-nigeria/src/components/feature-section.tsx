"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

interface FeatureCardProps {
  image: string
  alt: string
  title: string
  description: string
}

const FeatureCard = ({ image, alt, title, description }: FeatureCardProps) => (
  <div className="bg-transparent rounded-lg overflow-hidden shadow-lg">
    <div className="relative">
      <Image
        src={image}
        alt={alt}
        width={400}
        height={250}
        className="w-full h-auto object-cover aspect-video grayscale hover:grayscale-0 transition-all duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {description}
      </p>
      <Link 
        href="#" 
        className="text-white font-medium hover:text-yellow-400 hover:underline transition-colors duration-200"
      >
        Read More
      </Link>
    </div>
  </div>
)

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll detection for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true)
          setHasAnimated(true)
        }
      },
      { 
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const currentSection = sectionRef.current
    if (currentSection) {
      observer.observe(currentSection)
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection)
      }
    }
  }, [hasAnimated])

  const features = [
    {
      image: "/Homepageui/teslaback.jpg",
      alt: "Rear view of Tesla Model Y, showcasing its sporty body",
      title: "Sport & Strong Card Body",
      description: "The Model Y is based on the Model 3 sedan platform. It shares an estimated..."
    },
    {
      image: "/Homepageui/tesladash.png",
      alt: "Interior of Tesla Model Y, focusing on steering wheel and display",
      title: "High-Tech Support System",
      description: "Tesla Model Y supports high-end technology components from the inside part.."
    },
    {
      image: "/Homepageui/fronttesla.png",
      alt: "Front view of Tesla Model Y in motion, elegant black color",
      title: "Solid & Elegant Black Color",
      description: "Colored with solid material color, Tesla Model Y will gives you elegancy and make.."
    }
  ]

  return (
    <section ref={sectionRef} className="bg-black py-12 sm:py-16 lg:py-20 mt-8" aria-label="Tesla Model Y Features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center mb-12">
          <div className={`text-center lg:text-left transition-all duration-[1800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isVisible 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-[-120px] opacity-0'
          }`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Every Features You Might Fall In Love
            </h2>
          </div>
          <div className={`text-center lg:text-right transition-all duration-[1800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] delay-[400ms] ${
            isVisible 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-[120px] opacity-0'
          }`}>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xs sm:max-w-md lg:max-w-lg mx-auto lg:ml-auto">
              Here are several features of Tesla Model Y that inform you specifically before you decide anything for this car.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              image={feature.image}
              alt={feature.alt}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            className="bg-black border-2 border-white text-white hover:bg-white hover:text-black rounded-[30px] px-8 py-3 transition-colors duration-200"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
