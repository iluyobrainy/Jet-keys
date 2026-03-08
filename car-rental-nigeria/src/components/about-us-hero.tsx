"use client"

import Image from "next/image"

export function AboutUsHero() {
  return (
    <section className="relative py-10 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Background Image - Tesla Car with rounded borders */}
          <div className="relative w-full h-[360px] sm:h-[520px] lg:h-[600px] rounded-[30px] overflow-hidden">
            <Image
              src="/Aboutusui/C-Heroimg.png"
              alt="Tesla car on road with blue sky"
              fill
              className="object-cover scale-125 sm:scale-150"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>


          {/* White Card */}
          <div className="relative -mt-14 px-2 sm:-mt-16 sm:px-4 lg:absolute lg:inset-0 lg:mt-0 lg:px-0 flex items-center justify-center">
            <div className="relative w-full lg:w-[82%] lg:h-[82%] bg-white rounded-[24px] sm:rounded-[30px] shadow-2xl">
               {/* Content */}
               <div className="relative z-10 flex h-full flex-col justify-between gap-8 p-5 sm:p-8 lg:flex-row">
                 {/* Left Side - Text Content */}
                 <div className="flex flex-col justify-center text-left lg:w-1/2">
                   {/* Small Descriptive Text */}
                   <p className="max-w-md text-sm text-gray-600">
                     Can explore now a variety of snapshots showcasing our comprehensive range of services
                   </p>

                   {/* Large Heading */}
                   <div className="mt-6 space-y-2 sm:mt-10">
                     <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight">
                       <span className="text-4xl sm:text-6xl lg:text-7xl font-bold">About</span>
                       <br />
                       <span className="text-4xl sm:text-6xl lg:text-7xl font-bold text-orange-500">Us</span>
                     </h1>
                   </div>
                 </div>

                 {/* Right Side - Image */}
                 <div className="lg:w-1/2 flex justify-center">
                   <div className="relative h-56 w-full max-w-[420px] overflow-hidden rounded-[24px] sm:h-72 sm:rounded-[30px] lg:h-[400px] lg:self-start">
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
