"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
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
            "relative h-auto min-h-14 w-full justify-start rounded-2xl border-slate-200 bg-white/90 px-4 py-3 pl-14 text-left text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-white",
            !value && "text-muted-foreground",
            className
          )}
          id={id}
        >
          <span className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CalendarIcon className="h-4 w-4" />
          </span>
          <span className="block w-full truncate pr-2">
            {displayValue}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100] w-[calc(100vw-1rem)] max-w-[420px] overflow-hidden rounded-[24px] border border-slate-200 p-0 shadow-2xl" align="start">
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
