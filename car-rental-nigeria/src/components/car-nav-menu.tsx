"use client"

import { useState } from "react"
import { Zap, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PriceRangeSlider } from "@/components/price-range-slider"

interface FilterOption {
  id: string
  text: string
  selected: boolean
  icon?: string
  iconColor?: string
}

interface FilterSection {
  id: string
  title: string
  options: FilterOption[]
  layout: "grid" | "flex"
  columns?: number
  showAllLink?: boolean
}

export function CarNavMenu() {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [priceRange, setPriceRange] = useState([0, 200])

  const filterSections: FilterSection[] = [
    {
      id: "preferences",
      title: "Preferences",
      layout: "grid",
      columns: 2,
      options: [
        { id: "instant-rent", text: "Instant Rent", selected: false, icon: "zap", iconColor: "text-yellow-500" },
        { id: "delivery", text: "Delivery", selected: true },
        { id: "pickup-host", text: "Pickup by Host", selected: true },
        { id: "one-way-trip", text: "One Way Trip", selected: false },
        { id: "unlimited-mileage", text: "Unlimited Mileage", selected: false }
      ]
    },
    {
      id: "category",
      title: "Category",
      layout: "grid",
      columns: 4,
      showAllLink: true,
      options: [
        { id: "sedan", text: "Sedan", selected: false },
        { id: "suv", text: "SUV", selected: false },
        { id: "cabriolet", text: "Cabriolet", selected: false },
        { id: "hatchback", text: "Hatchback", selected: false },
        { id: "wagon", text: "Wagon", selected: false },
        { id: "vans", text: "Vans", selected: false },
        { id: "off-road", text: "Off-road", selected: false },
        { id: "pickup", text: "Pickup", selected: false }
      ]
    },
    {
      id: "fuel-type",
      title: "Fuel Type",
      layout: "flex",
      options: [
        { id: "gas", text: "Gas", selected: false },
        { id: "electric", text: "Electric", selected: false }
      ]
    }
  ]

  const handleFilterToggle = (sectionId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[sectionId] || []
      const isSelected = currentFilters.includes(optionId)
      
      if (isSelected) {
        return {
          ...prev,
          [sectionId]: currentFilters.filter(id => id !== optionId)
        }
      } else {
        return {
          ...prev,
          [sectionId]: [...currentFilters, optionId]
        }
      }
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
    setPriceRange([0, 200])
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max])
    console.log('Price range changed:', min, max)
  }

  const getButtonStyling = (option: FilterOption) => {
    const isSelected = selectedFilters[option.id]?.includes(option.id) || option.selected
    
    if (isSelected) {
      return "bg-black text-white border border-black hover:bg-gray-800"
    }
    
    return "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200"
  }

  const getGridClass = (section: FilterSection) => {
    if (section.layout === "grid") {
      if (section.columns === 4) {
        return "grid grid-cols-4 gap-3"
      } else if (section.columns === 2) {
        return "grid grid-cols-2 gap-2"
      }
      return "grid grid-cols-1 gap-2"
    }
    return "flex gap-2"
  }

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white rounded-lg shadow-lg h-full overflow-y-auto p-6 sticky top-4 z-10 max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filter</h2>
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium"
        >
          Clear All Filters
        </Button>
      </div>

      {/* Filter Sections */}
      {filterSections.map((section) => (
        <div key={section.id} className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">{section.title}</h3>
          
          <div className={getGridClass(section)}>
            {section.options.map((option) => (
              <Button
                key={option.id}
                onClick={() => handleFilterToggle(section.id, option.id)}
                variant="outline"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${getButtonStyling(option)} ${
                  section.id === "category" || section.id === "preferences" ? "w-full" : ""
                }`}
              >
                <div className="flex items-center gap-1 justify-center">
                  {option.icon === "zap" && <Zap className="h-3 w-3 text-yellow-500" />}
                  <span className="truncate">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
          
          {section.showAllLink && (
            <div className="mt-3 flex justify-center">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Show All
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Price Range Section */}
      <div className="mb-6">
        <PriceRangeSlider
          minPrice={0}
          maxPrice={200}
          onRangeChange={handlePriceRangeChange}
          currency="USD"
        />
      </div>
    </div>
  )
}
