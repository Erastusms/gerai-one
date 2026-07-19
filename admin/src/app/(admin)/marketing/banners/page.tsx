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
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Eye,
} from "lucide-react"

export default function BannersPage() {
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
  const [selectedBanner, setSelectedBanner] = useState<any>(null)

  // Form Fields
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [desktopImageUrl, setDesktopImageUrl] = useState("")
  const [mobileImageUrl, setMobileImageUrl] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [displayOrder, setDisplayOrder] = useState("0")
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [isActive, setIsActive] = useState(true)
  const [isEnabled, setIsEnabled] = useState(true)

  const { data: bannersRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-banners-list", page, search, statusFilter],
    queryFn: () =>
      adminApi.getBanners({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners-list"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners-list"] })
      setIsDeleteOpen(false)
    },
  })

  const resetForm = () => {
    setTitle("")
    setSubtitle("")
    setDescription("")
    setDesktopImageUrl("")
    setMobileImageUrl("")
    setRedirectUrl("")
    setDisplayOrder("0")
    setStartDate(new Date().toISOString().slice(0, 16))
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
    setIsActive(true)
    setIsEnabled(true)
  }

  const openView = (banner: any) => {
    setSelectedBanner(banner)
    setIsViewOpen(true)
  }

  const openEdit = (banner: any) => {
    setSelectedBanner(banner)
    setTitle(banner.title || "")
    setSubtitle(banner.subtitle || "")
    setDescription(banner.description || "")
    setDesktopImageUrl(banner.desktopImageUrl || "")
    setMobileImageUrl(banner.mobileImageUrl || "")
    setRedirectUrl(banner.redirectUrl || "")
    setDisplayOrder(String(banner.displayOrder || 0))
    setStartDate(new Date(banner.startDate).toISOString().slice(0, 16))
    setEndDate(new Date(banner.endDate).toISOString().slice(0, 16))
    setIsActive(banner.isActive ?? true)
    setIsEnabled(banner.isEnabled ?? true)
    setIsEditOpen(true)
  }

  const openDelete = (banner: any) => {
    setSelectedBanner(banner)
    setIsDeleteOpen(true)
  }

  const toggleEnabled = (banner: any) => {
    updateMutation.mutate({
      id: banner.id,
      data: { isEnabled: !banner.isEnabled },
    })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title,
      subtitle: subtitle || null,
      description: description || null,
      desktopImageUrl,
      mobileImageUrl: mobileImageUrl || null,
      redirectUrl: redirectUrl || null,
      displayOrder: Number(displayOrder),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      isEnabled,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBanner) return
    updateMutation.mutate({
      id: selectedBanner.id,
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        desktopImageUrl,
        mobileImageUrl: mobileImageUrl || null,
        redirectUrl: redirectUrl || null,
        displayOrder: Number(displayOrder),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
        isEnabled,
      },
    })
  }

  const banners = bannersRes?.data?.banners || []
  const meta = bannersRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-600" /> Homepage Banner Carousel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage storefront promotional hero banners and visibility feature flags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Create Banner
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search banner title..."
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
            <p className="text-sm text-slate-500">Loading promotional banners...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Preview</TableHead>
                    <TableHead>Banner Title</TableHead>
                    <TableHead className="text-center">Display Order</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Active Status</TableHead>
                    <TableHead>Enabled Flag</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                        No marketing banners found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner: any) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <img
                            src={banner.desktopImageUrl}
                            alt={banner.title}
                            className="h-12 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{banner.title}</span>
                            {banner.subtitle && <span className="text-xs text-slate-400 truncate max-w-xs">{banner.subtitle}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-700 dark:text-slate-300">
                          {banner.displayOrder}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(banner.startDate).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(banner.endDate).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={banner.isActive ? "success" : "destructive"}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleEnabled(banner)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              banner.isEnabled
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {banner.isEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openView(banner)} className="h-8 w-8 p-0 text-slate-500 cursor-pointer" title="View Banner">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openEdit(banner)} className="h-8 w-8 p-0 text-indigo-600 cursor-pointer" title="Edit Banner">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDelete(banner)} className="h-8 w-8 p-0 text-red-600 cursor-pointer" title="Delete Banner">
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
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Hero Banner">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Mega Sale Festival 2026" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subtitle</label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Up to 70% Off Electronics" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Desktop Image URL *</label>
            <Input value={desktopImageUrl} onChange={(e) => setDesktopImageUrl(e.target.value)} required placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile Image URL (Optional)</label>
            <Input value={mobileImageUrl} onChange={(e) => setMobileImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Redirect URL</label>
              <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="/category/electronics" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} required />
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
              {createMutation.isPending ? "Creating..." : "Create Banner"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Hero Banner">
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Desktop Image URL *</label>
            <Input value={desktopImageUrl} onChange={(e) => setDesktopImageUrl(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Redirect URL</label>
              <Input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} required />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-indigo-600" />
              Is Active
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="rounded text-indigo-600" />
              Is Enabled
            </label>
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

      {/* View Dialog */}
      <Dialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Banner Details">
        {selectedBanner && (
          <div className="space-y-4 pt-2">
            <img src={selectedBanner.desktopImageUrl} alt="" className="w-full h-48 object-cover rounded-xl border" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{selectedBanner.title}</h3>
              <p className="text-xs text-slate-500">{selectedBanner.subtitle || "No subtitle"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Display Order</span>
                <span className="font-bold">{selectedBanner.displayOrder}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Redirect URL</span>
                <span className="font-mono">{selectedBanner.redirectUrl || "None"}</span>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Banner" closeOnOutsideClick={false}>
        {selectedBanner && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this banner?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Banner Title</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedBanner.title}</p>
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
                onClick={() => deleteMutation.mutate(selectedBanner.id)}
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
