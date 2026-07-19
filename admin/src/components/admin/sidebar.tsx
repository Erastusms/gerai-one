"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Lock,
  ShoppingBag,
  FolderTree,
  Tag,
  Layers,
  Sliders,
  MessageSquare,
  Search,
  Settings,
  X,
  Shield
} from "lucide-react"
import { cn } from "@gerai-one/shared-ui"

interface SidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()

  const menuGroups = [
    {
      groupLabel: "Main",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: "/",
        },
      ],
    },
    {
      groupLabel: "User Management",
      items: [
        {
          title: "Customers",
          icon: Users,
          href: "/customers",
        },
        {
          title: "Admin Users",
          icon: ShieldCheck,
          href: "/admin-users",
        },
        {
          title: "Roles",
          icon: KeyRound,
          href: "/roles",
        },
        {
          title: "Permissions",
          icon: Lock,
          href: "/permissions",
        },
      ],
    },
    {
      groupLabel: "Catalog",
      items: [
        {
          title: "Products",
          icon: ShoppingBag,
          href: "/products",
        },
        {
          title: "Categories",
          icon: FolderTree,
          href: "/categories",
        },
        {
          title: "Brands",
          icon: Tag,
          href: "/brands",
        },
        {
          title: "Variants",
          icon: Layers,
          href: "/variants",
        },
        {
          title: "Attributes",
          icon: Sliders,
          href: "/attributes",
        },
        {
          title: "Reviews",
          icon: MessageSquare,
          href: "/reviews",
        },
        {
          title: "SEO",
          icon: Search,
          href: "/seo",
        },
      ],
    },
    {
      groupLabel: "System",
      items: [
        {
          title: "System Settings",
          icon: Settings,
          href: "/settings",
        },
      ],
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 border-r border-slate-800 text-white transition-transform duration-300 lg:static lg:translate-x-0 shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 focus:outline-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-white">GeraiOne</span>
              <span className="text-[10px] text-indigo-400 font-semibold mt-0.5 tracking-wider uppercase">Console</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <span className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {group.groupLabel}
              </span>
              <div className="space-y-1 pt-1">
                {group.items.map((menu) => {
                  const Icon = menu.icon
                  const isActive = menu.href === "/" ? pathname === "/" : pathname.startsWith(menu.href)

                  return (
                    <Link
                      key={menu.title}
                      href={menu.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 select-none cursor-pointer",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{menu.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-medium">GeraiOne Admin Panel v1.0</p>
        </div>
      </aside>
    </>
  )
}
