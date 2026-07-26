"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { productApi } from "@/lib/api/product.api";
import { reviewApi } from "@/lib/api/review.api";
import { wishlistApi } from "@/lib/api/wishlist.api";
import { cartApi } from "@/lib/api/cart.api";
import { mapBackendProductToProduct } from "@/lib/api/mappers";
import ProductCard from "@/components/storefront/product-card";
import ReusableError from "@/components/storefront/reusable-error";
import { useUser } from "@clerk/nextjs";
import { useUI } from "@/components/providers/ui-provider";
import QuantitySelector from "@/components/storefront/quantity-selector";
import {
  ArrowLeft,
  Check,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  Heart,
  Star,
  ThumbsUp,
  MessageSquare,
  Loader2
} from "lucide-react";

function ProductDetailPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  const productSlug = typeof slug === "string" ? slug : "";
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { showWishlistSuccessModal, showToast, showCartLimitDialog, showCartToast } = useUI() as any;
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Variant selector states
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Review form states
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);

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

  // 2. Fetch Product Reviews from Backend
  const {
    data: reviewsResponse,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["product-reviews", rawProduct?.id],
    queryFn: () => reviewApi.getProductReviews(rawProduct!.id, { limit: 50 }),
    enabled: !!rawProduct?.id,
  });

  const productReviews = reviewsResponse?.data || [];

  // Extract category IDs to fetch related products
  const category = rawProduct?.categories && rawProduct.categories.length > 0
    ? rawProduct.categories[0]
    : undefined;
  const categoryId = category?.id;

  // 3. Fetch Related Products by Category ID
  const { data: relatedProductsResponse, isLoading: isRelatedLoading } = useQuery({
    queryKey: ["related-products", categoryId],
    queryFn: () => productApi.getProducts({ categoryId }),
    enabled: !!categoryId,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { productVariantId: string; quantity: number }) =>
      cartApi.addToCart(data.productVariantId, data.quantity),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
      setAddedToCartSuccess(true);
      setTimeout(() => setAddedToCartSuccess(false), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add to cart";
      if (message.includes("maximum limit")) {
        showCartLimitDialog();
      } else {
        showCartToast(message, "error");
      }
    },
  });

  const relatedProducts = relatedProductsResponse?.data
    ? relatedProductsResponse.data
        .filter((p) => p.slug !== productSlug) // Exclude current product
        .slice(0, 4) // Max 4 products
        .map(mapBackendProductToProduct)
    : [];

  // Gather unique attributes and values from product variants
  const availableAttributes: { name: string; values: string[] }[] = [];
  product?.variants?.forEach((v: any) => {
    v.attributeValues?.forEach((av: any) => {
      const name = av.attributeValue.attribute.name;
      const val = av.attributeValue.value;
      const existing = availableAttributes.find((a) => a.name === name);
      if (existing) {
        if (!existing.values.includes(val)) {
          existing.values.push(val);
        }
      } else {
        availableAttributes.push({ name, values: [val] });
      }
    });
  });

  const selectedVariant = product?.variants?.find((v: any) => {
    return v.attributeValues?.every((av: any) => {
      const name = av.attributeValue.attribute.name;
      const val = av.attributeValue.value;
      return selectedAttributes[name] === val;
    });
  });

  // Dynamic fields based on variants
  const getVariantPricing = () => {
    if (!product) {
      return { displayPrice: 0, displayOriginalPrice: 0, displayDiscount: 0 };
    }

    if (!selectedVariant || selectedVariant.price === undefined || selectedVariant.price === null) {
      return {
        displayPrice: product.price,
        displayOriginalPrice: product.originalPrice,
        displayDiscount: product.discount,
      };
    }

    const variantRawPrice = Number(selectedVariant.price);
    if (isNaN(variantRawPrice) || variantRawPrice <= 0) {
      return {
        displayPrice: product.price,
        displayOriginalPrice: product.originalPrice,
        displayDiscount: product.discount,
      };
    }

    const hasDiscount = product.originalPrice > product.price && product.discount > 0;

    if (hasDiscount && product.originalPrice > 0) {
      const discountRatio = product.price / product.originalPrice;
      const calculatedPrice = Math.round(variantRawPrice * discountRatio);
      return {
        displayPrice: calculatedPrice,
        displayOriginalPrice: variantRawPrice,
        displayDiscount: product.discount,
      };
    }

    return {
      displayPrice: variantRawPrice,
      displayOriginalPrice: variantRawPrice,
      displayDiscount: 0,
    };
  };

  const { displayPrice, displayOriginalPrice, displayDiscount } = getVariantPricing();
  const displayStock = selectedVariant ? selectedVariant.availableStock : (product ? product.availableStock : 0);
  const displayIsLowStock = selectedVariant ? selectedVariant.isLowStock : false;
  const displayIsOutOfStock = selectedVariant ? selectedVariant.isOutOfStock : (product ? product.isOutOfStock : false);
  const displaySku = selectedVariant ? selectedVariant.sku : (product ? product.sku : "");
  const displayWeight = selectedVariant ? selectedVariant.weight : (product ? product.weight : null);

  // Sync wishlist status & init variants when product details load
  useEffect(() => {
    if (product) {
      setIsWishlisted(!!product.wishlistStatus);
      setSelectedImage(product.image);
      setQuantity(1);
      setAddedToCartSuccess(false);

      // Initialize selected attributes using first active variant
      if (product?.variants && product.variants.length > 0) {
        const firstVariant = product.variants.find((v: any) => v.isActive && v.availableStock > 0) || product.variants[0];
        const initial: Record<string, string> = {};
        firstVariant.attributeValues?.forEach((av: any) => {
          initial[av.attributeValue.attribute.name] = av.attributeValue.value;
        });
        setSelectedAttributes(initial);
      }
    }
  }, [productSlug, rawProduct]);

  const handleSelectAttribute = (attrName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  const handleWishlistToggle = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!product) return;

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
      console.error("Failed to toggle wishlist status:", err);
      const message = err.response?.data?.message || err.message || "Failed to update wishlist. Please try again.";
      alert(`Wishlist Error: ${message}`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !rawProduct) return;
    setReviewSubmitError(null);

    try {
      await reviewApi.createReview({
        productId: rawProduct.id,
        rating: formRating,
        comment: formComment.trim() || null,
      });
      setReviewSubmitSuccess(true);
      setFormComment("");
      refetchReviews();
      refetch(); // Reload details to re-aggregate rating scores
      setTimeout(() => setReviewSubmitSuccess(false), 3000);
    } catch (err: any) {
      setReviewSubmitError(
        err.response?.data?.message || "Failed to submit review. You can only review once."
      );
    }
  };

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

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayPrice);

  const formattedOriginalPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayOriginalPrice);

  const handleIncrement = () => {
    // Ignore stock limit for now
    if (quantity < displayStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };



  const handleAddToCart = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!selectedVariant) {
      showCartToast("Please select attributes first", "error");
      return;
    }
    addToCartMutation.mutate({ productVariantId: selectedVariant.id, quantity });
  };

  const handleBuyNow = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!selectedVariant) {
      showCartToast("Please select attributes first", "error");
      return;
    }
    cartApi.addToCart(selectedVariant.id, quantity)
      .then((response) => {
        queryClient.setQueryData(["cart"], response);
        router.push("/cart");
      })
      .catch((error: any) => {
        const message = error.response?.data?.message || "Failed to add to cart";
        if (message.includes("maximum limit")) {
          showCartLimitDialog();
        } else {
          showCartToast(message, "error");
        }
      });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4.5 w-4.5 ${i <= fullStars ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
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
              <div className="flex items-center justify-between">
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

                {/* Wishlist Heart Toggle */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full border shadow-sm transition-all duration-200 hover:scale-105 ${
                    isWishlisted
                      ? "bg-red-50 text-red-500 border-red-200"
                      : "bg-white text-gray-400 hover:text-red-500 border-gray-200"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                {product.brand && (
                  <p className="font-semibold uppercase tracking-wider">
                    Brand: <span className="text-gray-700">{product.brand}</span>
                  </p>
                )}
                {product.brand && <span>•</span>}
                <p>SKU: <span className="text-gray-700 font-mono">{displaySku}</span></p>
                {displayWeight && <span>•</span>}
                {displayWeight && <p>Weight: <span className="text-gray-700">{displayWeight} kg</span></p>}
                <span>•</span>
                <p>Views: <span className="text-gray-700">{rawProduct?.viewCount || 0}</span></p>
              </div>
            </div>

            {/* Rating and Reviews Summary */}
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
                {product.reviewCount} reviews
              </button>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
                {displayDiscount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through font-medium">
                      {formattedOriginalPrice}
                    </span>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                      -{displayDiscount}% OFF
                    </span>
                  </>
                )}
              </div>
              <div>
                {displayStock > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({displayStock} items)
                    </span>
                    {displayIsLowStock && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        Low Stock
                      </span>
                    )}
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

            {/* Product Attributes (Variant Selector) */}
            {availableAttributes.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Options</h3>
                <div className="space-y-3">
                  {availableAttributes.map((attr) => (
                    <div key={attr.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 w-20">{attr.name}:</span>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const isSelected = selectedAttributes[attr.name] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelectAttribute(attr.name, val)}
                              className={`rounded-lg px-3 py-1 text-xs font-bold border transition-colors ${
                                isSelected
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                  : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {/* Quantity Selector */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-gray-900 block">Quantity</span>
              <QuantitySelector
                initialQuantity={quantity}
                onChange={(newQty) => setQuantity(newQty)}
                disabled={displayStock === 0}
              />
            </div>

            {quantity > displayStock && displayStock > 0 && (
              <p className="text-sm font-semibold text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                Requested quantity exceeds the available stock.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {displayStock === 0 || quantity > displayStock ? (
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.99] transition-all cursor-pointer animate-in fade-in duration-200"
                >
                  <Heart className="h-4.5 w-4.5" fill={isWishlisted ? "currentColor" : "none"} />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  >
                    {addToCartMutation.isPending ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4.5 w-4.5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-white px-6 py-3.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50/50 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <CreditCard className="h-4.5 w-4.5" />
                    Buy Now
                  </button>
                </>
              )}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                {productReviews.length > 0 ? (
                  productReviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                            <Image
                              src={review.user?.imageUrl || "/placeholder.png"}
                              alt={review.user?.fullName || "Reviewer"}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{review.user?.fullName || "Store Customer"}</h4>
                            <span className="text-[10px] text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-400 pt-1">
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            Verified Purchase ✅
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Helpful ({review.helpfulCount})
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">No reviews for this product yet.</p>
                  </div>
                )}
              </div>

              {/* Add Review Panel */}
              <div className="lg:col-span-1 border border-gray-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-900">Write a Review</h3>
                </div>

                {!isSignedIn ? (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      You must be signed in to submit reviews for this product.
                    </p>
                    <Link
                      href="/sign-in"
                      className="inline-block w-full text-center rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewSubmitSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs font-semibold">
                        Review submitted successfully!
                      </div>
                    )}
                    {reviewSubmitError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs font-semibold">
                        {reviewSubmitError}
                      </div>
                    )}

                    {/* Star Rating Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">Rating:</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            className="p-0.5 transition-transform active:scale-95"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= formRating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-1.5">
                      <label htmlFor="review-comment" className="text-xs font-semibold text-gray-700">
                        Comment (optional):
                      </label>
                      <textarea
                        id="review-comment"
                        rows={4}
                        placeholder="Write your product experience here..."
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-indigo-600 py-2 text-center text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
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

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    }>
      <ProductDetailPageContent />
    </Suspense>
  );
}
