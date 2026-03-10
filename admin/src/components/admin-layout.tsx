"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Car, 
  Users, 
  Calendar, 
  BarChart3, 
  Upload,
  LogOut,
  Menu,
  X,
  CreditCard,
  Globe,
  Plane,
  AlertCircle,
  Clock,
  MapPin,
  Star
} from "lucide-react"
import { useAdminAuth } from "@/lib/admin-auth-client"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { profile, user, signOut } = useAdminAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
  }

  const accountName = profile?.name || user?.email || "Admin"
  const accountEmail = profile?.email || user?.email || ""

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/" },
    { icon: Car, label: "Cars", href: "/cars" },
    { icon: Upload, label: "Add Car", href: "/cars/add" },
    { icon: Plane, label: "Jets", href: "/jets" },
    { icon: Upload, label: "Add Jet", href: "/jets/add" },
    { icon: MapPin, label: "Locations", href: "/locations" },
    { icon: Calendar, label: "Bookings", href: "/bookings" },
    { icon: AlertCircle, label: "Cancellations", href: "/cancellations" },
    { icon: Clock, label: "Late Returns", href: "/late-returns" },
    { icon: BarChart3, label: "Finance", href: "/finance" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: CreditCard, label: "Checkout Config", href: "/checkout-config" },
    { icon: Globe, label: "Website Settings", href: "/website-settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col overflow-hidden bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Jet & Keys Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-950">{accountName}</p>
            <p className="text-xs text-slate-500">{accountEmail}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => void handleSignOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {accountName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
