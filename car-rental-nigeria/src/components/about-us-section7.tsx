"use client"

import { useRouter } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

export function AboutUsSection7() {
  const router = useRouter()

  const contactCards = [
    {
      id: 1,
      title: "Schedule",
      subtitle: "A Call",
      backgroundColor: "bg-gray-200",
      textColor: "text-black",
      iconColor: "text-black"
    },
    {
      id: 2,
      title: "Send A",
      subtitle: "Message",
      backgroundColor: "bg-gray-200",
      textColor: "text-black",
      iconColor: "text-black",
      highlighted: true
    },
    {
      id: 3,
      title: "Schedule",
      subtitle: "A Call",
      backgroundColor: "bg-gray-200",
      textColor: "text-black",
      iconColor: "text-black"
    }
  ]

  const handleCardClick = () => {
    router.push("/contact")
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black text-center mb-12">
          <span className="block">Contact For</span>
          <span className="block">Clean Your Dream Car</span>
        </h2>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactCards.map((card) => (
            <div
              key={card.id}
              onClick={handleCardClick}
              className={`group relative ${card.backgroundColor} ${card.textColor} rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-black hover:text-white h-44 sm:h-50 lg:h-58 flex flex-col justify-end`}
            >
              {/* Card Content */}
              <div className="mt-auto">
                <h3 className="text-2xl font-medium leading-tight">
                  <span className="block">{card.title}</span>
                  <span className="block">{card.subtitle}</span>
                </h3>
                
                {/* Decorative element for middle card */}
                {card.highlighted && (
                  <div className="absolute top-2 left-6">
                    <svg className="w-8 h-4 text-white opacity-60" viewBox="0 0 32 16" fill="currentColor">
                      <path d="M2 8c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6zm12 0c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Arrow Icon */}
              <ArrowUpRight className={`absolute top-4 right-4 w-5 h-5 ${card.iconColor} group-hover:text-white transition-colors duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
