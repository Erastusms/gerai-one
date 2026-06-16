"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import ProductCard from "@/components/storefront/product-card";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="mt-2 text-gray-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Initialize selected image if not set
  const mainImage = selectedImage || product.image;

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Filter related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400 text-lg">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-200 text-lg">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Product Details Section */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* LEFT SIDE: Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Thumbnail gallery */}
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square overflow-hidden rounded-xl border bg-gray-50 transition-all ${
                  mainImage === img
                    ? "border-indigo-600 ring-2 ring-indigo-500/20 scale-[0.98]"
                    : "border-gray-200 hover:border-indigo-400"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} gallery image ${idx + 1}`}
                  fill
                  sizes="10vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                {product.category}
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">{renderStars(product.rating)}</div>
              <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  document.getElementById("tabs-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                {productReviews.length || product.reviewCount} reviews
              </button>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-medium">
                      {formattedOriginalPrice}
                    </span>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                      -{product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <div>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({product.stock} items left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-base leading-relaxed text-gray-600">{product.description}</p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-900">Quantity</span>
                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={product.stock === 0}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                type="button"
                disabled={product.stock === 0}
                className="flex w-full items-center justify-center rounded-xl border-2 border-indigo-600 bg-white px-6 py-3.5 text-base font-bold text-indigo-600 hover:bg-indigo-50/50 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Specifications & Reviews Section */}
      <div id="tabs-section" className="mt-16 border-t border-gray-100 pt-10">
        <div className="flex gap-8 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-base font-semibold transition-colors relative ${
              activeTab === "specs"
                ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-indigo-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-base font-semibold transition-colors relative ${
              activeTab === "reviews"
                ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-indigo-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Reviews ({productReviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === "specs" && (
            <div className="max-w-2xl overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-100 bg-white">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">{key}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 max-w-3xl">
              {productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={review.avatar}
                            alt={review.author}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{review.title}</h5>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 font-medium">No reviews for this product yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-gray-100 pt-12 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
