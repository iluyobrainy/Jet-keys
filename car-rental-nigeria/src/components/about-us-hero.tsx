"use client"

import Image from "next/image"

export function AboutUsHero() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Background Image - Tesla Car with rounded borders */}
          <div className="relative w-full h-[600px] rounded-[30px] overflow-hidden">
            <Image
              src="/Aboutusui/C-Heroimg.png"
              alt="Tesla car on road with blue sky"
              fill
              className="object-cover scale-150"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>


          {/* White Card - Smaller size to show more background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[82%] h-[82%] bg-white rounded-[30px] shadow-2xl">
               {/* Content */}
               <div className="relative z-10 flex justify-between h-full p-8">
                 {/* Left Side - Text Content */}
                 <div className="flex flex-col justify-center text-left w-1/2">
                   {/* Small Descriptive Text */}
                   <p className="text-sm text-gray-600 mb-16 max-w-md mt-8">
                     Can explore now a variety of snapshots showcasing our comprehensive range of services
                   </p>

                   {/* Large Heading */}
                   <div className="space-y-2 mt-16">
                     <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight">
                       <span className="text-5xl sm:text-6xl lg:text-7xl font-bold">About</span>
                       <br />
                       <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-orange-500">Us</span>
                     </h1>
                   </div>
                 </div>

                 {/* Right Side - Image */}
                 <div className="w-1/2 flex justify-center">
                   <div className="relative w-[400px] h-[400px] rounded-[30px] overflow-hidden self-start mt-8">
                     <Image
                       src="/Aboutusui/Airbus-int.png"
                       alt="Luxury interior"
                       fill
                       className="object-cover"
                       sizes="(max-width: 768px) 50vw, 25vw"
                     />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
