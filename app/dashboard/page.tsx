"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  LineChart,
  AreaChart,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { useDateContext } from "@/contexts/date-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, isSameDay } from "date-fns"

export default function DashboardPage() {
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar")
  const { dateRange, hasDataForRange, getPercentChange } = useDateContext()

  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    orders: { current: 0, previous: 0 },
    revenue: { current: 0, previous: 0 },
    services: { current: 0, previous: 0 },
    users: { current: 0, previous: 0 },
  })

  // Update metrics based on the selected date range
  useEffect(() => {
    if (!hasDataForRange) {
      setMetrics({
        orders: { current: 0, previous: 0 },
        revenue: { current: 0, previous: 0 },
        services: { current: 0, previous: 0 },
        users: { current: 0, previous: 0 },
      })
      return
    }

    // Mock data generator based on date range
    const generateMetricsForRange = () => {
      // Base numbers that will be modified based on the date range
      const baseMetrics = {
        orders: 1282224,
        revenue: 453333231.89,
        services: 573,
        users: 342,
      }

      // For all time, we use the base metrics
      if (!dateRange) {
        return {
          orders: { current: baseMetrics.orders * 4, previous: baseMetrics.orders * 3 },
          revenue: { current: baseMetrics.revenue * 4, previous: baseMetrics.revenue * 3 },
          services: { current: baseMetrics.services * 3, previous: baseMetrics.services * 2 },
          users: { current: baseMetrics.users * 3, previous: baseMetrics.users * 2 },
        }
      }

      // Default case for custom date ranges
      let multiplier = 1
      let previousMultiplier = 0.85

      // Single day has less data
      if (dateRange.from && dateRange.to && isSameDay(dateRange.from, dateRange.to)) {
        multiplier = 0.2
        previousMultiplier = 0.15
      }
      // For short ranges (1-7 days)
      else if (
        dateRange.from &&
        dateRange.to &&
        dateRange.to.getTime() - dateRange.from.getTime() <= 7 * 24 * 60 * 60 * 1000
      ) {
        multiplier = 0.5
        previousMultiplier = 0.4
      }
      // For medium ranges (8-30 days)
      else if (
        dateRange.from &&
        dateRange.to &&
        dateRange.to.getTime() - dateRange.from.getTime() <= 30 * 24 * 60 * 60 * 1000
      ) {
        multiplier = 1
        previousMultiplier = 0.85
      }
      // For long ranges (31-90 days)
      else if (
        dateRange.from &&
        dateRange.to &&
        dateRange.to.getTime() - dateRange.from.getTime() <= 90 * 24 * 60 * 60 * 1000
      ) {
        multiplier = 2
        previousMultiplier = 1.7
      }
      // For very long ranges (90+ days)
      else {
        multiplier = 3
        previousMultiplier = 2.5
      }

      // Add some randomness to make it look more realistic
      const addNoise = (value: number) => value * (0.9 + Math.random() * 0.2)

      return {
        orders: {
          current: Math.round(addNoise(baseMetrics.orders * multiplier)),
          previous: Math.round(addNoise(baseMetrics.orders * previousMultiplier)),
        },
        revenue: {
          current: Number(addNoise(baseMetrics.revenue * multiplier).toFixed(2)),
          previous: Number(addNoise(baseMetrics.revenue * previousMultiplier).toFixed(2)),
        },
        services: {
          current: Math.round(addNoise(baseMetrics.services * multiplier)),
          previous: Math.round(addNoise(baseMetrics.services * previousMultiplier)),
        },
        users: {
          current: Math.round(addNoise(baseMetrics.users * multiplier)),
          previous: Math.round(addNoise(baseMetrics.users * previousMultiplier)),
        },
      }
    }

    setMetrics(generateMetricsForRange())
  }, [dateRange, hasDataForRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <DatePickerWithRange />
        </div>
      </div>

      {!hasDataForRange && dateRange?.from && dateRange?.to && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            There is no data available for the selected date range: {format(dateRange.from, "LLL dd, y")} -{" "}
            {format(dateRange.to, "LLL dd, y")}. Displaying zero values for all metrics.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.orders.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {metrics.orders.current > metrics.orders.previous ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : metrics.orders.current < metrics.orders.previous ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <p
                className={`${
                  metrics.orders.current > metrics.orders.previous
                    ? "text-green-500"
                    : metrics.orders.current < metrics.orders.previous
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {hasDataForRange
                  ? `${getPercentChange(metrics.orders.current, metrics.orders.previous).toFixed(1)}% from previous period`
                  : "No change from previous period"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {metrics.revenue.current > metrics.revenue.previous ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : metrics.revenue.current < metrics.revenue.previous ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <p
                className={`${
                  metrics.revenue.current > metrics.revenue.previous
                    ? "text-green-500"
                    : metrics.revenue.current < metrics.revenue.previous
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {hasDataForRange
                  ? `${getPercentChange(metrics.revenue.current, metrics.revenue.previous).toFixed(1)}% from previous period`
                  : "No change from previous period"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.services.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {metrics.services.current > metrics.services.previous ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : metrics.services.current < metrics.services.previous ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <p
                className={`${
                  metrics.services.current > metrics.services.previous
                    ? "text-green-500"
                    : metrics.services.current < metrics.services.previous
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {hasDataForRange
                  ? `${getPercentChange(metrics.services.current, metrics.services.previous).toFixed(1)}% from previous period`
                  : "No change from previous period"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {metrics.users.current > metrics.users.previous ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : metrics.users.current < metrics.users.previous ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <p
                className={`${
                  metrics.users.current > metrics.users.previous
                    ? "text-green-500"
                    : metrics.users.current < metrics.users.previous
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {hasDataForRange
                  ? `${getPercentChange(metrics.users.current, metrics.users.previous).toFixed(1)}% from previous period`
                  : "No change from previous period"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Orders Overview</CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to ? (
                <>
                  Order volume from {format(dateRange.from, "LLL dd, y")} to {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                "Daily order volume for the selected period"
              )}
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
              <BarChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("area")}
            >
              <AreaChart className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <DashboardChart chartType={chartType} />
        </CardContent>
      </Card>
    </div>
  )
}

