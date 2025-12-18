"use client"

import { Package } from "lucide-react"
import { Pie, PieChart } from "recharts"
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

type CategorySummaryItem = {
  categoryName: string
  products: number
}

type ChartItem = {
  category: string
  products: number
  fill: string
}

/* ---------------- Color Palette ---------------- */

const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
]

/* ---------------- Component ---------------- */

function DashboardCategorySummaryAdmin() {
  const {
    data: categorySummaryData = [],
    isLoading,
    isError,
  } = useQuery<CategorySummaryItem[]>({
    queryKey: ["categorySummary"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/admin-category-summery`
      )
      if (!res.ok) throw new Error("Failed to fetch category summary")
      const json = await res.json()
      return json.data
    },
  })

  /* -------- Chart Data -------- */

  const chartData: ChartItem[] = categorySummaryData.map((item, index) => ({
    category: item.categoryName,
    products: item.products,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))

  const chartConfig: ChartConfig = categorySummaryData.reduce(
    (config, item, index) => {
      config[`category${index}`] = {
        label: item.categoryName,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }
      return config
    },
    {
      products: {
        label: "Products",
      },
    } as ChartConfig
  )

  const totalProducts = chartData.reduce(
    (sum, item) => sum + item.products,
    0
  )

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="h-[350px] w-[350px] bg-muted rounded-full animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  /* ---------------- Empty / Error ---------------- */

  if (isError || chartData.length === 0) {
    return (
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No category data found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------------- Render ---------------- */

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Top categories by product count</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="products"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total {totalProducts} products
          <Package className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Showing distribution across {chartData.length} categories
        </div>
      </CardFooter>
    </Card>
  )
}

export default DashboardCategorySummaryAdmin
