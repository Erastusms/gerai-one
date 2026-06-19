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

export interface BackendProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  brand: string | null;
  price: string | number;
  discountPrice: string | number | null;
  weight: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  categories: BackendCategory[];
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
