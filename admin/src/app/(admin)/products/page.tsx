"use client"

import React, { useState } from "react"
import Link from "next/link"
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
  Eye,
  Edit2,
  Trash2,
  RefreshCcw,
  ShoppingBag,
  ArrowUpDown,
  AlertOctagon,
  Image as ImageIcon,
} from "lucide-react"

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Soft Delete Modal
  const [deleteProduct, setDeleteProduct] = useState<any>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    data: productsRes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-products", page, search, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      adminApi.getProducts({
        page,
        limit,
        search,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      setIsDeleteOpen(false)
      setDeleteProduct(null)
    },
  })

  const products = productsRes?.data?.products || []
  const meta = productsRes?.data?.meta

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const confirmDelete = (prod: any) => {
    setDeleteProduct(prod)
    setIsDeleteOpen(true)
  }

  const handleDeleteSubmit = () => {
    if (deleteProduct) {
      deleteMutation.mutate(deleteProduct.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, search, edit, and manage storefront product items and stock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/products/new">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search product name or SKU..."
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
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed">
            Bulk Activate
          </Button>
          <Button variant="outline" size="sm" className="text-xs opacity-60 cursor-not-allowed text-red-600">
            Bulk Soft Delete
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-3">
          <AlertOctagon className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : "Failed to load products."}
          </p>
        </div>
      )}

      {/* Table Container */}
      {!isError && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 font-medium">Loading catalog products...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Image</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                        <span className="flex items-center gap-1">Product Name <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-center">Categories</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort("price")}>
                        <span className="flex items-center gap-1">Base Price <ArrowUpDown className="h-3 w-3" /></span>
                      </TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                          No products found matching criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.thumbnailUrl ? (
                              <img
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            {product.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>
                          <TableCell>{product.brand || <span className="text-slate-400 italic">None</span>}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{product.categoryCount} Categories</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold text-xs ${product.stock <= 0 ? "text-red-600" : product.stock <= 10 ? "text-amber-600" : "text-slate-700 dark:text-slate-300"}`}>
                              {product.stock} units
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "success" : "destructive"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/products/${product.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 cursor-pointer" title="View Product">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/products/${product.id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 cursor-pointer" title="Edit Product">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => confirmDelete(product)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 cursor-pointer"
                                title="Soft Delete Product"
                              >
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
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Product" closeOnOutsideClick={false}>
        {deleteProduct && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this product?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Product Name</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{deleteProduct.name}</p>
              <span className="text-[10px] text-slate-400 font-mono">SKU: {deleteProduct.sku}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              This action will hide the product from the storefront catalog. It can be restored later.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSubmit}
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
