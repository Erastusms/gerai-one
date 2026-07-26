import { Product, Category, BackendProduct, BackendCategory } from "@/types";

/**
 * Maps a BackendProduct to the legacy frontend Product structure.
 * This guarantees no regressions in components (e.g. ProductCard, Cart, checkout)
 * that rely on fields like image, originalPrice, discount percentage, etc.
 */
export function mapBackendProductToProduct(p: BackendProduct): Product {
  let rawPrice = Number(p.price);
  let rawDiscountPrice = p.discountPrice !== null ? Number(p.discountPrice) : null;

  // Use the lowest active variant price for list view
  if (p.variants && p.variants.length > 0) {
    const activeVariants = p.variants.filter((v: any) => v.isActive !== false);
    const targetVariants = activeVariants.length > 0 ? activeVariants : p.variants;
    const variantPrices = targetVariants
      .map((v: any) => Number(v.price))
      .filter((pr: number) => !isNaN(pr) && pr > 0);

    if (variantPrices.length > 0) {
      const minVariantPrice = Math.min(...variantPrices);
      if (rawDiscountPrice !== null && rawPrice > 0) {
        const discountRatio = rawDiscountPrice / rawPrice;
        rawDiscountPrice = Math.round(minVariantPrice * discountRatio);
      }
      rawPrice = minVariantPrice;
    }
  }

  const price = rawDiscountPrice !== null ? rawDiscountPrice : rawPrice;
  const originalPrice = rawPrice;
  
  // Calculate discount percentage
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Use the first category name as string or default to "General"
  const categoryName = p.categories && p.categories.length > 0
    ? p.categories[0].name
    : "General";

  // Select main image (thumbnailUrl or first item in images)
  const image = p.thumbnailUrl || (p.images && p.images.length > 0 ? p.images[0].imageUrl : "/placeholder.png");
  
  // Array of gallery image URLs
  const images = p.images && p.images.length > 0
    ? p.images.map((img) => img.imageUrl)
    : [image];

  // Convert specs key-value array into a Record<string, string>
  const specifications: Record<string, string> = {};
  if (p.specifications) {
    p.specifications.forEach((spec) => {
      specifications[spec.key] = spec.value;
    });
  }

  const mappedVariants = p.variants?.map((v) => ({
    ...v,
    stock: v.availableStock !== undefined ? v.availableStock : (v as any).stock,
  })) || [];

  // Sum up variant stock if variants exist
  const stock = mappedVariants.length > 0
    ? mappedVariants.reduce((acc, curr) => acc + (curr.availableStock ?? 0), 0)
    : (p.isActive ? 99 : 0);

  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    category: categoryName,
    image,
    images,
    price,
    originalPrice,
    discount,
    rating: p.averageRating !== undefined ? p.averageRating : 4.5,
    reviewCount: p.totalReviews !== undefined ? p.totalReviews : 0,
    stock,
    description: p.description || p.shortDescription || "",
    specifications,
    isFlashSale: p.isFeatured,
    brand: p.brand?.name || undefined,
    brandLogoUrl: p.brand?.logoUrl || undefined,
    viewCount: p.viewCount,
    seoTitle: p.seo?.seoTitle || undefined,
    seoDescription: p.seo?.seoDescription || undefined,
    seoKeywords: p.seo?.seoKeywords || undefined,
    variants: mappedVariants,
    wishlistStatus: p.wishlistStatus ?? false,
    availableStock: p.availableStock !== undefined ? p.availableStock : stock,
    isOutOfStock: p.isOutOfStock,
    isLowStock: p.isLowStock,
  };
}

/**
 * Maps a BackendCategory to the legacy frontend Category structure.
 * Assigns predefined visual emoji icons and styling colors based on slug identifiers.
 */
export function mapBackendCategoryToCategory(c: BackendCategory): Category {
  let icon = "📦";
  const iconMap: Record<string, string> = {
    "electronics": "🔌",
    "smartphones": "📱",
    "laptops-computers": "💻",
    "audio-headphones": "🎧",
    "wearable-tech": "⌚",
    "home-appliances": "🧹",
    "smart-home": "🏠",
    "mens-fashion": "👔",
    "womens-fashion": "👗",
    "footwear": "👟",
    "accessories": "👜",
    "fitness-outdoors": "🚴",
    "kitchen-dining": "🍳",
    "home-decor-furniture": "🖼️",
    "beauty-personal-care": "🧴",
    "office-supplies": "📂",
    "books-stationery": "📚",
    "board-games-toys": "🎲",
    "health-wellness": "💊",
    "travel-gear": "🧳"
  };

  if (c.slug && iconMap[c.slug]) {
    icon = iconMap[c.slug];
  }

  // Predefined color classes for categories
  const colorMap: Record<string, string> = {
    "electronics": "bg-blue-50 text-blue-600 border-blue-100",
    "smartphones": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "laptops-computers": "bg-purple-50 text-purple-600 border-purple-100",
    "audio-headphones": "bg-pink-50 text-pink-600 border-pink-100",
    "wearable-tech": "bg-cyan-50 text-cyan-600 border-cyan-100",
    "default": "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  const color = colorMap[c.slug] || colorMap.default;

  return {
    id: c.id as any, // Cast UUID string to satisfy type matching
    name: c.name,
    slug: c.slug,
    icon,
    productCount: c.productCount || 0,
    color,
  };
}
