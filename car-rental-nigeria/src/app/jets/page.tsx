"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { 
  Plane, 
  Clock, 
  ArrowRight, 
  Star,
  Users,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function JetsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Aurora Background wrapping entire content */}
      <AuroraBackground className="bg-transparent" showRadialGradient={true}>
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <section className="pt-10 sm:pt-16" aria-label="Hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl text-black leading-tight">
                    <span className="font-normal">PRIVATE JET</span>
                    <br />
                    <span className="font-medium">SERVICES</span>
                  </h1>
                  <div className="w-24 h-1 bg-orange-500 mt-4 mx-auto lg:mx-0"></div>
                </div>
                
                <p className="text-base sm:text-lg text-black max-w-lg mx-auto lg:mx-0">
                  Luxury air travel is coming soon. We're preparing an exclusive fleet of private jets to provide you with the ultimate luxury air travel experience.
                </p>

                {/* Under Construction Badge and Explore Cars Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                  <div className="inline-flex items-center justify-center bg-orange-500 text-white px-6 py-3 rounded-full font-semibold">
                    <Clock className="w-5 h-5 mr-2" />
                    Under Construction
                  </div>
                  
                  <Button 
                    asChild
                    variant="ghost"
                    className="h-12 w-full rounded-[30px] bg-black px-6 text-white transition-colors duration-200 group hover:!bg-yellow-500 hover:!text-white sm:w-auto sm:min-w-[220px]"
                  >
                    <Link href="/cars">
                      <span>EXPLORE OUR CARS</span>
                      <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:text-white transition-colors duration-200" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column - Jet Image */}
              <div className="relative order-first lg:order-last">
                <Image
                  src="/Aboutusui/Airbus-int.png"
                  alt="Private jet services coming soon"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>
      </AuroraBackground>

      {/* Features Preview Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 mt-8" aria-label="Jet Services Features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl shadow-lg py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                What to Expect
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-black max-w-4xl mx-auto">
                Our upcoming private jet services will offer unparalleled luxury and convenience for your air travel needs.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Premium Fleet</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Access to a curated selection of luxury private jets, from light jets to large cabin aircraft.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">24/7 Availability</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Book your private jet anytime, anywhere with our round-the-clock concierge service.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Personalized Service</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Dedicated flight coordinators to ensure every detail of your journey is perfectly arranged.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Safety First</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All aircraft maintained to the highest safety standards with experienced, certified pilots.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Flexible Routes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Fly to any destination with flexible scheduling and personalized flight plans.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-[24px] border border-black/5 bg-white p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Luxury Amenities</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Premium interiors, gourmet catering, and exclusive amenities for the ultimate travel experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="bg-black py-12 sm:py-16 lg:py-20 mt-8" aria-label="Coming Soon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Coming Soon
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto mb-12">
              We're working hard to bring you the most exclusive private jet rental experience in Nigeria. Stay tuned for our premium jet services.
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">Development Progress: 75%</p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button className="bg-black border-2 border-white text-white hover:bg-white hover:text-black rounded-[30px] px-8 py-3 transition-colors duration-200">
                Get Notified
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
