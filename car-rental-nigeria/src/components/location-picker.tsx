"use client"

import * as React from "react"
import { Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { memo, useMemo, useCallback } from "react"
import { useLocations } from "@/lib/hooks/useLocations"

interface LocationPickerProps {
  value?: string
  onChange?: (location: string) => void
  placeholder?: string
  className?: string
  id?: string
}

const NIGERIAN_LOCATIONS = {
  "Lagos": [
    "Lagos Airport (LOS)",
    "Victoria Island",
    "Lekki",
    "Ikoyi",
    "Surulere",
    "Yaba",
    "Ikeja",
    "Oshodi",
    "Alimosho",
    "Ikorodu",
    "Ajah",
    "Festac Town",
    "Maryland",
    "Ogba",
    "Magodo",
    "Banana Island",
    "Ikate",
    "Sangotedo",
    "Agungi",
    "Jakande"
  ],
  "Abuja": [
    "Nnamdi Azikiwe Airport (ABV)",
    "Central Business District",
    "Wuse",
    "Garki",
    "Maitama",
    "Asokoro",
    "Gwarinpa",
    "Kubwa",
    "Jabi",
    "Utako",
    "Lugbe",
    "Karu",
    "Nyanya",
    "Mararaba"
  ],
  "Port Harcourt": [
    "Port Harcourt Airport (PHC)",
    "GRA",
    "Old GRA",
    "New GRA",
    "Rumuokoro",
    "Rumuomasi",
    "Rumuola",
    "Rumuibekwe",
    "Rumuodara",
    "Rumuokwuta",
    "Rumuokoro",
    "Rumuapirikom",
    "Rumuokwurusi",
    "Rumuokoro",
    "Rumuokoro",
    "Rumuokoro"
  ],
  "Kano": [
    "Kano Airport (KAN)",
    "Nasarawa GRA",
    "Sabon Gari",
    "Fagge",
    "Municipal",
    "Ungogo",
    "Dala",
    "Tarauni",
    "Nassarawa",
    "Ungogo",
    "Municipal",
    "Fagge",
    "Dala",
    "Tarauni"
  ],
  "Ibadan": [
    "Ibadan Airport (IBA)",
    "Bodija",
    "Agodi",
    "Mokola",
    "Sango",
    "Challenge",
    "Molete",
    "Dugbe",
    "Oke Ado",
    "Apata",
    "Ring Road",
    "Challenge",
    "Mokola",
    "Sango"
  ],
  "Kaduna": [
    "Kaduna Airport (KAD)",
    "Barnawa",
    "Malali",
    "Kakuri",
    "Ungwan Rimi",
    "Ungwan Dosa",
    "Ungwan Kanawa",
    "Ungwan Sarki",
    "Ungwan Boro",
    "Ungwan Rimi",
    "Ungwan Dosa",
    "Ungwan Kanawa"
  ],
  "Enugu": [
    "Enugu Airport (ENU)",
    "New Haven",
    "GRA",
    "Independence Layout",
    "Achara Layout",
    "Uwani",
    "Abakpa",
    "Emene",
    "Thinkers Corner",
    "New Haven",
    "GRA",
    "Independence Layout"
  ],
  "Calabar": [
    "Calabar Airport (CBQ)",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill",
    "Diamond Hill"
  ]
}

export const LocationPicker = memo(function LocationPicker({ value, onChange, placeholder = "Search location", className, id }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLocation, setSelectedLocation] = React.useState(value || "")
  
  // Fetch locations from database
  const { data: locations = [], isLoading } = useLocations()

  React.useEffect(() => {
    if (value) {
      setSelectedLocation(value)
    }
  }, [value])

  // Group locations by city
  const locationsByCity = React.useMemo(() => {
    const grouped: Record<string, string[]> = {}
    locations.forEach(location => {
      if (!grouped[location.city]) {
        grouped[location.city] = []
      }
      grouped[location.city].push(location.name)
    })
    return grouped
  }, [locations])

  const filteredLocations = React.useMemo(() => {
    if (!searchTerm) {
      return locationsByCity
    }

    const filtered: Record<string, string[]> = {}
    
    Object.entries(locationsByCity).forEach(([city, locationNames]) => {
      const matchingLocations = locationNames.filter(location =>
        location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (matchingLocations.length > 0) {
        filtered[city] = matchingLocations
      }
    })

    return filtered
  }, [searchTerm, locationsByCity])

  const allLocations = React.useMemo(() => {
    return locations.map(location => `${location.name}, ${location.city}`)
  }, [locations])

  const quickFilteredLocations = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    
    const term = searchTerm.toLowerCase()
    return allLocations.filter(location =>
      location.toLowerCase().includes(term)
    ).slice(0, 8) // Reduced from 10 to 8 for better performance
  }, [searchTerm, allLocations])

  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(location)
    onChange?.(location)
    setIsOpen(false)
    setSearchTerm("")
  }, [onChange])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal pl-10 h-12",
            !selectedLocation && "text-muted-foreground",
            className
          )}
          id={id}
        >
          <MapPin className="mr-2 h-4 w-4 absolute left-3" />
          {selectedLocation ? selectedLocation : <span className="text-gray-500">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-[100]" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cities, airports, or areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {searchTerm ? (
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Results</div>
              {quickFilteredLocations.map((location, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleLocationSelect(location)}
                >
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="text-left">
                    <div className="font-medium">{location.split(', ')[0]}</div>
                    <div className="text-sm text-gray-500">{location.split(', ')[1]}</div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Popular Cities</div>
              {Object.entries(filteredLocations).map(([city, locations]) => (
                <div key={city} className="mb-4">
                  <div className="text-sm font-medium text-gray-600 mb-1 px-3">{city}</div>
                  {locations.slice(0, 5).map((location, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleLocationSelect(`${location}, ${city}`)}
                    >
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="text-left">
                        <div className="font-medium">{location}</div>
                        <div className="text-sm text-gray-500">{city}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
})
