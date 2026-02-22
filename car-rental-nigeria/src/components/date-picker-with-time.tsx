"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarWithTime } from "@/components/ui/calendar-with-time"

interface DatePickerWithTimeProps {
  value?: Date
  timeValue?: string | null
  onChange?: (date: Date | undefined) => void
  onTimeChange?: (time: string | null) => void
  disabledDates?: Date[]
  placeholder?: string
  className?: string
  id?: string
}

export function DatePickerWithTime({
  value,
  timeValue,
  onChange,
  onTimeChange,
  disabledDates = [],
  placeholder = "Pick a date and time",
  className,
  id
}: DatePickerWithTimeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateChange = (date: Date | undefined) => {
    if (onChange) {
      onChange(date)
    }
  }

  const handleTimeChange = (time: string | null) => {
    if (onTimeChange) {
      onTimeChange(time)
    }
  }

  const handleConfirm = () => {
    setIsOpen(false)
  }

  const displayValue = value && timeValue 
    ? `${format(value, "PPP")} at ${timeValue}`
    : placeholder

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal pl-10 h-12",
            !value && "text-muted-foreground",
            className
          )}
          id={id}
        >
          <CalendarIcon className="mr-2 h-4 w-4 absolute left-3" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <CalendarWithTime
          selectedDate={value}
          selectedTime={timeValue}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          disabledDates={disabledDates}
          className="border-0 shadow-none"
        />
      </PopoverContent>
    </Popover>
  )
}
