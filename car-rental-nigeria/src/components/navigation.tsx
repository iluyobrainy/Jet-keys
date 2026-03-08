"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Home, Car as CarIcon, Plane, User, Phone, Calendar, Menu } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Cars', url: '/cars', icon: CarIcon },
    { name: 'Jets', url: '/jets', icon: Plane },
    { name: 'My Bookings', url: '/my-bookings', icon: Calendar },
    { name: 'About', url: '/about', icon: User },
    { name: 'Contact', url: '/contact', icon: Phone }
  ]

  const isActiveRoute = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }

    return pathname.startsWith(url)
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-40 border-b border-black/10 bg-white/95 shadow-[0_6px_20px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" prefetch={true} className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Jet & Keys</span>
            </Link>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild>
                <Link href="/cars" prefetch={true}>Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm">
                <SheetHeader>
                  <SheetTitle>Jet & Keys</SheetTitle>
                </SheetHeader>

                <div className="px-4 pb-4">
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon

                      return (
                        <SheetClose asChild key={item.name}>
                          <Link
                            href={item.url}
                            prefetch={true}
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                              isActiveRoute(item.url)
                                ? "bg-black text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </div>
                </div>

                <SheetFooter>
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/cars" prefetch={true}>Book Now</Link>
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Desktop Tubelight Navigation */}
      <NavBar items={navItems} className="hidden md:block" />
    </>
  )
}
