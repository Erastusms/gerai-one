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
  Tag,
} from "lucide-react"

export default function BrandsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  const { data: brandRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-brands-list", page, search],
    queryFn: () => adminApi.getBrands({ page, limit, search }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands-list"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands-list"] })
      setIsDeleteOpen(false)
    },
  })

  const resetForm = () => {
    setName("")
    setSlug("")
    setLogoUrl("")
    setIsActive(true)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"))
  }

  const openEdit = (b: any) => {
    setSelectedBrand(b)
    setName(b.name || "")
    setSlug(b.slug || "")
    setLogoUrl(b.logoUrl || "")
    setIsActive(b.isActive ?? true)
    setIsEditOpen(true)
  }

  const openDelete = (b: any) => {
    setSelectedBrand(b)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, slug, logoUrl, isActive })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand) return
    updateMutation.mutate({
      id: selectedBrand.id,
      data: { name, slug, logoUrl, isActive },
    })
  }

  const brands = brandRes?.data?.brands || []
  const meta = brandRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-6 w-6 text-indigo-600" /> Brand Management
          </h1>
          <p className="text-sm text-slate-500">Manage manufacturer brands and logo assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search brand name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9.5 w-full bg-slate-50/50"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Logo</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Product Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        No brands found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    brands.map((brand: any) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.name} className="h-9 w-9 rounded-lg object-contain border p-1 bg-white" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">
                              {brand.name[0]}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{brand.name}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{brand.slug}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{brand.productCount || 0} Products</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={brand.isActive ? "success" : "destructive"}>
                            {brand.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(brand)} className="h-8 w-8 p-0 text-indigo-600 cursor-pointer">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDelete(brand)} className="h-8 w-8 p-0 text-red-600 cursor-pointer">
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
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Brand">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Brand Name *</label>
            <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Logo Image URL</label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Brand"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Brand">
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Brand Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Logo Image URL</label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
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
      </Dialog>

      {/* Delete Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Brand" closeOnOutsideClick={false}>
        {selectedBrand && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this brand?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Brand Name</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedBrand.name}</p>
              <span className="text-[10px] text-slate-400 font-mono">Slug: {selectedBrand.slug}</span>
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
                onClick={() => deleteMutation.mutate(selectedBrand.id)}
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
