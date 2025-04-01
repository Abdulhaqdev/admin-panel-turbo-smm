"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"

type PredefinedRange = "1d" | "7d" | "30d" | "60d" | "90d" | "all" | "custom"

interface DateContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  predefinedRange: PredefinedRange
  setPredefinedRange: (range: PredefinedRange) => void
  hasDataForRange: boolean
  getPercentChange: (current: number, previous: number) => number
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: React.ReactNode }) {
  // Default to 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  })
  const [predefinedRange, setPredefinedRange] = useState<PredefinedRange>("30d")
  const [hasDataForRange, setHasDataForRange] = useState(true)

  // Simulate checking if data exists for the selected range
  useEffect(() => {
    if (!dateRange?.from && !dateRange?.to) {
      // If all time, we always have data
      setHasDataForRange(true)
      return
    }

    if (!dateRange?.from || !dateRange?.to) return

    // This is a placeholder for your actual data availability check
    // In a real application, you would query your backend or check local data
    const mockDataDates = [
      new Date(),
      subDays(new Date(), 1),
      subDays(new Date(), 2),
      subDays(new Date(), 3),
      subDays(new Date(), 5),
      subDays(new Date(), 7),
      subDays(new Date(), 10),
      subDays(new Date(), 15),
      subDays(new Date(), 20),
      subDays(new Date(), 30),
      subDays(new Date(), 45),
      subDays(new Date(), 60),
      subDays(new Date(), 75),
      subDays(new Date(), 90),
      subDays(new Date(), 120),
      subDays(new Date(), 180),
      subDays(new Date(), 365),
    ]

    // Check if any of our mock data dates fall within the selected range
    const hasData = mockDataDates.some((date) =>
      isWithinInterval(date, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      }),
    )

    setHasDataForRange(hasData)
  }, [dateRange])

  // Helper function to calculate percentage change
  const getPercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return (
    <DateContext.Provider
      value={{
        dateRange,
        setDateRange,
        predefinedRange,
        setPredefinedRange,
        hasDataForRange,
        getPercentChange,
      }}
    >
      {children}
    </DateContext.Provider>
  )
}

export function useDateContext() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider")
  }
  return context
}

