"use client"

import { Sparkles, Tag, Clock } from "lucide-react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <div className="text-center p-4">
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <div className="text-black">
          {icon}
        </div>
      </div>
    </div>
         <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2">
      {title}
    </h3>
    <p className="text-sm sm:text-base text-gray-300">
      {description}
    </p>
  </div>
)

export function OurServicesSection() {
  const services = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Premium Fleet",
      description: "We offer a wide range of high-quality vehicles and private jets to choose from, including luxury cars, SUVs, vans, and executive aircraft."
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: "Competitive Pricing",
      description: "Our rental rates are highly competitive and affordable for both ground transportation and air travel, ensuring value for money."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Convenient Online Booking",
      description: "With our easy-to-use online booking system, customers can quickly and conveniently reserve their rental car or private jet from anywhere, anytime."
    }
  ]

  return (
    <section className="bg-black py-12 sm:py-16 lg:py-20 mt-12 mb-12" aria-label="Our Services and Benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Our Services & Benefits
          </h2>
                     <p className="text-sm sm:text-base lg:text-lg text-white max-w-3xl mx-auto">
            To make renting easy and hassle-free, we provide a variety of services and advantages. We have you covered with a variety of vehicles, private jets, and flexible rental terms.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
