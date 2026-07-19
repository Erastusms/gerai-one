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
  Pagination,
  Button,
  Dialog,
} from "@gerai-one/shared-ui"
import {
  MessageSquare,
  Star,
  EyeOff,
  Eye,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react"

export default function ReviewsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { data: reviewsRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-reviews-list", page],
    queryFn: () => adminApi.getReviews({ page, limit }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-list"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-list"] })
      setIsDeleteOpen(false)
    },
  })

  const toggleHide = (review: any) => {
    updateMutation.mutate({ id: review.id, data: { isHidden: !review.isHidden } })
  }

  const reviews = reviewsRes?.data?.reviews || []
  const meta = reviewsRes?.data?.meta

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" /> Review Moderation
          </h1>
          <p className="text-sm text-slate-500">Moderate customer ratings, comments, and visibility controls.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-2 cursor-pointer">
          <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                        No reviews recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((rev: any) => (
                      <TableRow key={rev.id}>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                          {rev.product?.name || "Product"}
                        </TableCell>
                        <TableCell>{rev.user?.fullName || rev.user?.email || "Customer"}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-amber-400" : "text-slate-200"}`} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-xs truncate">{rev.comment || "—"}</TableCell>
                        <TableCell>
                          {rev.isVerifiedPurchase ? (
                            <Badge variant="success" className="gap-1 text-[10px]">
                              <CheckCircle className="h-3 w-3" /> Verified
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Standard</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rev.isHidden ? "destructive" : "outline"}>
                            {rev.isHidden ? "Hidden" : "Visible"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleHide(rev)}
                              className={`h-8 w-8 p-0 cursor-pointer ${rev.isHidden ? "text-emerald-600" : "text-amber-600"}`}
                              title={rev.isHidden ? "Unhide Review" : "Hide Review"}
                            >
                              {rev.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setSelectedReview(rev); setIsDeleteOpen(true); }}
                              className="h-8 w-8 p-0 text-red-600 cursor-pointer"
                              title="Delete Review"
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

      {/* Delete Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Soft Delete Review" closeOnOutsideClick={false}>
        {selectedReview && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to soft delete this customer review?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Product</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedReview.product?.name || "Product"}</p>
              <span className="text-[10px] text-slate-400">Customer: {selectedReview.user?.fullName || selectedReview.user?.email}</span>
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
                onClick={() => deleteMutation.mutate(selectedReview.id)}
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
