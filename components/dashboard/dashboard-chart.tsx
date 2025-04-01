"use client"

import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"
import { useDateContext } from "@/contexts/date-context"
import { differenceInDays, eachDayOfInterval, format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns"
import { useMemo } from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface DashboardChartProps {
  chartType: "bar" | "line" | "area"
}

export function DashboardChart({ chartType }: DashboardChartProps) {
  const { dateRange, hasDataForRange, predefinedRange } = useDateContext()

  // Generate labels and data based on the selected date range
  const { labels, chartData } = useMemo(() => {
    // For "All Time" option
    if (predefinedRange === "all") {
      const today = new Date()
      const labels = []
      const data = []

      // For all time, we'll show last 24 months
      for (let i = 23; i >= 0; i--) {
        const date = subMonths(today, i)
        labels.push(format(date, "MMM yyyy"))
        // Generate some realistic looking data with an upward trend
        const baseValue = 60 + Math.floor(Math.random() * 30)
        const growthFactor = Math.pow(1.05, 24 - i) // 5% growth per month
        data.push(Math.round(baseValue * growthFactor))
      }

      return {
        labels,
        chartData: data,
      }
    }

    if (!dateRange?.from || !dateRange?.to) {
      // Default to last 7 days if no range is selected
      const today = new Date()
      const sevenDaysAgo = subDays(today, 6)
      const days = eachDayOfInterval({ start: sevenDaysAgo, end: today })

      return {
        labels: days.map((day) => format(day, "MMM d")),
        chartData: days.map(() => Math.floor(Math.random() * 80) + 20),
      }
    }

    // Generate a label for each day in the range
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    // Format labels based on the range length
    const dayCount = differenceInDays(dateRange.to, dateRange.from) + 1

    let labels: string[]
    let chartData: number[]

    if (dayCount === 1) {
      // For a single day, show hours
      labels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"]
      chartData = hasDataForRange ? labels.map(() => Math.floor(Math.random() * 20) + 5) : Array(8).fill(0)
    } else if (dayCount <= 7) {
      // For 2-7 days, show each day
      labels = days.map((day) => format(day, "EEE, MMM d"))
      chartData = hasDataForRange ? days.map(() => Math.floor(Math.random() * 50) + 20) : Array(days.length).fill(0)
    } else if (dayCount <= 31) {
      // For 8-31 days, group every few days
      const interval = Math.ceil(dayCount / 10)
      const filteredDays = days.filter((_, i) => i % interval === 0)
      labels = filteredDays.map((day) => format(day, "MMM d"))

      // Ensure the last day is included
      if (!labels.includes(format(dateRange.to, "MMM d"))) {
        labels.push(format(dateRange.to, "MMM d"))
      }

      chartData = hasDataForRange ? labels.map(() => Math.floor(Math.random() * 80) + 40) : Array(labels.length).fill(0)
    } else if (dayCount <= 90) {
      // For 1-3 months, show weeks
      const weekInterval = Math.ceil(dayCount / 12)
      const filteredDays = days.filter((_, i) => i % (weekInterval * 7) === 0)
      labels = filteredDays.map((day) => format(day, "MMM d"))

      // Ensure the last day is included
      if (!labels.includes(format(dateRange.to, "MMM d"))) {
        labels.push(format(dateRange.to, "MMM d"))
      }

      chartData = hasDataForRange
        ? labels.map(() => Math.floor(Math.random() * 100) + 60)
        : Array(labels.length).fill(0)
    } else {
      // For longer periods, show months
      const startMonth = startOfMonth(dateRange.from)
      const endMonth = endOfMonth(dateRange.to)
      const monthDiff =
        (endMonth.getFullYear() - startMonth.getFullYear()) * 12 + endMonth.getMonth() - startMonth.getMonth() + 1

      labels = []
      for (let i = 0; i < monthDiff; i++) {
        const month = new Date(startMonth)
        month.setMonth(startMonth.getMonth() + i)
        labels.push(format(month, "MMM yyyy"))
      }

      chartData = hasDataForRange
        ? labels.map(() => Math.floor(Math.random() * 150) + 80)
        : Array(labels.length).fill(0)
    }

    return { labels, chartData }
  }, [dateRange, hasDataForRange, predefinedRange])

  const data = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: chartData,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar data={data} options={options} height={350} />
      case "line":
        return <Line data={data} options={options} height={350} />
      case "area":
        return (
          <Line
            data={{
              ...data,
              datasets: [
                {
                  ...data.datasets[0],
                  fill: true,
                },
              ],
            }}
            options={options}
            height={350}
          />
        )
      default:
        return <Bar data={data} options={options} height={350} />
    }
  }

  return <div className="w-full">{renderChart()}</div>
}

