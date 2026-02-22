"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { AboutUsHero } from "@/components/about-us-hero"
import { AboutUsSection3 } from "@/components/about-us-section3"
import { AboutUsSection4 } from "@/components/about-us-section4"
import { AboutUsSection5 } from "@/components/about-us-section5"
import { AboutUsSection6 } from "@/components/about-us-section6"
import { AboutUsSection7 } from "@/components/about-us-section7"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <AboutUsHero />

      {/* Section 3 - Car Cleaning Services */}
      <AboutUsSection3 />

      {/* Section 4 - Sliding Text Animation */}
      <AboutUsSection4 />

      {/* Section 5 - Meet The Team */}
      <AboutUsSection5 />

      {/* Section 6 - Our Services */}
      <AboutUsSection6 />

      {/* Section 7 - Contact Us Cards */}
      <AboutUsSection7 />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
