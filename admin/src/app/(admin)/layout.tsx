"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Loader2, ShieldAlert } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Query authenticated admin user profile from internal auth backend
  const { data: profileRes, isLoading, isError, error } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => adminApi.getMe(),
    retry: false,
  })

  const profile = profileRes?.data
  const role = profile?.role

  useEffect(() => {
    if (isLoading) return

    // If query returned error (e.g. 401 Unauthorized), redirect immediately to /login
    if (isError || !profile) {
      router.push("/login")
      return
    }

    // If role is USER (customer), deny access and redirect to /login
    if (role && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      router.push("/login")
    }
  }, [isLoading, isError, profile, role, router])

  // While validating admin session, show sleek dark loading screen
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Verifying admin session credentials...
          </p>
        </div>
      </div>
    )
  }

  // If role is not ADMIN or SUPER_ADMIN
  if (!profile || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="text-center max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-sm text-slate-400">
            You do not have permissions to access the Admin Panel. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  // Render Admin Console layout once authenticated
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar for Desktop */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Sticky Header */}
        <Header setMobileSidebarOpen={setMobileSidebarOpen} profile={profile} />

        {/* Scrollable Panel Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 focus:outline-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
