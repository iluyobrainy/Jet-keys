"use client"

import Image from "next/image"

export function BrandSection() {
  const brands = [
    {
      name: "BMW",
      src: "/Homepageui/bmw-logo.png",
      alt: "BMW Logo",
      width: 60,
      height: 60
    },
    {
      name: "Ford",
      src: "/Homepageui/ford-logo.png",
      alt: "Ford Logo",
      width: 70,
      height: 35
    },
    {
      name: "Lexus",
      src: "/Homepageui/lexus-logo.png",
      alt: "Lexus Logo",
      width: 70,
      height: 35
    },
    {
      name: "Lamborghini",
      src: "/Homepageui/lamborghini-logo.png",
      alt: "Lamborghini Logo",
      width: 50,
      height: 50
    },
    {
      name: "Jaguar",
      src: "/Homepageui/jaguar-logo.png",
      alt: "Jaguar Logo",
      width: 80,
      height: 35
    },
    {
      name: "Mercedes-Benz",
      src: "/Homepageui/mercedes-benz-logo.png",
      alt: "Mercedes-Benz Logo",
      width: 60,
      height: 60
    }
  ]

  // Duplicate brands array for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands, ...brands]

  return (
    <section className="bg-white py-8 sm:py-12" aria-label="Car Brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black leading-tight">
            Brands with body type
          </h2>
        </div>

        {/* Infinite Scrolling Brand Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left">
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex-shrink-0 mx-8 sm:mx-12 lg:mx-16 flex items-center justify-center"
              >
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={brand.width}
                  height={brand.height}
                  className="grayscale hover:grayscale-0 transition-all duration-300 object-contain"
                  sizes="(max-width: 768px) 60px, (max-width: 1200px) 80px, 100px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
