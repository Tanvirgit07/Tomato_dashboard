"use client"
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Users, ShoppingBag, Truck, Shield } from 'lucide-react'

function DashboardSummaryCard() {
    const {data: adminDashboardSummaryCard, isLoading} = useQuery({
        queryKey: ['cardSummaryAdmin'],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/admin-top-summery-cards`, {
                method: "GET"
            })
            const json = await res.json()
            return json.data
        }
    })

    const cards = [
        {
            title: 'Total Users',
            value: adminDashboardSummaryCard?.totalUsers || 0,
            icon: Users,
            gradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Total Sellers',
            value: adminDashboardSummaryCard?.totalSellers || 0,
            icon: ShoppingBag,
            gradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Total Delivery',
            value: adminDashboardSummaryCard?.totalDelivery || 0,
            icon: Truck,
            gradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Total Admin',
            value: adminDashboardSummaryCard?.totalAdmin || 0,
            icon: Shield,
            gradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50',
            iconColor: 'text-orange-600'
        }
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div 
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${card.bgLight} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-6 h-6 ${card.iconColor}`} />
                            </div>
                            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${card.gradient} animate-pulse`}></div>
                        </div>
                        
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                        
                        <div className={`mt-4 h-1 w-full bg-gradient-to-r ${card.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </div>
                )
            })}
        </div>
    )
}

export default DashboardSummaryCard