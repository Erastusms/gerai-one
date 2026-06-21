"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { mapBackendProductToProduct } from "@/lib/api/mappers";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Trash2, Heart, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useUI } from "@/components/providers/ui-provider";

function WishlistPageContent() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [productToRemove, setProductToRemove] = useState<string | null>(null);
  const { showToast } = useUI();

  // 1. Fetch Wishlist Items
  const {
    data: wishlistResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: isUserLoaded && isSignedIn,
  });

  const products = wishlistResponse?.data
    ? wishlistResponse.data.map(mapBackendProductToProduct)
    : [];

  const handleConfirmRemove = async () => {
    if (!productToRemove) return;
    try {
      await wishlistApi.removeFromWishlist(productToRemove);
      refetch();
      showToast("Product has been removed from your wishlist.");
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
    } finally {
      setProductToRemove(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-72 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-indigo-500 shadow-sm">
          <Heart className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to view your Wishlist
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Create an account or login to save your favorite items for later.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors font-bold shadow-indigo-600/10 active:scale-[0.98]"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You have {products.length} item{products.length !== 1 ? "s" : ""} saved in your wishlist.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
            <Heart className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Browse products and add them to your wishlist to save them for later.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors font-bold shadow-indigo-600/10 active:scale-[0.98]"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Product Image Link */}
              <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    -{product.discount}%
                  </span>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  {product.brand && (
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {product.brand}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                    <Link href={`/product/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                </div>

                <div className="space-y-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-amber-400">★</span>
                    <span className="text-xs font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-center text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => setProductToRemove(product.id.toString())}
                    className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {productToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Remove Product from Wishlist?
              </h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to remove this product from your wishlist?
              </p>
            </div>

            <div className="flex w-full flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToRemove(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-red-700 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <WishlistPageContent />
    </Suspense>
  );
}
