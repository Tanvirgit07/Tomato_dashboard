import React from 'react'
import DashboardOrdersSummaryAdmin from './DashboardOrderStatus'
import DashboardCategorySummaryAdmin from './DashbordCategorySummeryAdmin'
import DashboardSummaryCard from './DashboardSummeryCard'
import DashboardRevenueChart from './DashbaordRevenue'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

function TotalDashbaord() {
  return (
    <div className="">
      {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Product
            </h1>
            <nav className="flex items-center text-sm text-gray-600">
              <Link
                href="/dashboard"
                className="hover:text-red-500 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Edit Product</span>
            </nav>
          </div>
        </div>
      <div className="">
        <DashboardSummaryCard />
      </div>

      <div className="flex gap-6 items-stretch my-10">
        <div className="w-1/2 h-full">
          <DashboardOrdersSummaryAdmin />
        </div>

        <div className="w-1/2 h-full">
          <DashboardCategorySummaryAdmin />
        </div>
      </div>

      <div>
        <DashboardRevenueChart />
      </div>
    </div>
  )
}

export default TotalDashbaord
