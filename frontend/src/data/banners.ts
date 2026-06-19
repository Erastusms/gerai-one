import type { Banner } from "@/types";

export const banners: Banner[] = [
  {
    id: 1,
    title: "Summer Collection 2026",
    subtitle:
      "Discover fresh styles and exclusive deals. Up to 40% off on selected items for a limited time.",
    ctaText: "Shop Now",
    ctaLink: "/category/fashion",
    gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
    textColor: "text-white",
    badge: "New Arrivals",
  },
  {
    id: 2,
    title: "Tech Essentials Sale",
    subtitle:
      "Upgrade your workspace with premium gadgets. Free shipping on all electronics orders over Rp 200.000.",
    ctaText: "Explore Deals",
    ctaLink: "/category/electronics",
    gradient: "bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900",
    textColor: "text-white",
    badge: "Up to 30% Off",
  },
  {
    id: 3,
    title: "Glow Up Your Routine",
    subtitle:
      "Premium skincare and beauty products curated for every skin type. Clean, organic, and effective.",
    ctaText: "Shop Beauty",
    ctaLink: "/category/beauty",
    gradient: "bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500",
    textColor: "text-white",
  },
  {
    id: 4,
    title: "Home & Living Refresh",
    subtitle:
      "Transform your space with minimalist décor, cozy textiles, and artisan home accessories.",
    ctaText: "Browse Collection",
    ctaLink: "/category/home-living",
    gradient: "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
    textColor: "text-white",
    badge: "Trending",
  },
];
