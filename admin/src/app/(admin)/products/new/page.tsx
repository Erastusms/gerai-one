"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input } from "@gerai-one/shared-ui"
import { ArrowLeft, Save, ShoppingBag, Plus, Trash2, Layers } from "lucide-react"

interface VariantFormItem {
  id?: string
  sku: string
  price: string
  discountPrice: string
  stock: string
  weight: string
}

export default function AddProductPage() {
  const router = useRouter()

  // General Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [sku, setSku] = useState("")
  const [brandId, setBrandId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")

  // Media
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryInput, setNewGalleryInput] = useState("")

  // SEO & Visibility
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Optional Product Variants State
  const [variants, setVariants] = useState<VariantFormItem[]>([])

  // Fetch Brands & Categories for select inputs
  const { data: brandsRes } = useQuery({ queryKey: ["admin-brands-select"], queryFn: () => adminApi.getBrands({ limit: 100 }) })
  const { data: categoriesRes } = useQuery({ queryKey: ["admin-categories-select"], queryFn: () => adminApi.getCategories({ limit: 100 }) })

  const brands = brandsRes?.data?.brands || []
  const categories = categoriesRes?.data?.categories || []

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: (data: any) => adminApi.createProduct(data),
    onSuccess: () => {
      router.push("/products")
    },
  })

  // Auto-generate slug and base SKU from name
  const handleNameChange = (val: string) => {
    setName(val)
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
    setSlug(generatedSlug)

    if (!sku) {
      const generatedSku = `PROD-${val.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
      setSku(generatedSku)
    }
  }

  const addGalleryImage = () => {
    if (newGalleryInput.trim()) {
      setGalleryUrls([...galleryUrls, newGalleryInput.trim()])
      setNewGalleryInput("")
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, idx) => idx !== index))
  }

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId))
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId])
    }
  }

  // Variant handlers
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

    // Format variants payload
    const formattedVariants = variants.map((v) => ({
      sku: v.sku.trim(),
      price: Number(v.price || 0),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
      stock: Number(v.stock || 0),
      weight: v.weight ? Number(v.weight) : null,
    }))

    createProductMutation.mutate({
      name,
      slug,
      sku,
      brandId: brandId || null,
      categoryIds: selectedCategoryIds,
      shortDescription,
      description,
      thumbnailUrl: thumbnailUrl || null,
      imageUrls: galleryUrls,
      seoTitle,
      seoDescription,
      seoKeywords,
      isActive,
      variants: formattedVariants.length > 0 ? formattedVariants : undefined,
    })
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
            Add New Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure catalog information, optional variants, media, and SEO attributes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            General Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Name *</label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Wireless Noise-Canceling Headphones" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">URL Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="wireless-noise-canceling-headphones" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Main SKU Code *</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="PROD-HEADPHONE-001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                <option value="">Select Brand (Optional)</option>
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
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief product summary..." />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-3 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              placeholder="Detailed product specifications..."
            />
          </div>
        </div>

        {/* Section 2: Optional Variants Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" /> Product Variants (Optional)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add size, color, or model variations with specific pricing, discounts, and inventory stock.
              </p>
            </div>
            <Button type="button" onClick={handleAddVariant} variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">No variants added yet for this product.</p>
              <p className="text-[11px] text-slate-500">
                Click <span className="font-semibold text-indigo-600">"+ Add Variant"</span> to specify prices, discounts, and stock for product options.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={idx} className="p-4 border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl space-y-3 relative">
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

        {/* Section 3: Media */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Media Assets
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thumbnail Image URL</label>
            <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gallery Image URLs</label>
            <div className="flex gap-2">
              <Input value={newGalleryInput} onChange={(e) => setNewGalleryInput(e.target.value)} placeholder="Add gallery image URL..." />
              <Button type="button" onClick={addGalleryImage} variant="outline" className="cursor-pointer">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs">
                    <span className="truncate max-w-xs">{url}</span>
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: SEO & Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            SEO & Visibility Status
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Title</label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Best Product Title 2026 | GeraiOne" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Description</label>
            <Input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Buy high-performance items online..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Keywords</label>
            <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="electronics, gadgets, online shop" />
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
              Publish Product to Storefront Immediately
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createProductMutation.isPending} className="gap-2 cursor-pointer">
            <Save className="h-4 w-4" />
            {createProductMutation.isPending ? "Saving..." : "Create Product & Variants"}
          </Button>
        </div>
      </form>
    </div>
  )
}
