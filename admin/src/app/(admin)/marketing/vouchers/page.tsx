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
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  Ticket,
  Eye,
  SlidersHorizontal,
} from "lucide-react"

export default function VouchersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null)

  // Form Fields
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState("10")
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("")
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("0")
  const [usageLimit, setUsageLimit] = useState("")
  const [usagePerUser, setUsagePerUser] = useState("1")
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [isActive, setIsActive] = useState(true)
  const [isEnabled, setIsEnabled] = useState(true)

  // Fetch Marketing Config (Allow Multiple Vouchers)
  const { data: configRes } = useQuery({
    queryKey: ["admin-marketing-config"],
    queryFn: () => adminApi.getMarketingConfig(),
  })

  const allowMultipleVouchers = configRes?.data?.allowMultipleVouchers ?? false

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateMarketingConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marketing-config"] })
    },
  })

  // Fetch Vouchers List
  const { data: vouchersRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-vouchers-list", page, search, statusFilter],
    queryFn: () =>
      adminApi.getVouchers({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers-list"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers-list"] })
      setIsDeleteOpen(false)
    },
  })

  const resetForm = () => {
    setCode("")
    setName("")
    setDescription("")
    setDiscountType("PERCENTAGE")
    setDiscountValue("10")
    setMaxDiscountAmount("")
    setMinPurchaseAmount("0")
    setUsageLimit("")
    setUsagePerUser("1")
    setStartDate(new Date().toISOString().slice(0, 16))
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
    setIsActive(true)
    setIsEnabled(true)
  }

  const openView = (v: any) => {
    setSelectedVoucher(v)
    setIsViewOpen(true)
  }

  const openEdit = (v: any) => {
    setSelectedVoucher(v)
    setCode(v.code || "")
    setName(v.name || "")
    setDescription(v.description || "")
    setDiscountType(v.discountType || "PERCENTAGE")
    setDiscountValue(String(v.discountValue || 0))
    setMaxDiscountAmount(v.maxDiscountAmount ? String(v.maxDiscountAmount) : "")
    setMinPurchaseAmount(String(v.minPurchaseAmount || 0))
    setUsageLimit(v.usageLimit ? String(v.usageLimit) : "")
    setUsagePerUser(String(v.usagePerUser || 1))
    setStartDate(new Date(v.startDate).toISOString().slice(0, 16))
    setEndDate(new Date(v.endDate).toISOString().slice(0, 16))
    setIsActive(v.isActive ?? true)
    setIsEnabled(v.isEnabled ?? true)
    setIsEditOpen(true)
  }

  const openDelete = (v: any) => {
    setSelectedVoucher(v)
    setIsDeleteOpen(true)
  }

  const toggleEnabled = (v: any) => {
    updateMutation.mutate({
      id: v.id,
      data: { isEnabled: !v.isEnabled },
    })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      code,
      name,
      description: description || null,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      minPurchaseAmount: Number(minPurchaseAmount),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usagePerUser: Number(usagePerUser),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      isEnabled,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVoucher) return
    updateMutation.mutate({
      id: selectedVoucher.id,
      data: {
        code,
        name,
        description: description || null,
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        minPurchaseAmount: Number(minPurchaseAmount),
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usagePerUser: Number(usagePerUser),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
        isEnabled,
      },
    })
  }

  const vouchers = vouchersRes?.data?.vouchers || []
  const meta = vouchersRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-indigo-600" /> Voucher Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create discount promotional codes, specify usage constraints, and configure voucher rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Create Voucher
          </Button>
        </div>
      </div>

      {/* Global Configuration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <SlidersHorizontal className="h-4 w-4" /> Global Checkout Voucher Policy
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Allow Multiple Vouchers Per Order
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            When enabled, customers can apply multiple valid promotional vouchers simultaneously during checkout.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => updateConfigMutation.mutate({ allowMultipleVouchers: !allowMultipleVouchers })}
            disabled={updateConfigMutation.isPending}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              allowMultipleVouchers ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                allowMultipleVouchers ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {allowMultipleVouchers ? "Multiple Enabled" : "Single Only"}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search code or voucher name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9.5 w-full bg-slate-50/50 dark:bg-slate-950/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">Loading promotional vouchers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher Code</TableHead>
                    <TableHead>Voucher Name</TableHead>
                    <TableHead>Discount Value</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Active Status</TableHead>
                    <TableHead>Enabled Flag</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                        No vouchers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vouchers.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-900">
                            {v.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">{v.name}</TableCell>
                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                          {v.discountType === "PERCENTAGE" ? (
                            <span>{v.discountValue}% OFF</span>
                          ) : (
                            <span>Rp {Number(v.discountValue).toLocaleString("id-ID")}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(v.startDate).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(v.endDate).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={v.isActive ? "success" : "destructive"}>
                            {v.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleEnabled(v)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              v.isEnabled
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {v.isEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openView(v)} className="h-8 w-8 p-0 text-slate-500 cursor-pointer" title="View Voucher">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(v)} className="h-8 w-8 p-0 text-indigo-600 cursor-pointer" title="Edit Voucher">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDelete(v)} className="h-8 w-8 p-0 text-red-600 cursor-pointer" title="Delete Voucher">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="p-4 border-t border-slate-150 bg-slate-50/50">
                <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => setPage(p)} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Voucher Code">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Voucher Code *</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="e.g. WELCOME50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Voucher Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="New Customer Promo" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (Rp)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discount Value *</label>
              <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required placeholder="10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Discount (Rp)</label>
              <Input type="number" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min Purchase (Rp)</label>
              <Input type="number" value={minPurchaseAmount} onChange={(e) => setMinPurchaseAmount(e.target.value)} placeholder="100000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date & Time *</label>
              <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Date & Time *</label>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-indigo-600" />
              Is Active Record
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="rounded text-indigo-600" />
              Is Enabled (Feature Flag)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Voucher"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Voucher Code">
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Voucher Code *</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Voucher Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discount Value *</label>
              <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min Purchase (Rp)</label>
              <Input type="number" value={minPurchaseAmount} onChange={(e) => setMinPurchaseAmount(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Voucher" closeOnOutsideClick={false}>
        {selectedVoucher && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this promotional voucher?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Voucher Code</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{selectedVoucher.code}</p>
              <span className="text-xs text-slate-500">{selectedVoucher.name}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              This action can be restored later.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(selectedVoucher.id)}
                disabled={deleteMutation.isPending}
                className="cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting..." : "Soft Delete"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
