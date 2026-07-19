"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { Heart } from "lucide-react";
import { useUI } from "@/components/providers/ui-provider";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isWishlisted, setIsWishlisted] = useState(!!product.wishlistStatus);
  const { showWishlistSuccessModal, showToast } = useUI();

  useEffect(() => {
    setIsWishlisted(!!product.wishlistStatus);
  }, [product.wishlistStatus]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product.id.toString());
        setIsWishlisted(false);
        showToast("Product has been removed from your wishlist.");
      } else {
        await wishlistApi.addToWishlist(product.id.toString());
        setIsWishlisted(true);
        showWishlistSuccessModal();
      }
    } catch (err: any) {
      console.error("Error toggling wishlist status:", err);
      const message = err.response?.data?.message || err.message || "Failed to update wishlist. Please try again.";
      alert(`Wishlist Error: ${message}`);
    }
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.originalPrice);

  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating - fullStars >= 0.5;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative"
      aria-label={`View ${product.name}`}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-xl">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 z-10">
            -{product.discount}%
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-1.5 rounded-full border border-gray-100/30 backdrop-blur shadow-sm transition-all duration-200 hover:scale-110 z-20 ${
            isWishlisted
              ? "bg-red-50 text-red-500 border-red-100"
              : "bg-white/70 text-gray-400 hover:text-red-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Category */}
        <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center" aria-label={`Rating: ${product.rating} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i < fullStars
                    ? "text-amber-400"
                    : i === fullStars && hasHalfStar
                      ? "text-amber-400"
                      : "text-gray-300"
                }`}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
