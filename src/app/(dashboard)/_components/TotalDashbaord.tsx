import React from 'react'
import DashboardOrdersSummaryAdmin from './DashboardOrderStatus'
import DashboardCategorySummaryAdmin from './DashbordCategorySummeryAdmin'
import DashboardSummaryCard from './DashboardSummeryCard'
import DashboardRevenueChart from './DashbaordRevenue'

function TotalDashbaord() {
  return (
    <div className="">
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
