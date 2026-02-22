"use client"

import Image from "next/image"

export function AboutUsSection3() {
  const carImages = [
    {
      src: "/Carsectionui/hyundai-palisade.jpg",
      model: "Hyundai Palisade",
      badge: "Cleaner"
    },
    {
      src: "/Carsectionui/chery-tiggo.jpg", 
      model: "Chery Tiggo Pro",
      badge: "Cleaner"
    },
    {
      src: "/Carsectionui/hyundai-palisade.jpg",
      model: "Hyundai Palisade",
      badge: "Cleaner"
    }
  ]

  return (
    <section className="pt-2 pb-16 sm:pt-3 sm:pb-20 lg:pt-4 lg:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section - Car Images and Service Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Left Side - Three Car Images */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {carImages.map((car, index) => (
              <div key={index} className="relative rounded-[30px] overflow-hidden">
                <Image
                  src={car.src}
                  alt={`${car.model} being cleaned`}
                  width={1000}
                  height={200}
                  className={`w-full h-48 object-cover ${index === 1 ? 'scale-170' : 'scale-150'}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 1000px"
                />
                
                {/* Badge */}
                <div className="absolute top-3 left-3 border border-white rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-white">{car.badge}</span>
                </div>
                
                {/* Car Model */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-lg font-bold text-white drop-shadow-lg">
                    {car.model}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Service Description and Reviews */}
          <div className="space-y-8">
            {/* Service Description */}
            <div>
              <p className="text-base text-black leading-relaxed mb-8">
                Our professional and reliable car cleaners provide thorough Car Detailing, Interior Deep Cleaning, and Car Polishing. Choose the best service with Jet & Keys for premium car care solutions.
              </p>
            </div>

            {/* Customer Reviews */}
            <div className="space-y-4">
              {/* Avatars and Happy Guests */}
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">B</span>
                  </div>
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">C</span>
                  </div>
                </div>
                <div className="text-black">
                  <div className="text-sm font-medium">150k happy guests</div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Reviews Count */}
              <div className="text-sm text-black">
                18,922 reviews
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Investment Heading */}
        <div className="text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black leading-tight">
            <span className="block">We Protect Your</span>
            <span className="block">Investment</span>
          </h2>
        </div>
      </div>
    </section>
  )
}
