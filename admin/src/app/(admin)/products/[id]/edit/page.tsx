"use client"

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input } from "@gerai-one/shared-ui"
import { ArrowLeft, Save, ShoppingBag, Loader2, Layers, Plus, Trash2 } from "lucide-react"

interface VariantFormItem {
  id?: string
  sku: string
  price: string
  discountPrice: string
  stock: string
  weight: string
}

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

  // General Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [sku, setSku] = useState("")
  const [brandId, setBrandId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Variants State
  const [variants, setVariants] = useState<VariantFormItem[]>([])

  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setSlug(product.slug || "")
      setSku(product.sku || "")
      setBrandId(product.brandId || "")
      setSelectedCategoryIds(product.categories?.map((c: any) => c.categoryId) || [])
      setShortDescription(product.shortDescription || "")
      setDescription(product.description || "")
      setThumbnailUrl(product.thumbnailUrl || "")
      setIsActive(product.isActive ?? true)

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku || "",
            price: v.price ? String(v.price) : "",
            discountPrice: v.discountPrice ? String(v.discountPrice) : "",
            stock: v.inventory ? String(v.inventory.availableStock) : "0",
            weight: v.weight ? String(v.weight) : "",
          }))
        )
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

  // Variant Handlers
  const handleAddVariant = () => {
    const nextIdx = variants.length + 1
    const baseSku = sku || "PROD-ITEM"
    setVariants([
      ...variants,
      {
        sku: `${baseSku}-VAR${nextIdx}`,
        price: "",
        discountPrice: "",
        stock: "10",
        weight: "500",
      },
    ])
  }

  const handleUpdateVariant = (index: number, field: keyof VariantFormItem, val: string) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: val }
    setVariants(updated)
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedVariants = variants.map((v) => ({
      id: v.id,
      sku: v.sku.trim(),
      price: Number(v.price || 0),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
      stock: Number(v.stock || 0),
      weight: v.weight ? Number(v.weight) : null,
    }))

    updateProductMutation.mutate({
      name,
      slug,
      sku,
      brandId: brandId || null,
      categoryIds: selectedCategoryIds,
      shortDescription,
      description,
      thumbnailUrl: thumbnailUrl || null,
      isActive,
      variants: formattedVariants.length > 0 ? formattedVariants : undefined,
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
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            Edit Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">Update product parameters, catalog visibility, and variants.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            General Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">URL Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Main SKU Code *</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                <option value="">Select Brand</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categories</label>
            <div className="flex flex-wrap gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2 max-h-32 overflow-y-auto">
              {categories.map((cat: any) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-md cursor-pointer font-medium transition-colors ${
                    selectedCategoryIds.includes(cat.id)
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Short Description</label>
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Product Variants Management Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" /> Product Variants
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage size, color, or model variations with specific pricing, discounts, and inventory stock.
              </p>
            </div>
            <Button type="button" onClick={handleAddVariant} variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">No variants added for this product.</p>
              <p className="text-[11px] text-slate-500">
                Click <span className="font-semibold text-indigo-600">"+ Add Variant"</span> to specify prices, discounts, and stock.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={idx} className="p-4 border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      Variant #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Variant SKU *</label>
                      <Input
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                        required
                        placeholder="SKU-VAR-1"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Price (Rp) *</label>
                      <Input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                        required
                        placeholder="150000"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Discount Price (Rp)</label>
                      <Input
                        type="number"
                        value={v.discountPrice}
                        onChange={(e) => handleUpdateVariant(idx, "discountPrice", e.target.value)}
                        placeholder="120000"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Stock Qty *</label>
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(idx, "stock", e.target.value)}
                        required
                        placeholder="10"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Weight (grams)</label>
                      <Input
                        type="number"
                        value={v.weight}
                        onChange={(e) => handleUpdateVariant(idx, "weight", e.target.value)}
                        placeholder="500"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media & Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Media & Visibility
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thumbnail Image URL</label>
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
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
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
            {updateProductMutation.isPending ? "Updating..." : "Save Product & Variants"}
          </Button>
        </div>
      </form>
    </div>
  )
}
