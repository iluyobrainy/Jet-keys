"use client"

import Image from "next/image"

export function AboutUsSection5() {
  const teamMembers = [
    {
      name: "John Smith",
      role: "Car Specialist",
      initials: "JS"
    },
    {
      name: "Sarah Johnson", 
      role: "Service Manager",
      initials: "SJ"
    },
    {
      name: "Mike Davis",
      role: "Quality Assurance",
      initials: "MD"
    }
  ]

  return (
    <section className="w-full bg-white pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Text Section - Two Column Layout */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Heading */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight">
              <span className="block">MEET THE</span>
              <span className="block">TEAM</span>
            </h2>
          </div>

          {/* Right Column - Description */}
          <div className="flex items-center justify-center lg:justify-end">
            <p className="max-w-md text-center text-base leading-relaxed text-black sm:text-lg lg:text-right">
              Expert maintenance to detailing these services ensure your ride stays smooth
            </p>
          </div>
        </div>

        {/* Team Gallery - Three Profile Images */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 rounded-[28px] border border-black/5 bg-gray-50 p-6 shadow-sm">
              {/* Profile Image Placeholder */}
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600">
                  {member.initials}
                </span>
              </div>
              
              {/* Member Info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
