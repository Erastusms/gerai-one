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
  FolderTree,
  Image as ImageIcon,
} from "lucide-react"

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  const { data: catRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-categories-list", page, search],
    queryFn: () => adminApi.getCategories({ page, limit, search }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] })
      setIsDeleteOpen(false)
    },
  })

  const resetForm = () => {
    setName("")
    setSlug("")
    setDescription("")
    setImageUrl("")
    setIsActive(true)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"))
  }

  const openEdit = (cat: any) => {
    setSelectedCategory(cat)
    setName(cat.name || "")
    setSlug(cat.slug || "")
    setDescription(cat.description || "")
    setImageUrl(cat.imageUrl || "")
    setIsActive(cat.isActive ?? true)
    setIsEditOpen(true)
  }

  const openDelete = (cat: any) => {
    setSelectedCategory(cat)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, slug, description, imageUrl, isActive })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return
    updateMutation.mutate({
      id: selectedCategory.id,
      data: { name, slug, description, imageUrl, isActive },
    })
  }

  const categories = catRes?.data?.categories || []
  const meta = catRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-indigo-600" /> Categories Management
          </h1>
          <p className="text-sm text-slate-500">Organize store items into structured product categories.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search category name..."
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
                    <TableHead className="w-14">Image</TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Product Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat: any) => (
                      <TableRow key={cat.id}>
                        <TableCell>
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="h-9 w-9 rounded-lg object-cover border" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {cat.name[0]}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{cat.name}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{cat.slug}</TableCell>
                        <TableCell className="text-xs text-slate-500 max-w-xs truncate">{cat.description || "—"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{cat.productCount || 0} Products</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cat.isActive ? "success" : "destructive"}>
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(cat)} className="h-8 w-8 p-0 text-indigo-600 cursor-pointer">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDelete(cat)} className="h-8 w-8 p-0 text-red-600 cursor-pointer">
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
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Category Name *</label>
            <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Category">
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Category Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
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
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Category" closeOnOutsideClick={false}>
        {selectedCategory && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this category?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Category Name</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedCategory.name}</p>
              <span className="text-[10px] text-slate-400 font-mono">Slug: {selectedCategory.slug}</span>
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
                onClick={() => deleteMutation.mutate(selectedCategory.id)}
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
