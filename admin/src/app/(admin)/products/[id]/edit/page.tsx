"use client"

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input } from "@gerai-one/shared-ui"
import { ArrowLeft, Save, ShoppingBag, Loader2 } from "lucide-react"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: productRes, isLoading } = useQuery({
    queryKey: ["admin-product-detail", resolvedParams.id],
    queryFn: () => adminApi.getProductById(resolvedParams.id),
  })

  const { data: brandsRes } = useQuery({ queryKey: ["admin-brands-select"], queryFn: () => adminApi.getBrands({ limit: 100 }) })
  const { data: categoriesRes } = useQuery({ queryKey: ["admin-categories-select"], queryFn: () => adminApi.getCategories({ limit: 100 }) })

  const product = productRes?.data
  const brands = brandsRes?.data?.brands || []
  const categories = categoriesRes?.data?.categories || []

  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [sku, setSku] = useState("")
  const [brandId, setBrandId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")

  const [price, setPrice] = useState("")
  const [discountPrice, setDiscountPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [weight, setWeight] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setSlug(product.slug || "")
      setSku(product.sku || "")
      setBrandId(product.brandId || "")
      setSelectedCategoryIds(product.categories?.map((c: any) => c.categoryId) || [])
      setShortDescription(product.shortDescription || "")
      setDescription(product.description || "")
      setPrice(product.price ? String(product.price) : "")
      setDiscountPrice(product.discountPrice ? String(product.discountPrice) : "")
      setWeight(product.weight ? String(product.weight) : "")
      setThumbnailUrl(product.thumbnailUrl || "")
      setIsActive(product.isActive ?? true)

      const defaultVariant = product.variants?.[0]
      if (defaultVariant?.inventory) {
        setStock(String(defaultVariant.inventory.availableStock || 0))
      }
    }
  }, [product])

  const updateProductMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateProduct(resolvedParams.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-detail", resolvedParams.id] })
      router.push("/products")
    },
  })

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId))
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProductMutation.mutate({
      name,
      slug,
      sku,
      brandId: brandId || null,
      categoryIds: selectedCategoryIds,
      shortDescription,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      weight: weight ? Number(weight) : null,
      thumbnailUrl: thumbnailUrl || null,
      isActive,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="space-y-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            Edit Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">Update product parameters and catalog visibility.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            General Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Product Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">URL Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs cursor-pointer"
              >
                <option value="">Select Brand</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Categories</label>
              <div className="flex flex-wrap gap-2 border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                {categories.map((cat: any) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${
                      selectedCategoryIds.includes(cat.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Short Description</label>
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            Pricing & Inventory
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Base Price (Rp) *</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Discount Price (Rp)</label>
              <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SKU Code *</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Stock Quantity *</label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Weight (grams)</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Media & Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            Media & Visibility
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Thumbnail Image URL</label>
            <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Product Published / Active
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProductMutation.isPending} className="gap-2 cursor-pointer">
            <Save className="h-4 w-4" />
            {updateProductMutation.isPending ? "Updating..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
