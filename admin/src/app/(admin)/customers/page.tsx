"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
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
  Button,
  Dialog,
} from "@gerai-one/shared-ui"
import {
  Search,
  Loader2,
  ArrowUpDown,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  RefreshCcw,
  Check,
  AlertOctagon,
  Filter,
  Trash2,
} from "lucide-react"

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Selected for View / Edit Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Edit Form State
  const [editFullName, setEditFullName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")

  // Fetch from Fastify backend
  const {
    data: customersRes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-customers", page, search, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      adminApi.getCustomers({
        page,
        limit,
        search,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      }),
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      setIsEditOpen(false)
    },
  })

  const rawCustomers = customersRes?.data?.customers || []
  const meta = customersRes?.data?.meta

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const openView = (customer: any) => {
    setSelectedCustomer(customer)
    setIsViewOpen(true)
  }

  const openEdit = (customer: any) => {
    setSelectedCustomer(customer)
    setEditFullName(customer.fullName || "")
    setEditPhone(customer.phoneNumber || "")
    setEditStatus(customer.status || "ACTIVE")
    setIsEditOpen(true)
  }

  const toggleCustomerStatus = (customer: any) => {
    const nextStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    updateMutation.mutate({ id: customer.id, data: { status: nextStatus } })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    updateMutation.mutate({
      id: selectedCustomer.id,
      data: {
        fullName: editFullName,
        phoneNumber: editPhone,
        status: editStatus,
      },
    })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Customers Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View registered customer accounts, update profiles, and manage active status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search customer name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9.5 w-full bg-slate-50/50 dark:bg-slate-950/30"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Future-ready Bulk Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 opacity-60 cursor-not-allowed">
            <Check className="h-3.5 w-3.5" /> Bulk Activate
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 opacity-60 cursor-not-allowed">
            <UserX className="h-3.5 w-3.5" /> Bulk Deactivate
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3">
          <AlertOctagon className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : "Failed to load customer list from server."}
          </p>
          <Button variant="outline" onClick={() => refetch()} className="cursor-pointer">
            Retry Loading
          </Button>
        </div>
      )}

      {/* Table Container */}
      {!isError && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading customer database...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Avatar</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("fullName")}>
                        <span className="flex items-center gap-1">Full Name <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("email")}>
                        <span className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                        <span className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                        <span className="flex items-center gap-1">Registered <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">
                          No customers found matching search criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rawCustomers.map((customer: any) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            {customer.profilePhoto || customer.imageUrl ? (
                              <img
                                src={customer.profilePhoto || customer.imageUrl}
                                alt={customer.fullName || "Customer"}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                {customer.fullName ? customer.fullName[0].toUpperCase() : "C"}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            {customer.fullName || <span className="text-slate-400 italic">Unspecified</span>}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phoneNumber || <span className="text-slate-400 italic">None</span>}</TableCell>
                          <TableCell>
                            <Badge variant={customer.status === "ACTIVE" ? "success" : "destructive"}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(customer.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openView(customer)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 cursor-pointer"
                                title="View Customer"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEdit(customer)}
                                className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                title="Edit Customer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleCustomerStatus(customer)}
                                className={`h-8 w-8 p-0 cursor-pointer ${
                                  customer.status === "ACTIVE" ? "text-amber-600 hover:text-amber-800" : "text-emerald-600 hover:text-emerald-800"
                                }`}
                                title={customer.status === "ACTIVE" ? "Deactivate Customer" : "Activate Customer"}
                              >
                                {customer.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => setPage(p)} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* View Customer Dialog */}
      <Dialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Customer Profile Detail">
        {selectedCustomer && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {selectedCustomer.fullName ? selectedCustomer.fullName[0] : "C"}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedCustomer.fullName || "Unspecified Name"}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer ID</span>
                <span className="text-slate-800 font-mono">{selectedCustomer.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phone Number</span>
                <span className="text-slate-800">{selectedCustomer.phoneNumber || "Not provided"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status</span>
                <Badge variant={selectedCustomer.status === "ACTIVE" ? "success" : "destructive"}>
                  {selectedCustomer.status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Registered On</span>
                <span className="text-slate-800">{formatDate(selectedCustomer.createdAt)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Account">
        {selectedCustomer && (
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+62 812..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  )
}
