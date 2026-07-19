"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import { profileApi } from "@/lib/api/profile.api"
import { Loader2, ShieldAlert } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Query authenticated user's role from GeraiOne's backend
  const { data: profileRes, isLoading: isProfileLoading, error } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => profileApi.getProfile(),
    enabled: isClerkLoaded && isSignedIn,
    retry: 1,
  })

  const profile = profileRes?.data
  const role = profile?.role

  useEffect(() => {
    if (!isClerkLoaded) return

    // If not signed in, redirect to the centralized Customer sign-in page
    if (!isSignedIn) {
      const loginUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "http://localhost:3000/sign-in"
      window.location.href = `${loginUrl}?redirect_url=${encodeURIComponent(window.location.href)}`
      return
    }

    if (isProfileLoading) return

    // If user profile role is USER, they are unauthorized. Redirect to Customer Home.
    if (role === "USER") {
      const storeUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"
      window.location.href = storeUrl
    }
  }, [isClerkLoaded, isSignedIn, isProfileLoading, role, router])

  // While validating Clerk and fetching role, show loading screen
  if (!isClerkLoaded || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
            Verifying administrative access...
          </p>
        </div>
      </div>
    )
  }

  // If role is loaded but not authorized
  if (role && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50">Unauthorized Access</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not have permissions to access the Admin Panel. Redirecting to storefront...
          </p>
        </div>
      </div>
    )
  }

  // Render Admin console once authorized
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
