"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { productApi } from "@/lib/api/product.api";
import { categoryApi } from "@/lib/api/category.api";
import { mapBackendProductToProduct } from "@/lib/api/mappers";
import HeroCarousel from "@/components/storefront/hero-carousel";
import FlashSale from "@/components/storefront/flash-sale";
import ProductGrid from "@/components/storefront/product-grid";
import Pagination from "@/components/storefront/pagination";
import ReusableError from "@/components/storefront/reusable-error";
import { banners } from "@/data/banners";
import { Filter, SlidersHorizontal, RotateCcw, Search } from "lucide-react";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL search parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const categorySlug = searchParams.get("categorySlug") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sort = searchParams.get("sort") || "newest";
  const limit = 12;

  // Local price input values
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") || "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") || "");

  // Sync inputs with URL
  useEffect(() => {
    setMinPriceInput(searchParams.get("minPrice") || "");
    setMaxPriceInput(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Fetch Featured Products (Flash Sale)
  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productApi.getProducts({ isFeatured: true }),
  });

  // Fetch Recommended / Paginated Products
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", page, search, categorySlug, brand, minPrice, maxPrice, sort],
    queryFn: () =>
      productApi.getProducts({
        page,
        limit,
        search: search || undefined,
        categorySlug: categorySlug || undefined,
        brand: brand || undefined,
        minPrice,
        maxPrice,
        sort: sort as any,
      }),
  });

  // Fetch Categories for Filter Panel
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-filter"],
    queryFn: () => categoryApi.getCategories({ limit: 100 }),
  });

  // Reset all filters helper
  const handleResetFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/", { scroll: false });
  };

  // Generic URL parameter update helper
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // If updating category, clear text search and price parameters to avoid 0 results
    if (key === "categorySlug") {
      params.delete("search");
      params.delete("minPrice");
      params.delete("maxPrice");
      setMinPriceInput("");
      setMaxPriceInput("");
    } else if (key === "brand") {
      // If updating brand, clear text search to avoid 0 results
      params.delete("search");
    }

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter update
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`/?${params.toString()}`, { scroll: false });
    // Scroll smoothly to catalog header
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPriceInput.trim()) {
      params.set("minPrice", minPriceInput);
    } else {
      params.delete("minPrice");
    }

    if (maxPriceInput.trim()) {
      params.set("maxPrice", maxPriceInput);
    } else {
      params.delete("maxPrice");
    }

    params.set("page", "1");
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleRetryAll = () => {
    refetchFeatured();
    refetchProducts();
  };

  // Render product skeletons
  const renderProductSkeletons = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 animate-pulse">
          <div className="aspect-square w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-6 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-6 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  // Map data to storefront legacy structure
  const featuredProducts = featuredData?.data
    ? featuredData.data.map(mapBackendProductToProduct)
    : [];

  const recommendedProducts = productsData?.data
    ? productsData.data.map(mapBackendProductToProduct)
    : [];

  const meta = productsData?.meta;
  const totalPages = meta?.totalPages || 1;

  // popular static brand list for filters
  const popularBrands = ["Apple", "Samsung", "Sony", "Bose", "Garmin", "HP", "Dyson", "Philips"];

  return (
    <div className="w-full pb-16">
      {/* Hero section */}
      <HeroCarousel banners={banners} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        {/* Flash Sale section */}
        {isFeaturedLoading && (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4 overflow-hidden py-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-72 w-64 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {featuredError && (
          <ReusableError
            title="Featured Products Error"
            message="Could not load flash sale featured products."
            onRetry={handleRetryAll}
          />
        )}

        {!isFeaturedLoading && !featuredError && featuredProducts.length > 0 && (
          <FlashSale products={featuredProducts} />
        )}

        {/* Recommended Products Catalog Section */}
        <section id="catalog-section" className="space-y-6 pt-8 scroll-mt-20">
          <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Catalog & Recommendations
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse our real-time database catalog.
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-dropdown" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sort By
              </label>
              <select
                id="sort-dropdown"
                value={sort}
                onChange={(e) => updateUrlParam("sort", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none shadow-sm"
              >
                <option value="newest">Newest Arrival</option>
                <option value="oldest">Oldest Arrival</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name: A-Z</option>
                <option value="nameDesc">Name: Z-A</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* LEFT COLUMN: Filters Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-6 border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  Filters
                </span>
                {(categorySlug || brand || minPrice || maxPrice || search) && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Search active indicator */}
              {search && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex items-start gap-2">
                  <Search className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Searching for:</p>
                    <p className="text-xs text-indigo-700 line-clamp-1">"{search}"</p>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateUrlParam("categorySlug", "")}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      categorySlug === ""
                        ? "bg-indigo-50 text-indigo-600 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All Categories
                  </button>
                  {categoriesData?.data?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateUrlParam("categorySlug", cat.slug)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center ${
                        categorySlug === cat.slug
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                          {cat.productCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => updateUrlParam("brand", "")}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      brand === ""
                        ? "bg-indigo-50 text-indigo-600 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    All Brands
                  </button>
                  {popularBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => updateUrlParam("brand", b)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        brand === b
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (IDR)</h3>
                <form onSubmit={handleApplyPriceFilter} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 py-1.5 text-center text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    Apply Filter
                  </button>
                </form>
              </div>
            </aside>

            {/* RIGHT COLUMN: Product Catalog Grid */}
            <div className="flex-1 w-full space-y-8">
              {productsError && (
                <ReusableError
                  title="Catalog Request Failed"
                  message="Failed to retrieve products from the database."
                  onRetry={handleRetryAll}
                />
              )}

              {isProductsLoading && renderProductSkeletons()}

              {!isProductsLoading && !productsError && recommendedProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
                  <div className="text-3xl">🔍</div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">No products found</h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Try resetting your search query or adjusting your category and price range filters.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {!isProductsLoading && !productsError && recommendedProducts.length > 0 && (
                <>
                  <ProductGrid products={recommendedProducts} />
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center animate-pulse">
        <div className="h-96 w-full rounded-2xl bg-gray-200 mb-8" />
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
