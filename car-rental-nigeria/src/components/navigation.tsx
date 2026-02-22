"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Home, Car as CarIcon, Plane, User, Phone, Calendar } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

export function Navigation() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Cars', url: '/cars', icon: CarIcon },
    { name: 'Jets', url: '/jets', icon: Plane },
    { name: 'My Bookings', url: '/my-bookings', icon: Calendar },
    { name: 'About', url: '/about', icon: User },
    { name: 'Contact', url: '/contact', icon: Phone }
  ]

  return (
    <>
      {/* Main Navigation - Logo and CTA Buttons Only */}
      <nav className="bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" prefetch={true} className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Jet & Keys</span>
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/cars" prefetch={true}>Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tubelight Navigation Bar - FIXED VERSION */}
      <NavBar items={navItems} />
    </>
  )
}
