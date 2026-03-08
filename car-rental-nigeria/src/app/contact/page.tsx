"use client"

import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { ContactForm } from "@/components/contact-form"
import { ContactInfo } from "@/components/contact-info"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center sm:mb-12">
            <h1 className="mb-4 text-3xl font-bold text-black sm:mb-6 sm:text-5xl lg:text-6xl">
              Contact our team
            </h1>
            <p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg">
              Got any questions about our car rental services or private jet offerings? We're here to help. 
              Chat to our friendly team 24/7 and get onboard in less than 5 minutes.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Right Column - Contact Information */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
