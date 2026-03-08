"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarWithTimeProps {
  selectedDate?: Date
  selectedTime?: string | null
  onDateChange?: (date: Date | undefined) => void
  onTimeChange?: (time: string | null) => void
  disabledDates?: Date[]
  className?: string
  placeholder?: string
}

export function CalendarWithTime({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  disabledDates = [],
  className,
  placeholder = "Select date and time"
}: CalendarWithTimeProps) {
  const [date, setDate] = React.useState<Date | undefined>(selectedDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(selectedTime || "10:00")
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  React.useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate)
      setCurrentMonth(selectedDate)
    }
  }, [selectedDate])

  React.useEffect(() => {
    if (selectedTime) {
      setSelectedTimeSlot(selectedTime)
    }
  }, [selectedTime])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (onDateChange) {
      onDateChange(newDate)
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTimeSlot(time)
    if (onTimeChange) {
      onTimeChange(time)
    }
  }

  // Generate time slots from 6:00 AM to 10:00 PM (15-minute intervals)
  const timeSlots = Array.from({ length: 65 }, (_, i) => {
    const totalMinutes = i * 15
    const hour = Math.floor(totalMinutes / 60) + 6 // Start from 6 AM
    const minute = totalMinutes % 60
    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    
    // Add AM/PM
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const displayTime = `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`
    
    return {
      value: timeString,
      display: displayTime
    }
  })

  // Filter out times after 10 PM
  const availableTimeSlots = timeSlots.filter(timeSlot => {
    const [hour] = timeSlot.value.split(':').map(Number)
    return hour < 22 // Before 10 PM
  })

  return (
    <Card className={className}>
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-4 sm:p-5">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={disabledDates}
            showOutsideDays={false}
            modifiers={{
              booked: disabledDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100",
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("en-US", { weekday: "short" })
              },
              formatMonthDropdown: (date) => {
                return date.toLocaleString("en-US", { month: "long" })
              },
            }}
            captionLayout="dropdown"
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t bg-slate-50/80 p-4 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l md:bg-transparent">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {availableTimeSlots.map((timeSlot) => (
              <Button
                key={timeSlot.value}
                variant={selectedTimeSlot === timeSlot.value ? "default" : "outline"}
                onClick={() => handleTimeChange(timeSlot.value)}
                className="h-10 w-full rounded-xl px-3 text-xs shadow-none md:text-sm"
              >
                {timeSlot.display}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
