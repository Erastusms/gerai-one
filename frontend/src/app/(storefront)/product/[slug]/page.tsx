"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { productApi } from "@/lib/api/product.api";
import { mapBackendProductToProduct } from "@/lib/api/mappers";
import ProductCard from "@/components/storefront/product-card";
import ReusableError from "@/components/storefront/reusable-error";
import { reviews as mockReviews } from "@/data/reviews";
import { CartItem } from "@/types";
import { ArrowLeft, Check, ShoppingBag, CreditCard, ChevronRight } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const productSlug = typeof slug === "string" ? slug : "";

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  // 1. Fetch Product Detail from Backend
  const {
    data: productResponse,
    isLoading: isProductLoading,
    error: productError,
    refetch,
  } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: () => productApi.getProductBySlug(productSlug),
    enabled: !!productSlug,
  });

  const rawProduct = productResponse?.data;
  const product = rawProduct ? mapBackendProductToProduct(rawProduct) : null;

  // Extract category IDs to fetch related products
  const category = rawProduct?.categories && rawProduct.categories.length > 0
    ? rawProduct.categories[0]
    : undefined;

  const categoryId = category?.id;

  // 2. Fetch Related Products by Category ID
  const { data: relatedProductsResponse, isLoading: isRelatedLoading } = useQuery({
    queryKey: ["related-products", categoryId],
    queryFn: () => productApi.getProducts({ categoryId }),
    enabled: !!categoryId,
  });

  const relatedProducts = relatedProductsResponse?.data
    ? relatedProductsResponse.data
        .filter((p) => p.slug !== productSlug) // Exclude current product
        .slice(0, 4) // Max 4 products
        .map(mapBackendProductToProduct)
    : [];

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);
      setAddedToCartSuccess(false);
    }
  }, [productSlug, rawProduct]);

  // Handle image swap
  const mainImage = selectedImage || (product ? product.image : "");

  if (isProductLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-12 w-1/3 bg-gray-200 rounded" />
            <div className="h-24 w-full bg-gray-200 rounded" />
            <div className="h-12 w-full bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ReusableError
          title="Product Not Found"
          message="The product you are looking for does not exist or an error occurred while loading it."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter mock reviews for this product
  // Since mockReviews use numerical IDs, we can match on index or fallback
  const productReviews = mockReviews.slice(0, 3); // Pull some mock reviews

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

  const handleAddToCart = () => {
    const cartItemsStr = localStorage.getItem("cart_items");
    const cartItems: CartItem[] = cartItemsStr ? JSON.parse(cartItemsStr) : [];

    const existingIndex = cartItems.findIndex((item) => item.productId === product.id.toString());
    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += quantity;
    } else {
      cartItems.push({
        productId: product.id.toString(),
        productSlug: product.slug,
        productName: product.name,
        productImage: mainImage,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: quantity,
      });
    }

    localStorage.setItem("cart_items", JSON.stringify(cartItems));
    setAddedToCartSuccess(true);

    // Hide success alert after 3 seconds
    setTimeout(() => {
      setAddedToCartSuccess(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= fullStars ? "text-amber-400" : "text-gray-200"}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Success Banner */}
      {addedToCartSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Check className="h-5 w-5 text-emerald-600" />
            <span>Successfully added {quantity} item{quantity > 1 ? "s" : ""} to your cart!</span>
          </div>
          <Link
            href="/cart"
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}

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
          {product.images && product.images.length > 0 && (
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
          )}
        </div>

        {/* RIGHT SIDE: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {rawProduct?.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="inline-block rounded-full bg-indigo-50 hover:bg-indigo-100 px-3 py-1 text-[10px] font-bold text-indigo-600 tracking-wide uppercase transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Brand: <span className="text-gray-700">{product.brand}</span>
                </p>
              )}
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-3 border-y border-gray-100 py-3">
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
                {productReviews.length} reviews
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
            {product.description && (
              <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
            )}
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
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-white px-6 py-3.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50/50 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              >
                <CreditCard className="h-4.5 w-4.5" />
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
            className={`pb-3 text-sm font-bold transition-colors relative ${
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
            className={`pb-3 text-sm font-bold transition-colors relative ${
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
                  {Object.entries(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                        <td className="px-6 py-3.5 text-xs font-bold text-gray-950 w-1/3">{key}</td>
                        <td className="px-6 py-3.5 text-xs text-gray-600">{val}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4 text-xs text-gray-500 text-center" colSpan={2}>
                        No technical specifications are available for this product.
                      </td>
                    </tr>
                  )}
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
                          <h4 className="text-xs font-bold text-gray-900">{review.author}</h4>
                          <span className="text-[10px] text-gray-400">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-950">{review.title}</h5>
                      <p className="mt-1 text-xs text-gray-600 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">No reviews for this product yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      <div className="mt-20 border-t border-gray-100 pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Related Products</h2>
          {categoryId && (
            <Link
              href={category ? `/categories/${category.slug}` : "/"}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>See More</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {isRelatedLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No related products found in this category.</p>
        )}
      </div>
    </div>
  );
}
