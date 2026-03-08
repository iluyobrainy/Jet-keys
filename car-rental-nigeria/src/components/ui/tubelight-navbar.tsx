"use client"

import React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()

  // Find the active tab based on current pathname
  const getActiveTab = () => {
    // Check for exact matches first
    const exactMatch = items.find(item => item.url === pathname)
    if (exactMatch) return exactMatch.name
    
    // Check for partial matches (e.g., /car-info/[id] should match /cars)
    if (pathname.startsWith('/car-info/')) {
      return 'Cars'
    }
    if (pathname.startsWith('/jet-info/')) {
      return 'Jets'
    }
    if (pathname.startsWith('/checkout')) {
      return 'Cars' // Checkout is related to cars
    }
    
    // Default to first item
    return items[0].name
  }

  const activeTab = getActiveTab()

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none",
        className,
      )}
    >
      <div className="flex max-w-[calc(100vw-2rem)] items-center gap-1 md:gap-2 overflow-x-auto rounded-full border border-border bg-background/70 px-1 py-1 shadow-lg backdrop-blur-sm pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              prefetch={true}
              className={cn(
                "relative cursor-pointer rounded-full px-3 lg:px-6 py-2 text-sm font-semibold transition-colors duration-150 whitespace-nowrap",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden lg:inline">{item.name}</span>
              <span className="lg:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <div className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10 pointer-events-none transition-all duration-200 ease-out">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full pointer-events-none">
                    <div className="absolute w-8 h-4 bg-primary/20 rounded-full blur-sm -top-1 pointer-events-none" />
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
