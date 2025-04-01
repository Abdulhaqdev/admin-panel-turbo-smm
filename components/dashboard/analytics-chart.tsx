"use client"

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"
import { useDateContext } from "@/contexts/date-context"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface AnalyticsChartProps {
  type: "bar" | "line" | "pie" | "doughnut"
  data: any
  stacked?: boolean
}

export function AnalyticsChart({ type, data, stacked = false }: AnalyticsChartProps) {
  const { dateRange } = useDateContext()

  const options: ChartOptions = {
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
      title: {
        display: false,
        text:
          dateRange?.from && dateRange?.to
            ? `Data from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`
            : undefined,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    stacked: stacked,
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar data={data} options={options} height={350} />
      case "line":
        return <Line data={data} options={options} height={350} />
      case "pie":
        return <Pie data={data} options={options} height={350} />
      case "doughnut":
        return <Doughnut data={data} options={options} height={350} />
      default:
        return <Bar data={data} options={options} height={350} />
    }
  }

  return <div className="w-full">{renderChart()}</div>
}

