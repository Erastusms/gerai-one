import React, { useEffect, useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { Menu, Search, Sun, Moon, Bell, LogOut, Shield } from "lucide-react"
import { UserProfile } from "@/types"

interface HeaderProps {
  setMobileSidebarOpen: (open: boolean) => void
  profile: UserProfile | undefined
}

export function Header({ setMobileSidebarOpen, profile }: HeaderProps) {
  const { signOut } = useClerk()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark")
      setTheme(isDark ? "dark" : "light")
    }
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setTheme("dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setTheme("light")
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 shadow-xs transition-colors">
      {/* Left side: Mobile Menu toggle & search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Placeholder */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search console..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 transition-colors"
            readOnly
          />
        </div>
      </div>

      {/* Right side: Actions & User details */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-indigo-500" />
        </button>

        {/* User Info & Avatar */}
        {profile && (
          <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800 h-8">
            {/* Avatar */}
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName || "User"}
                className="h-8 w-8 rounded-full border border-indigo-100 dark:border-indigo-950 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                {profile.fullName ? profile.fullName[0].toUpperCase() : "A"}
              </div>
            )}

            {/* Profile text info */}
            <div className="flex flex-col text-left hidden md:flex">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                {profile.fullName || "Admin User"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none flex items-center gap-1">
                <Shield className="h-2.5 w-2.5 text-indigo-500" />
                {profile.role.replace("_", " ")}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={() => signOut()}
              className="p-1.5 ml-1 sm:ml-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
