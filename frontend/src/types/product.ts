import { BackendCategory } from "./category";

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface Attribute {
  id: string;
  name: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  attribute: Attribute;
}

export interface VariantAttributeValue {
  attributeValue: AttributeValue;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: string | number;
  stock: number;
  availableStock?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
  weight: number | null;
  isActive: boolean;
  attributeValues: VariantAttributeValue[];
}

export interface ProductSeo {
  id: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
}

export interface BackendProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  brandId: string | null;
  price: string | number;
  discountPrice: string | number | null;
  weight: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  categories: BackendCategory[];
  brand?: Brand | null;
  variants?: ProductVariant[];
  seo?: ProductSeo | null;
  averageRating?: number;
  totalReviews?: number;
  wishlistStatus?: boolean;
  availableStock?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
}

export interface ProductSearchQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isFeatured?: boolean;
  sort?: "newest" | "oldest" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";
}
