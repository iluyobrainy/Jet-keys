"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface PriceRangeSliderProps {
  minPrice?: number
  maxPrice?: number
  onRangeChange?: (min: number, max: number) => void
  currency?: string
}

export function PriceRangeSlider({
  minPrice = 0,
  maxPrice = 500,
  onRangeChange,
  currency = "USD"
}: PriceRangeSliderProps) {
  const [range, setRange] = useState([minPrice, maxPrice])
  const [minInput, setMinInput] = useState(minPrice.toString())
  const [maxInput, setMaxInput] = useState(maxPrice.toString())
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleRangeChange = (newRange: number[]) => {
    setRange(newRange)
    setMinInput(newRange[0].toString())
    setMaxInput(newRange[1].toString())
    onRangeChange?.(newRange[0], newRange[1])
  }

  const handleMinInputChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setMinInput(value)
    if (numValue <= range[1]) {
      handleRangeChange([numValue, range[1]])
    }
  }

  const handleMaxInputChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setMaxInput(value)
    if (numValue >= range[0]) {
      handleRangeChange([range[0], numValue])
    }
  }

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const percentage = Math.max(0, Math.min(1, x / width))
    const value = Math.round(percentage * (maxPrice - minPrice) + minPrice)

    // Determine which handle to move based on which is closer
    const distanceToMin = Math.abs(value - range[0])
    const distanceToMax = Math.abs(value - range[1])

    if (distanceToMin < distanceToMax) {
      handleRangeChange([value, range[1]])
    } else {
      handleRangeChange([range[0], value])
    }
  }

  const getSliderPosition = (value: number) => {
    return ((value - minPrice) / (maxPrice - minPrice)) * 100
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Price Range per Day</h3>
      
      {/* Input Fields */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="number"
            value={minInput}
            onChange={(e) => handleMinInputChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            placeholder={`${currency} 0`}
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            value={maxInput}
            onChange={(e) => handleMaxInputChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            placeholder={`${currency} ${maxPrice}`}
          />
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleSliderClick}
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-blue-600 rounded-full"
            style={{
              left: `${getSliderPosition(range[0])}%`,
              width: `${getSliderPosition(range[1]) - getSliderPosition(range[0])}%`
            }}
          />
          
          {/* Min Handle */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full -top-1 cursor-pointer transform -translate-x-1/2 shadow-md hover:shadow-lg transition-shadow"
            style={{ left: `${getSliderPosition(range[0])}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              // Handle drag functionality would go here
            }}
          />
          
          {/* Max Handle */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full -top-1 cursor-pointer transform -translate-x-1/2 shadow-md hover:shadow-lg transition-shadow"
            style={{ left: `${getSliderPosition(range[1])}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              // Handle drag functionality would go here
            }}
          />
        </div>
      </div>
    </div>
  )
}
