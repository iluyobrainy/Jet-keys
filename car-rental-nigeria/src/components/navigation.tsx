"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Car, Home, Car as CarIcon, Plane, User, Phone, Calendar, LogOut, Menu } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { usePathname, useRouter } from "next/navigation"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/providers/AuthProvider"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, loading, profile, user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

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

  const accountLabel = profile?.name || user?.email?.split("@")[0] || "Account"

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut()
      router.replace("/login")
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="sticky top-0 z-40 border-b border-black/10 bg-white/95 shadow-[0_6px_20px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" prefetch={true} className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Jet & Keys</span>
            </Link>

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
                  <div className="flex flex-col gap-3">
                    {loading ? null : isAuthenticated ? (
                      <>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in</p>
                          <p className="mt-1 text-sm font-semibold text-slate-950">{accountLabel}</p>
                          <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <SheetClose asChild>
                          <Button asChild variant="outline" className="w-full rounded-2xl">
                            <Link href="/my-bookings" prefetch={true}>Open my bookings</Link>
                          </Button>
                        </SheetClose>
                        <Button
                          variant="destructive"
                          className="w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                          onClick={() => void handleSignOut()}
                          disabled={signingOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {signingOut ? "Signing out..." : "Sign out"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Button asChild variant="outline" className="w-full rounded-2xl">
                            <Link href="/login" prefetch={true}>Login</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button asChild className="w-full rounded-2xl">
                            <Link href="/login?mode=signup" prefetch={true}>Sign Up</Link>
                          </Button>
                        </SheetClose>
                      </>
                    )}
                    <SheetClose asChild>
                      <Button asChild className="w-full rounded-2xl">
                        <Link href="/cars" prefetch={true}>Book Now</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Desktop Logo (no card wrapper) */}
      <div className="pointer-events-none fixed left-6 top-5 z-40 hidden md:block">
        <Link href="/" prefetch={true} className="pointer-events-auto flex items-center space-x-2">
          <Car className="h-8 w-8 text-blue-600" />
          <span className="text-lg font-bold text-slate-900">Jet & Keys</span>
        </Link>
      </div>

      <div className="fixed right-6 top-4 z-40 hidden items-center gap-3 md:flex">
        {loading ? null : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full border-white/45 bg-white/75 px-4 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md hover:bg-white"
              >
                <User className="mr-2 h-4 w-4" />
                {accountLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-slate-200 bg-white/95 p-2">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-950">{accountLabel}</p>
                <p className="text-xs font-normal text-slate-500">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                <Link href="/my-bookings">My bookings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-xl px-3 py-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/45 bg-white/70 px-5 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md hover:bg-white"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] hover:bg-slate-800">
              <Link href="/login?mode=signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>

      {/* Desktop Tubelight Navigation */}
      <NavBar items={navItems} className="hidden md:block" />
    </>
  )
}
