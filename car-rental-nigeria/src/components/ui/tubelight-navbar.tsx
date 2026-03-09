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

interface ColorChannels {
  r: number
  g: number
  b: number
  a: number
}

const parseColorChannels = (color: string): ColorChannels | null => {
  const match = color.match(/rgba?\(([^)]+)\)/i)
  if (!match) return null

  const parts = match[1].split(",").map((value) => Number.parseFloat(value.trim()))
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) {
    return null
  }

  const [r, g, b, a = 1] = parts
  return { r, g, b, a: Number.isNaN(a) ? 1 : a }
}

const isDarkColor = (color: string) => {
  const channels = parseColorChannels(color)
  if (!channels || channels.a <= 0.05) return null

  const brightness = (channels.r * 299 + channels.g * 587 + channels.b * 114) / 1000
  return brightness < 150
}

const getElementTone = (element: HTMLElement | null): boolean | null => {
  let current = element

  while (current && current !== document.body) {
    const tone = isDarkColor(window.getComputedStyle(current).backgroundColor)
    if (tone !== null) return tone
    current = current.parentElement
  }

  return isDarkColor(window.getComputedStyle(document.body).backgroundColor)
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const navbarRef = React.useRef<HTMLDivElement | null>(null)
  const [useLightText, setUseLightText] = React.useState(false)

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

  React.useEffect(() => {
    let frameId: number | null = null

    const updateTextTone = () => {
      const navbar = navbarRef.current
      if (!navbar) return

      const rect = navbar.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      // Sample slightly below the navbar so we detect the section background, not the navbar itself.
      const sampleY = Math.min(window.innerHeight - 1, Math.max(0, rect.bottom + 8))
      const sampleXs = [rect.left + rect.width * 0.2, rect.left + rect.width * 0.5, rect.left + rect.width * 0.8]

      let darkVotes = 0
      let sampleCount = 0

      sampleXs.forEach((rawX) => {
        const sampleX = Math.min(window.innerWidth - 1, Math.max(0, rawX))
        const element = document.elementFromPoint(sampleX, sampleY) as HTMLElement | null
        const tone = getElementTone(element)

        if (tone === null) return
        sampleCount += 1
        if (tone) darkVotes += 1
      })

      if (!sampleCount) return

      const shouldUseLightText = darkVotes >= Math.ceil(sampleCount / 2)
      setUseLightText((previous) => (previous === shouldUseLightText ? previous : shouldUseLightText))
    }

    const scheduleUpdate = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
      frameId = window.requestAnimationFrame(updateTextTone)
    }

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none",
        className,
      )}
    >
      <div
        ref={navbarRef}
        className={cn(
          "flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full border px-1 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-md pointer-events-auto transition-colors duration-300",
          useLightText ? "border-white/30 bg-black/25" : "border-white/40 bg-white/45",
        )}
      >
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
                useLightText ? "text-white/90 hover:text-white" : "text-slate-800 hover:text-slate-950",
                isActive && (useLightText ? "bg-white text-slate-900" : "bg-slate-900 text-white"),
              )}
            >
              <span className="hidden lg:inline">{item.name}</span>
              <span className="lg:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <div className="absolute inset-0 w-full rounded-full -z-10 pointer-events-none transition-all duration-200 ease-out">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-8 rounded-t-full bg-amber-400 pointer-events-none">
                    <div className="absolute -top-1 h-4 w-8 rounded-full bg-amber-300/30 blur-sm pointer-events-none" />
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
