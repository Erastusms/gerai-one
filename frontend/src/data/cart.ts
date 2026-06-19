import type { CartItem } from "@/types";

export const initialCartItems: CartItem[] = [
  {
    productId: 1,
    productSlug: "ultrabook-pro-15",
    productName: 'UltraBook Pro 15" Laptop',
    productImage: "https://picsum.photos/seed/ultrabook-pro-15/600/600",
    price: 1299.99,
    originalPrice: 1599.99,
    quantity: 1,
  },
  {
    productId: 5,
    productSlug: "mirrorless-camera-z50",
    productName: "Mirrorless Camera Z50 II",
    productImage: "https://picsum.photos/seed/mirrorless-camera-z50/600/600",
    price: 1449.99,
    originalPrice: 1649.99,
    quantity: 1,
  },
  {
    productId: 12,
    productSlug: "cashmere-wool-scarf",
    productName: "Cashmere Blend Wool Scarf",
    productImage: "https://picsum.photos/seed/cashmere-wool-scarf/600/600",
    price: 59.99,
    originalPrice: 79.99,
    quantity: 2,
  },
];
