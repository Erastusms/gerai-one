"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard.api"
import { Button, Badge } from "@gerai-one/shared-ui"
import {
  Users,
  ShoppingBag,
  Layers,
  Tag,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  PackageX,
  RefreshCcw,
  Loader2,
  AlertOctagon
} from "lucide-react"

// Loading Skeleton component for Dashboard Cards
function CardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-sm" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // Query to fetch overview data with auto-refresh every 60s & window focus refetch
  const {
    data: overviewRes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => dashboardApi.getOverview(),
    refetchInterval: 60000, // Auto refresh statistics every 60 seconds
    refetchOnWindowFocus: true, // Refetch when browser window regains focus
    retry: 1
  })

  const stats = overviewRes?.data

  // Handler for retry / manual refresh
  const handleRefresh = () => {
    refetch()
  }

  // Error State Layout
  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Failed to Load Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {error instanceof Error ? error.message : "An unexpected network error occurred while querying analytics data."}
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Define metric sections mapping to dashboard values
  const sections = [
    {
      title: "Catalog & Business",
      cards: [
        {
          label: "Total Customers",
          value: stats?.totalCustomers,
          desc: "Registered storefront accounts",
          icon: Users,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
        },
        {
          label: "Total Products",
          value: stats?.totalProducts,
          desc: `${stats?.activeProducts ?? 0} active | ${stats?.inactiveProducts ?? 0} inactive`,
          icon: ShoppingBag,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
        },
        {
          label: "Total Categories",
          value: stats?.totalCategories,
          desc: "Product categories defined",
          icon: Layers,
          color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400",
        },
        {
          label: "Total Brands",
          value: stats?.totalBrands,
          desc: "Product brands registered",
          icon: Tag,
          color: "text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400",
        },
      ],
    },
    {
      title: "Checkout & Sales Fulfillment",
      cards: [
        {
          label: "Pending Checkouts",
          value: stats?.pendingCheckout,
          desc: "Sessions in checkout phase",
          icon: ShoppingCart,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
        },
        {
          label: "Pending Payments",
          value: stats?.pendingPayment,
          desc: "Awaiting gateway confirmation",
          icon: CreditCard,
          color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400",
        },
        {
          label: "Processing Orders",
          value: stats?.processingOrders,
          desc: "Fulfillment prep queue",
          icon: RefreshCw,
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
        },
        {
          label: "Shipped Orders",
          value: stats?.shippedOrders,
          desc: "Transit logistics queue",
          icon: Truck,
          color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400",
        },
        {
          label: "Completed Orders",
          value: stats?.completedOrders,
          desc: "Successful sales closed",
          icon: CheckCircle2,
          color: "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400",
        },
        {
          label: "Cancelled Orders",
          value: stats?.cancelledOrders,
          desc: "Rejected or expired orders",
          icon: AlertTriangle,
          color: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
        },
      ],
    },
    {
      title: "Inventory Alert & Stock Status",
      cards: [
        {
          label: "Low Stock Products",
          value: stats?.lowStockProducts,
          desc: "Threshold quantity <= 10",
          icon: AlertCircle,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
        },
        {
          label: "Out of Stock Products",
          value: stats?.outOfStockProducts,
          desc: "Quantity available = 0",
          icon: PackageX,
          color: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400",
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Dashboard Overview
            {isRefetching && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time business performance metrics aggregated from the database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase bg-slate-50 dark:bg-slate-900 py-1">
            Auto Refresh: 60s
          </Badge>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Render Sections */}
      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pl-1">
            {section.title}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? // Display 4 skeletons per loading section
                Array.from({ length: Math.min(4, section.cards.length) }).map((_, idx) => (
                  <CardSkeleton key={idx} />
                ))
              : section.cards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.label}
                      className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                          {card.label}
                        </span>
                        <div className={`p-2 rounded-xl ${card.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                          {card.value}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>
      ))}
    </div>
  )
}
