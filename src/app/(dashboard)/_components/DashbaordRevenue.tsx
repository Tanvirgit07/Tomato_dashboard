"use client"

import { TrendingUp, DollarSign } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query"

/* ---------------- Types ---------------- */

type RevenueItem = {
  month: string
  revenue: number
}

/* ---------------- Chart Config ---------------- */

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981",
  },
} satisfies ChartConfig

/* ---------------- Component ---------------- */

function DashboardRevenueChart() {
  const {
    data: revenueData = [],
    isLoading,
    isError,
  } = useQuery<RevenueItem[]>({
    queryKey: ["revenueSummary"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/admin-revenue-summery`,
        {
          method: "GET",
        }
      )
      if (!res.ok) throw new Error("Failed to fetch revenue data")
      const json = await res.json()
      return json.data
    },
  })

  // Calculate total revenue and percentage change
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const currentMonth = revenueData[revenueData.length - 1]?.revenue || 0
  const previousMonth = revenueData[revenueData.length - 2]?.revenue || 0
  const percentageChange =
    previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-full h-full bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------------- Empty / Error ---------------- */

  if (isError || revenueData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No revenue data found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------------- Render ---------------- */

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue for 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart
            accessibilityLayer
            data={revenueData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-revenue)",
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium">
          {percentageChange !== 0 ? (
            <>
              {percentageChange > 0 ? "Trending up" : "Trending down"} by{" "}
              {Math.abs(percentageChange).toFixed(1)}% this month
              <TrendingUp
                className={`h-4 w-4 ${
                  percentageChange > 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </>
          ) : (
            <>
              Total revenue: ${totalRevenue.toFixed(2)}
              <DollarSign className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground">
          Showing monthly revenue for the year
        </div>
      </CardFooter>
    </Card>
  )
}

export default DashboardRevenueChart