"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  is_active: boolean
}

interface LocationSelectorProps {
  value?: string | null
  onChange: (locationId: string | null) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function LocationSelector({ 
  value, 
  onChange, 
  label = "Pickup Location",
  placeholder = "Select pickup location",
  required = false 
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/admin/locations')
        if (!response.ok) throw new Error('Failed to fetch locations')
        const data = await response.json()
        setLocations(data.filter((loc: Location) => loc.is_active))
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const handleValueChange = (locationId: string) => {
    if (locationId === "any") {
      onChange(null)
    } else {
      onChange(locationId)
    }
  }

  const getDisplayValue = () => {
    if (!value) return "any"
    return value
  }

  const getDisplayLabel = () => {
    if (!value) return "Any Location"
    const location = locations.find(loc => loc.id === value)
    return location ? `${location.name}, ${location.city}` : "Unknown Location"
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="pickup_location">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {loading ? (
        <div className="flex items-center space-x-2 p-3 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Loading locations...</span>
        </div>
      ) : (
        <select
          id="pickup_location"
          value={getDisplayValue()}
          onChange={(e) => handleValueChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="any">Any Location - Available at all pickup locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}, {location.city}, {location.state}
            </option>
          ))}
        </select>
      )}
      
      <p className="text-xs text-gray-500">
        {value ? 
          "This car will only be available at the selected location" : 
          "This car will be available at all pickup locations"
        }
      </p>
    </div>
  )
}
