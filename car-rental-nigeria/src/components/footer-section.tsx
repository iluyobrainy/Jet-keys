"use client"

import { useState } from "react"
import { User, Mail, ArrowRight, Settings, Twitter, Youtube, Facebook, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBusinessInfo } from "@/lib/hooks/useBusinessInfo"

export function FooterSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  })

  // Fetch business information
  const { data: businessInfo, isLoading: businessInfoLoading } = useBusinessInfo()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const navigationLinks = [
    { text: "Home", href: "/" },
    { text: "Cars", href: "/cars" },
    { text: "Jets", href: "/jets" },
    { text: "About Us", href: "/about" },
    { text: "FAQ", href: "/faq" }
  ]

  const supportLinks = [
    { text: "Contact Us", href: "/contact" },
    { text: "Support Center", href: "/support" },
    { text: "Terms & Conditions", href: "/terms" },
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Refund Policy", href: "/refund" }
  ]

  const partnerLinks = [
    { text: "Our Partners", href: "/partners" },
    { text: "Community", href: "/community" },
    { text: "Customers", href: "/customers" },
    { text: "Investors", href: "/investors" }
  ]

  const socialMediaIcons = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Facebook, href: "#", label: "Facebook" }
  ]

  return (
    <footer className="bg-black py-8 sm:py-12 lg:py-16" aria-label="Website Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Membership Section */}
        <div className="mb-10 text-left sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8">
            Become Our Member
          </h2>
          
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="flex-1 relative">
              <User className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-white focus:outline-none"
                aria-label="Enter your name"
              />
            </div>
            
            <div className="flex-1 relative">
              <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-600 text-white placeholder-gray-400 focus:border-white focus:outline-none"
                aria-label="Enter your email"
              />
            </div>
           
            <Button
              type="submit"
              className="h-12 w-12 self-start rounded-full bg-gray-800 p-0 text-white hover:bg-gray-700 sm:self-end"
              aria-label="Submit membership form"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {/* Main Content */}
        <div className="mb-12 grid grid-cols-2 gap-6 text-left lg:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center justify-start">
              <Settings className="w-8 h-8 text-orange-500 mr-2" />
              <span className="text-2xl font-bold text-white">Jet&Keys</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              We provide premium transportation solutions including luxury cars, SUVs, electric vehicles, and private jets that suit your personal and business travel needs.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.text}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Support Us</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.text}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Partner</h3>
            <ul className="space-y-2">
              {partnerLinks.map((link) => (
                <li key={link.text}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Info</h3>
            <div className="space-y-3">
              {businessInfoLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-400">{businessInfo?.contactPhone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-400">{businessInfo?.contactEmail}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-400">{businessInfo?.businessAddress}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-start gap-4 border-t border-gray-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            © 2025 Jet&Keys, All Rights Reserved.
          </p>
          
          <div className="flex gap-4" aria-label="Social media links">
            {socialMediaIcons.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
