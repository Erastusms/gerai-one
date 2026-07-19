"use client"

import React, { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Badge } from "@gerai-one/shared-ui"
import { ArrowLeft, Edit2, ShoppingBag, Loader2, Image as ImageIcon } from "lucide-react"

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["admin-product-detail", resolvedParams.id],
    queryFn: () => adminApi.getProductById(resolvedParams.id),
  })

  const product = productRes?.data

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600">Product not found.</p>
        <Button onClick={() => router.push("/products")}>Back to Products</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-indigo-600" />
              {product.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">SKU: {product.sku}</p>
          </div>
          <Link href={`/products/${product.id}/edit`}>
            <Button className="gap-2 cursor-pointer">
              <Edit2 className="h-4 w-4" /> Edit Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Product Images */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.name} className="w-full h-64 object-cover rounded-xl border border-slate-100" />
          ) : (
            <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: any) => (
                <img key={img.id} src={img.imageUrl} alt="" className="h-16 w-full object-cover rounded-lg border border-slate-100" />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Product Attributes</h3>
              <Badge variant={product.isActive ? "success" : "destructive"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Base Price</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Discount Price</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {product.discountPrice ? `Rp ${Number(product.discountPrice).toLocaleString("id-ID")}` : "None"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Brand</span>
                <span className="text-slate-800 font-semibold">{product.brand?.name || "Unbranded"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Categories</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {product.categories?.map((c: any) => (
                    <Badge key={c.categoryId} variant="outline">
                      {c.category?.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {product.shortDescription && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">Short Summary</span>
                <p className="text-xs text-slate-700 pt-1">{product.shortDescription}</p>
              </div>
            )}
            {product.description && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">Full Description</span>
                <p className="text-xs text-slate-700 pt-1 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* SEO Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
              SEO Parameters
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block">SEO Title</span>
                <span className="text-slate-800 font-medium">{product.seo?.seoTitle || product.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">SEO Description</span>
                <span className="text-slate-800">{product.seo?.seoDescription || "Default summary used"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
