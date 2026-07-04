"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cartApi } from "@/lib/api/cart.api";
import { useUI } from "@/components/providers/ui-provider";
import ReusableError from "@/components/storefront/reusable-error";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuantitySelector from "@/components/storefront/quantity-selector";

export default function CartPage() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const { showCartToast, showCartLimitOpen } = useUI() as any;

  // Track which item is currently loading a quantity update
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Fetch Cart Query
  const {
    data: cartResponse,
    isLoading: isCartLoading,
    error: cartError,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    enabled: isUserLoaded && isSignedIn,
  });

  const cartData = cartResponse?.data;
  const items = cartData?.items || [];
  const summary = cartData?.summary;

  // Mutations
  const updateQuantityMutation = useMutation({
    mutationFn: (data: { itemId: string; quantity: number }) => {
      setUpdatingItemId(data.itemId);
      return cartApi.updateQuantity(data.itemId, data.quantity);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update quantity";
      showCartToast(msg, "error");
    },
    onSettled: () => {
      setUpdatingItemId(null);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
      showCartToast("Item removed from cart", "success");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to remove item";
      showCartToast(msg, "error");
    },
  });

  const removeAllMutation = useMutation({
    mutationFn: () => cartApi.removeAllItems(),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
      showCartToast("Cart cleared successfully", "success");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to clear cart";
      showCartToast(msg, "error");
    },
  });

  const removeSelectedMutation = useMutation({
    mutationFn: () => cartApi.removeSelected(),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
      showCartToast("Selected items removed", "success");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to remove selected items";
      showCartToast(msg, "error");
    },
  });

  const selectItemMutation = useMutation({
    mutationFn: (data: { itemId: string; isSelected: boolean }) =>
      cartApi.selectItem(data.itemId, data.isSelected),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update selection";
      showCartToast(msg, "error");
    },
  });

  const selectAllMutation = useMutation({
    mutationFn: (isSelected: boolean) => cartApi.selectAll(isSelected),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update all selection";
      showCartToast(msg, "error");
    },
  });

  // Action Handlers
  const handleQuantityChange = (itemId: string, currentQty: number, newQty: number, stock: number) => {
    if (newQty < 1) return Promise.resolve();
    if (newQty > stock) {
      showCartToast(`Only ${stock} items available in stock.`, "error");
      return Promise.resolve();
    }
    return updateQuantityMutation.mutateAsync({ itemId, quantity: newQty });
  };

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    selectItemMutation.mutate({ itemId, isSelected });
  };

  const handleSelectAll = (checked: boolean) => {
    selectAllMutation.mutate(checked);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to remove this item from your cart?")) {
      removeItemMutation.mutate(itemId);
    }
  };

  const handleDeleteSelected = () => {
    if (confirm("Are you sure you want to remove all selected items?")) {
      removeSelectedMutation.mutate();
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      removeAllMutation.mutate();
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

  // ── RENDER STATES ──

  // Not signed in state
  if (isUserLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100 shadow-sm animate-pulse">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to view your cart</h1>
            <p className="text-sm text-gray-500">
              Your shopping cart is saved to your account. Sign in now to retrieve your items and proceed to checkout.
            </p>
          </div>
          <Link
            href="/sign-in"
            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            Sign In to Your Account
          </Link>
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Loading state (skeleton)
  if (!isUserLoaded || isCartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-md" />
          <div className="h-4 w-32 bg-gray-200 rounded-md" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-12 w-full bg-gray-200 rounded-xl" />
            <div className="space-y-4 rounded-2xl border border-gray-200 p-6 bg-white">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
                  <div className="h-20 w-20 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 bg-gray-200 rounded-md" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded-md" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded-md" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (cartError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ReusableError
          title="Failed to Load Cart"
          message={cartError instanceof Error ? cartError.message : "An error occurred while loading your shopping cart."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto animate-in fade-in duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300 border border-gray-100 shadow-sm">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your shopping cart is empty.</h1>
            <p className="text-sm text-gray-500">
              Browse our products and find something you love. Added items will show up here.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-indigo-600/10 transition-colors font-bold active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const activeItems = items.filter((item) => !item.productVariant?.isOutOfStock);
  const allActiveSelected = activeItems.length > 0 && activeItems.every((item) => item.isSelected);
  const selectedItemsCount = activeItems.filter((item) => item.isSelected).length;

  const sortedItems = [...items].sort((a, b) => {
    const aOutOfStock = a.productVariant?.isOutOfStock;
    const bOutOfStock = b.productVariant?.isOutOfStock;
    if (!aOutOfStock && bOutOfStock) return -1;
    if (aOutOfStock && !bOutOfStock) return 1;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* TITLE SECTION */}
        <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
            <p className="mt-2 text-sm text-gray-500">
              You have {items.length} item{items.length > 1 ? "s" : ""} in your shopping cart.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">
          {/* LEFT COLUMN: Items List & Toolbar */}
          <div className="lg:col-span-2 space-y-4">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 shadow-sm text-sm">
              <label className="flex items-center gap-3 cursor-pointer select-none font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={allActiveSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
                <span>Select All ({activeItems.length})</span>
              </label>

              <div className="flex items-center gap-4">
                {selectedItemsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={removeSelectedMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={removeAllMutation.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* CART ITEMS BOX */}
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {sortedItems.map((item) => {
                const variant = item.productVariant;
                const product = variant.product;
                const brand = product.brand;

                const basePrice = Number(variant.price);
                const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
                const effectivePrice = discountPrice !== null ? discountPrice : basePrice;

                const isOutOfStock = !!variant.isOutOfStock;

                // Format attribute values (e.g. "Color: Black · Size: M")
                const attributeString = variant.attributeValues
                  ?.map((av: any) => `${av.attributeValue.attribute.name}: ${av.attributeValue.value}`)
                  .join(" · ");

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row gap-6 py-6 first:pt-0 last:pb-0 transition-all ${
                      isOutOfStock ? "opacity-60 bg-gray-50/80 -mx-6 px-6 py-4 rounded-xl border border-dashed border-gray-200 mt-2 first:mt-0" : ""
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex items-center self-start sm:self-center shrink-0">
                      <input
                        type="checkbox"
                        disabled={isOutOfStock}
                        checked={item.isSelected}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <Image
                        src={product.thumbnailUrl || "https://picsum.photos/seed/placeholder/600/600"}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between gap-4 sm:gap-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-base"
                          >
                            {product.name}
                          </Link>
                          {brand && <p className="text-xs text-gray-500 font-medium mt-0.5">{brand.name}</p>}
                          {attributeString && <p className="mt-1 text-xs text-gray-400 font-normal">{attributeString}</p>}

                          {isOutOfStock && (
                            <div className="mt-1.5 space-y-1">
                              <div>
                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-2xs font-bold text-red-700 border border-red-100 animate-pulse">
                                  Out of Stock
                                </span>
                              </div>
                              <span className="text-2xs text-gray-500 font-medium block">
                                This item cannot be purchased because it is out of stock.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Prices */}
                        <div className="sm:text-right shrink-0">
                          {discountPrice !== null ? (
                            <div className="space-y-0.5">
                              <div className="text-base font-bold text-gray-900">{formatPrice(discountPrice)}</div>
                              <div className="text-xs text-gray-400 line-through font-medium">{formatPrice(basePrice)}</div>
                            </div>
                          ) : (
                            <div className="text-base font-bold text-gray-900">{formatPrice(basePrice)}</div>
                          )}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="mt-2 flex items-center justify-between gap-4">
                        {/* Quantity Selector */}
                        <QuantitySelector
                          initialQuantity={item.quantity}
                          disabled={isOutOfStock}
                          onChange={(newQty) => handleQuantityChange(item.id, item.quantity, newQty, variant.availableStock || 0)}
                        />

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          {summary && (
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="space-y-4">
                  {/* Selected count */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Selected Products</span>
                    <span className="font-medium text-gray-700">
                      {summary.selectedItemCount} item{summary.selectedItemCount > 1 ? "s" : ""} ({summary.selectedQuantity} qty)
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(summary.subtotal)}</span>
                  </div>

                  {/* Savings */}
                  {summary.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-medium">Discount Savings</span>
                      <span className="font-semibold text-emerald-600">-{formatPrice(summary.discount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* Grand Total */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(summary.grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    disabled={summary.selectedItemCount === 0}
                    onClick={() => alert("Checkout integration coming soon!")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 hover:shadow-indigo-600/10 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/"
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm active:scale-[0.98]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
