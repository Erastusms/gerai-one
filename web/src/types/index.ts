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
  availableStock?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
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
  clerkUserId: string;
  email: string;
  fullName: string | null;
  username: string | null;
  phoneNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  profilePhoto: string | null;
  isProfileCompleted: boolean;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // Home, Office, Apartment, Other
  recipientName: string;
  recipientPhone: string;
  province: string;
  city: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  fullAddress: string;
  notes: string | null;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Cart ──
export interface CartItemVariantProduct {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  discountPrice: string | number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
}

export interface CartItemVariant {
  id: string;
  sku: string;
  price: string | number;
  stock: number;
  weight: number | null;
  isActive: boolean;
  attributeValues: { attributeValue: { id: string; value: string; attribute: { id: string; name: string } } }[];
  product: CartItemVariantProduct;
  availableStock?: number;
  isOutOfStock?: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
  productVariant: CartItemVariant;
}

export interface CartSummary {
  selectedItemCount: number;
  selectedQuantity: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
}


export * from "./pagination";
export * from "./category";
export * from "./product";
export * from "./api";
