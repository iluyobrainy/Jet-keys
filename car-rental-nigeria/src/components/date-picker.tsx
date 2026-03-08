"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setCurrentMonth(value)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (onChange) {
      onChange(selectedDate)
    }
  }

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(parseInt(monthIndex))
    setCurrentMonth(newMonth)
  }

  const handleYearChange = (year: string) => {
    const newYear = new Date(currentMonth)
    newYear.setFullYear(parseInt(year))
    setCurrentMonth(newYear)
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "relative h-auto min-h-14 w-full justify-start rounded-2xl border-slate-200 bg-white/90 px-4 py-3 pl-14 text-left text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-white",
            !date && "text-muted-foreground",
            className
          )}
        >
          <span className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CalendarIcon className="h-4 w-4" />
          </span>
          <span className="block w-full truncate pr-2">
            {date ? format(date, "PPP") : <span className="text-gray-500">{placeholder}</span>}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-1rem)] max-w-[360px] overflow-hidden rounded-[24px] border border-slate-200 p-0 shadow-2xl" align="start">
        <div className="p-3 border-b">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="h-9 w-[130px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="h-9 w-[92px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
