"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi, UserListParams } from "@/lib/api/admin.api"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Pagination,
  Button
} from "@gerai-one/shared-ui"
import { Search, Loader2, ArrowUpDown, ChevronDown } from "lucide-react"

// Beautiful local dummy fallback data if API is offline
const DUMMY_CUSTOMERS = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+62 812-3456-7890",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-06-15T08:30:00.000Z",
    profilePhoto: "https://i.pravatar.cc/150?img=33"
  },
  {
    id: "2",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+62 812-9876-5432",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-07-02T10:15:00.000Z",
    profilePhoto: "https://i.pravatar.cc/150?img=47"
  },
  {
    id: "3",
    fullName: "Albert Einstein",
    email: "albert.e@relativity.com",
    phoneNumber: null,
    role: "USER",
    status: "INACTIVE",
    createdAt: "2026-05-20T14:45:00.000Z",
    profilePhoto: null
  },
  {
    id: "4",
    fullName: "Super Admin",
    email: "super.admin@example.com",
    phoneNumber: "+62 811-1111-2222",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2026-07-18T07:59:00.000Z",
    profilePhoto: "https://i.pravatar.cc/150?img=12"
  },
  {
    id: "5",
    fullName: "Sarah Connor",
    email: "sarah.c@skyline.net",
    phoneNumber: "+1 555-0199",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-04-12T09:00:00.000Z",
    profilePhoto: "https://i.pravatar.cc/150?img=35"
  }
]

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Fetch from Fastify backend
  const { data: usersRes, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, search, sortBy, sortOrder],
    queryFn: () => adminApi.getUsers({ page, limit, search, sortBy, sortOrder }),
    retry: 1
  })

  // Destructure data
  const backendUsers = usersRes?.data?.users
  const backendMeta = usersRes?.data?.meta

  // Determine if using Mock Fallback Data
  const isFallback = error || !backendUsers
  
  // Apply local filtering/sorting/pagination if using mock fallback
  const getFallbackData = () => {
    let list = [...DUMMY_CUSTOMERS]

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.toLowerCase().includes(q)
      )
    }

    // Sort
    list.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? ""
      let valB = b[sortBy] ?? ""

      if (typeof valA === "string") valA = valA.toLowerCase()
      if (typeof valB === "string") valB = valB.toLowerCase()

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Paginate
    const totalItems = list.length
    const totalPages = Math.ceil(totalItems / limit)
    const offset = (page - 1) * limit
    const paginated = list.slice(offset, offset + limit)

    return {
      users: paginated,
      meta: {
        page,
        limit,
        totalItems,
        totalPages
      }
    }
  }

  const { users, meta } = isFallback ? getFallbackData() : { users: backendUsers, meta: backendMeta }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, search, and manage registered users and their permission roles.
          </p>
        </div>
        {isFallback && (
          <Badge variant="warning" className="self-start sm:self-auto shadow-xs">
            Using Local Offline Mode
          </Badge>
        )}
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9.5 w-full bg-slate-50/50 dark:bg-slate-950/30"
          />
        </div>
        <div className="flex-1" />
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading user directory...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Avatar</TableHead>
                    <TableHead className="cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort("fullName")}>
                      <span className="flex items-center gap-1">
                        Full Name
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort("email")}>
                      <span className="flex items-center gap-1">
                        Email Address
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort("role")}>
                      <span className="flex items-center gap-1">
                        Role
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort("status")}>
                      <span className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort("createdAt")}>
                      <span className="flex items-center gap-1">
                        Created At
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">
                        No customers found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user.fullName || "User"}
                              className="h-9 w-9 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                              {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                          {user.fullName || <span className="text-slate-400 italic">No name provided</span>}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber || <span className="text-slate-400 italic">None</span>}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "SUPER_ADMIN"
                                ? "default"
                                : user.role === "ADMIN"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            {meta && meta.totalPages > 1 && (
              <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
