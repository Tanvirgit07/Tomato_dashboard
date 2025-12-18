"use client"

import { ShoppingCart } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
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

type OrderStatusItem = {
  status: string
  count: number
}

/* ---------------- Color Mapping ---------------- */

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
}

/* ---------------- Component ---------------- */

function DashboardOrdersSummaryAdmin() {
  const {
    data: ordersSummaryData = [],
    isLoading,
    isError,
  } = useQuery<OrderStatusItem[]>({
    queryKey: ["ordersSummary"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/admin-orders-summery`
      )
      if (!res.ok) throw new Error("Failed to fetch orders summary")
      const json = await res.json()
      return json.data
    },
  })

  /* -------- Chart Data -------- */

  const chartData = ordersSummaryData.map((item) => ({
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    orders: item.count,
    fill: STATUS_COLORS[item.status] || "#6b7280",
  }))

  /* -------- Chart Config -------- */

  const chartConfig: ChartConfig = {
    orders: {
      label: "Orders",
    },
  }

  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0)

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="h-[700px] bg-muted animate-pulse rounded" />
      </Card>
    )
  }

  /* ---------------- Empty / Error ---------------- */

  if (isError || chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[700px]">
          <p className="text-muted-foreground">No orders data found</p>
        </CardContent>
      </Card>
    )
  }

  /* ---------------- Render ---------------- */

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle>Order Status Overview</CardTitle>
        <CardDescription>Orders by status</CardDescription>
      </CardHeader>

      <CardContent className="">
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="orders" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-center justify-center mt-14 gap-2 text-sm">
        <div className="flex gap-2 font-medium">
          Total {totalOrders} orders <ShoppingCart className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Showing order distribution across {chartData.length} statuses
        </div>
      </CardFooter>
    </Card>
  )
}

export default DashboardOrdersSummaryAdmin
