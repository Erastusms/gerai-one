"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input } from "@gerai-one/shared-ui"
import { Search, Save, Globe, Loader2 } from "lucide-react"

export default function SeoPage() {
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState("")

  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [slug, setSlug] = useState("")

  const { data: productsRes } = useQuery({
    queryKey: ["admin-products-seo-select"],
    queryFn: () => adminApi.getProducts({ limit: 100 }),
  })

  const productsList = productsRes?.data?.products || []

  const { isLoading: isSeoLoading } = useQuery({
    queryKey: ["admin-product-seo", selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const res = await adminApi.getProductSeo(selectedProductId)
      if (res.data) {
        setSeoTitle(res.data.seoTitle || "")
        setSeoDescription(res.data.seoDescription || "")
        setSeoKeywords(res.data.seoKeywords || "")
        setSlug(res.data.slug || "")
      }
      return res
    },
    enabled: !!selectedProductId,
  })

  const updateSeoMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateProductSeo(selectedProductId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-seo", selectedProductId] })
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) return
    updateSeoMutation.mutate({ seoTitle, seoDescription, seoKeywords, slug })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Search className="h-6 w-6 text-indigo-600" /> Product SEO & Search Snippets
        </h1>
        <p className="text-sm text-slate-500">
          Optimize search engine indexing metadata and preview Google search snippets in real time.
        </p>
      </div>

      {/* Select Product */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Product to Optimize *</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs cursor-pointer"
        >
          <option value="">Choose a product from catalog...</option>
          {productsList.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Live SERP Snippet Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Globe className="h-4 w-4 text-emerald-500" /> Live Google Search Result Preview
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">https://geraione.com</span>
                <span className="text-slate-400">› product › {slug || "url-slug"}</span>
              </div>
              <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                {seoTitle || "Product Title - GeraiOne Storefront"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {seoDescription || "Provide an engaging search engine description to attract buyers from search engines..."}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
              SEO Parameters
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">URL Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SEO Meta Title</label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Title tag for search engines..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SEO Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-indigo-500"
                placeholder="Meta description for search engine snippet..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SEO Keywords (Comma Separated)</label>
              <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="ecommerce, headphones, wireless" />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={updateSeoMutation.isPending} className="gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                {updateSeoMutation.isPending ? "Saving..." : "Save SEO Metadata"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
