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
  Layers,
} from "lucide-react"

export default function VariantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  // Form Fields
  const [productId, setProductId] = useState("")
  const [sku, setSku] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("10")
  const [weight, setWeight] = useState("500")

  const { data: variantsRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-variants-list", page, search],
    queryFn: () => adminApi.getVariants({ page, limit, search }),
  })

  const { data: productsRes } = useQuery({
    queryKey: ["admin-products-select"],
    queryFn: () => adminApi.getProducts({ limit: 100 }),
  })

  const productsList = productsRes?.data?.products || []

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-variants-list"] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-variants-list"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-variants-list"] })
      setIsDeleteOpen(false)
    },
  })

  const resetForm = () => {
    setProductId("")
    setSku("")
    setPrice("")
    setStock("10")
    setWeight("500")
  }

  const openEdit = (v: any) => {
    setSelectedVariant(v)
    setSku(v.sku || "")
    setPrice(String(v.price || 0))
    setStock(String(v.stock || 0))
    setWeight(String(v.weight || 0))
    setIsEditOpen(true)
  }

  const openDelete = (v: any) => {
    setSelectedVariant(v)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      productId,
      sku,
      price: Number(price),
      stock: Number(stock),
      weight: Number(weight),
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariant) return
    updateMutation.mutate({
      id: selectedVariant.id,
      data: {
        sku,
        price: Number(price),
        stock: Number(stock),
        weight: Number(weight),
      },
    })
  }

  const variants = variantsRes?.data?.variants || []
  const meta = variantsRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-600" /> Product Variants
          </h1>
          <p className="text-sm text-slate-500">Manage individual product SKU variations, pricing, and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Variant SKU
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search variant SKU..."
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
                    <TableHead>Variant SKU</TableHead>
                    <TableHead>Parent Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                        No product variants found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{v.sku}</TableCell>
                        <TableCell className="font-semibold text-slate-800">{v.productName}</TableCell>
                        <TableCell className="font-semibold">Rp {Number(v.price).toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          <span className={`font-bold text-xs ${v.stock <= 0 ? "text-red-600" : "text-slate-700"}`}>
                            {v.stock} units
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{v.weight ? `${v.weight}g` : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={v.isActive ? "success" : "destructive"}>
                            {v.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(v)} className="h-8 w-8 p-0 text-indigo-600 cursor-pointer">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDelete(v)} className="h-8 w-8 p-0 text-red-600 cursor-pointer">
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
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Product Variant">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Parent Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              required
            >
              <option value="">Select Parent Product</option>
              {productsList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Variant SKU *</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="e.g. HEADPHONE-RED-XL" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Price (Rp) *</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Stock *</label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Weight (g)</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Variant"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Variant SKU">
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Variant SKU *</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Price (Rp) *</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Stock *</label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Weight (g)</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
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
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Product Variant" closeOnOutsideClick={false}>
        {selectedVariant && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this product variant?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Variant SKU</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{selectedVariant.sku}</p>
              <span className="text-[10px] text-slate-400">Parent Product: {selectedVariant.productName}</span>
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
                onClick={() => deleteMutation.mutate(selectedVariant.id)}
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
