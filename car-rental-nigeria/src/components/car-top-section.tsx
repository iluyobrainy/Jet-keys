"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LocationPicker } from "@/components/location-picker"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { Card, CardContent } from "@/components/ui/card"

export function CarTopSection() {
  const [pickupLocation, setPickupLocation] = useState<string>("")
  const [pickupDate, setPickupDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [pickupTime, setPickupTime] = useState<string | null>("10:00")
  const [returnTime, setReturnTime] = useState<string | null>("10:00")

  // Mock booked dates for demonstration
  const bookedDates = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 11, 26), // Boxing Day
    new Date(2024, 11, 31), // New Year's Eve
    new Date(2025, 0, 1),   // New Year's Day
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle car search here
    console.log('Searching for cars...', {
      pickupLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime
    })
  }

  return (
    <section className="bg-white py-6 sm:py-8 lg:py-10" aria-label="Car rental search form">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-end">
              {/* Pickup Location */}
              <div className="flex-1 w-full">
                <label htmlFor="pickup-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <LocationPicker
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Select pickup location"
                />
              </div>

              {/* Pickup Date */}
              <div className="flex-1 w-full">
                <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Date
                </label>
                <DatePickerWithTime
                  value={pickupDate}
                  timeValue={pickupTime}
                  onChange={setPickupDate}
                  onTimeChange={setPickupTime}
                  disabledDates={bookedDates}
                  placeholder="Select pickup date & time"
                />
              </div>

              {/* Return Date */}
              <div className="flex-1 w-full">
                <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </label>
                <DatePickerWithTime
                  value={returnDate}
                  timeValue={returnTime}
                  onChange={setReturnDate}
                  onTimeChange={setReturnTime}
                  disabledDates={bookedDates}
                  placeholder="Select return date & time"
                />
              </div>

              {/* Search Button */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-black text-white hover:bg-yellow-500 hover:text-white rounded-[30px] px-8 py-3 font-medium transition-colors duration-200"
                  aria-label="Search for available cars"
                >
                  Search a Car
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
