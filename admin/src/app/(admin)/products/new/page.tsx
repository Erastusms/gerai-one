"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin.api"
import { Button, Input } from "@gerai-one/shared-ui"
import { ArrowLeft, Save, ShoppingBag, Plus, Trash2 } from "lucide-react"

export default function AddProductPage() {
  const router = useRouter()

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
  const [stock, setStock] = useState("10")
  const [weight, setWeight] = useState("500")

  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryInput, setNewGalleryInput] = useState("")

  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [isActive, setIsActive] = useState(true)

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

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    )
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProductMutation.mutate({
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
      weight: Number(weight),
      thumbnailUrl: thumbnailUrl || null,
      imageUrls: galleryUrls,
      seoTitle,
      seoDescription,
      seoKeywords,
      isActive,
    })
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
            Add New Product
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure catalog information, pricing, media, and SEO attributes.</p>
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
              <label className="text-xs font-semibold text-slate-700">Product Name *</label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Wireless Noise-Canceling Headphones" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">URL Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="wireless-noise-canceling-headphones" />
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
                <option value="">Select Brand (Optional)</option>
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
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief product summary..." />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-indigo-500"
              placeholder="Detailed product specifications..."
            />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            Pricing & Inventory
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Base Price (Rp) *</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="1500000" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Discount Price (Rp)</label>
              <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="1250000" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SKU Code *</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="PROD-HEADPHONE-001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Available Stock *</label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required placeholder="25" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Weight (grams)</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="450" />
            </div>
          </div>
        </div>

        {/* Section 3: Media */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            Media Assets
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Thumbnail Image URL</label>
            <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Gallery Image URLs</label>
            <div className="flex gap-2">
              <Input value={newGalleryInput} onChange={(e) => setNewGalleryInput(e.target.value)} placeholder="Add gallery image URL..." />
              <Button type="button" onClick={addGalleryImage} variant="outline" className="cursor-pointer">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs">
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 pb-3">
            SEO & Visibility Status
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">SEO Meta Title</label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Best Wireless Headphones 2026 | GeraiOne" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">SEO Meta Description</label>
            <Input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Buy high-performance noise canceling headphones online..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">SEO Keywords</label>
            <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="headphones, wireless, bluetooth" />
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
            {createProductMutation.isPending ? "Saving..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
