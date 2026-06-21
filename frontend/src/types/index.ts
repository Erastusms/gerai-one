// ── Product ──
export interface Product {
  id: string | number;
  sku: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  specifications: Record<string, string>;
  isFlashSale?: boolean;
  brand?: string;
  brandLogoUrl?: string;
  viewCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  variants?: any[];
  wishlistStatus?: boolean;
  weight?: number | null;
}

// ── Category ──
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  color: string;
}

// ── Banner ──
export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  textColor: string;
  badge?: string;
}

// ── Review ──
export interface Review {
  id: number;
  productId: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
}

// ── Customer Profile ──
export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  avatar: string;
  address: Address;
}

export interface Address {
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// ── Cart ──
export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

export * from "./pagination";
export * from "./category";
export * from "./product";
export * from "./api";
