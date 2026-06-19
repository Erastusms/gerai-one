"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { initialCartItems } from "@/data/cart";

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.originalPrice * item.quantity,
    0
  );

  const grandTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const discount = subtotal - grandTotal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {cartItems.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Your cart is currently empty.
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Before you can checkout, you must add some products to your shopping cart.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* CART HAS ITEMS */
        <div className="space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              You have {totalItemsCount} item{totalItemsCount > 1 ? "s" : ""} in your cart.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">
            {/* LEFT COLUMN: Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row gap-6 py-6 first:pt-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.productSlug}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-base"
                          >
                            {item.productName}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            Unit Price: {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Price Subtotal (Large screen) */}
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector & Remove Button */}
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-lg border border-gray-200 p-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-4.5 w-4.5"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0M4.5 5.036V21"
                            />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Savings */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-medium">Discount Savings</span>
                      <span className="font-semibold text-emerald-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* Total */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Proceed To Checkout
                  </button>
                  <Link
                    href="/"
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
