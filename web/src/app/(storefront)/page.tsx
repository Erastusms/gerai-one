"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
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

// Stable Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL search parameters for Search view
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlCategorySlug = searchParams.get("categorySlug") || "";
  const categorySlug = urlCategory || urlCategorySlug;
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sort = searchParams.get("sort") || "newest";
  const limit = 12;

  const isSearchView = !!search;

  // Homepage dedicated catalog states
  const [activeTab, setActiveTab] = useState("for-you");
  const [homePage, setHomePage] = useState(1);

  // Filter cleared states for visual auto-preselection
  const [isCategoryCleared, setIsCategoryCleared] = useState(false);
  const [isBrandCleared, setIsBrandCleared] = useState(false);

  // Reset cleared states if search query changes
  useEffect(() => {
    setIsCategoryCleared(false);
    setIsBrandCleared(false);
  }, [search]);

  // Clerk User info
  const { user, isLoaded: isUserLoaded } = useUser();
  const userName = isUserLoaded && user?.firstName ? user.firstName : "You";
  const displayName = `For ${userName}`;

  // Local price input values (for search results view)
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") || "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") || "");

  // Sync inputs with URL
  useEffect(() => {
    setMinPriceInput(searchParams.get("minPrice") || "");
    setMaxPriceInput(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Fetch Categories for Tab list
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-filter"],
    queryFn: () => categoryApi.getCategories({ limit: 100 }),
  });

  // Fetch dynamic filter options based on search query
  const { data: filterOptionsResponse } = useQuery({
    queryKey: ["filter-options", search],
    queryFn: () => productApi.getFilterOptions(search || undefined),
    enabled: isSearchView,
  });

  const availableCategories = useMemo(() => {
    return filterOptionsResponse?.data?.categories || [];
  }, [filterOptionsResponse]);

  const availableBrands = useMemo(() => {
    return filterOptionsResponse?.data?.brands || [];
  }, [filterOptionsResponse]);

  // Determine active category and brand slugs (factoring in auto-preselection)
  const activeCategorySlug = useMemo(() => {
    if (categorySlug) return categorySlug;
    if (availableCategories.length === 1 && !isCategoryCleared) {
      return availableCategories[0].slug;
    }
    return undefined;
  }, [categorySlug, availableCategories, isCategoryCleared]);

  const activeBrandSlug = useMemo(() => {
    if (brand) return brand;
    if (availableBrands.length === 1 && !isBrandCleared) {
      return availableBrands[0].slug;
    }
    return undefined;
  }, [brand, availableBrands, isBrandCleared]);

  // Category Selection Logic for homepage tabs
  const topCategories = useMemo(() => {
    const categories = categoriesData?.data || [];
    return [...categories]
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
      .slice(0, 5);
  }, [categoriesData]);

  // Homepage tabs list
  const tabs = useMemo(() => {
    const list = [{ id: "for-you", name: displayName }];
    topCategories.forEach((cat) => {
      list.push({ id: cat.slug, name: cat.name });
    });
    return list;
  }, [displayName, topCategories]);

  // Reset tab selection
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setHomePage(1);
  };

  // Fetch Featured Products (Flash Sale) - only for homepage
  const {
    data: featuredData,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productApi.getProducts({ isFeatured: true }),
    enabled: !isSearchView,
  });

  // Fetch Search Results view products
  const {
    data: searchProductsData,
    isLoading: isSearchProductsLoading,
    error: searchProductsError,
    refetch: refetchSearchProducts,
  } = useQuery({
    queryKey: ["products-search", page, search, activeCategorySlug, activeBrandSlug, minPrice, maxPrice, sort],
    queryFn: () =>
      productApi.getProducts({
        page,
        limit,
        search: search || undefined,
        categorySlug: activeCategorySlug || undefined,
        brand: activeBrandSlug || undefined,
        minPrice,
        maxPrice,
        sort: sort as any,
      }),
    enabled: isSearchView,
  });

  // Fetch Homepage Dedicated Tab products
  const {
    data: homeProductsData,
    isLoading: isHomeProductsLoading,
    error: homeProductsError,
    refetch: refetchHomeProducts,
  } = useQuery({
    queryKey: ["homepage-products", activeTab, homePage],
    queryFn: () =>
      productApi.getProducts({
        page: homePage,
        limit,
        categorySlug: activeTab === "for-you" ? undefined : activeTab,
      }),
    enabled: !isSearchView,
  });

  // Reset all filters helper for Search view (preserving search term)
  const handleResetFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setIsCategoryCleared(true);
    setIsBrandCleared(true);
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Generic URL parameter update helper for Search view (preserving search term)
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // If key is categorySlug, and "category" is in the URL, update "category" as well/instead
    const actualKey = (key === "categorySlug" && params.has("category")) ? "category" : key;

    if (value) {
      params.set(actualKey, value);
      if (actualKey === "category") {
        params.delete("categorySlug");
      } else if (actualKey === "categorySlug") {
        params.delete("category");
      }
    } else {
      params.delete("category");
      params.delete("categorySlug");
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter update
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Click handlers for filters supporting auto-preselect toggling
  const handleCategoryClick = (slug: string) => {
    const isCurrentlyActive = categorySlug === slug || 
      (categorySlug === "" && availableCategories.length === 1 && availableCategories[0].slug === slug && !isCategoryCleared);
    
    if (isCurrentlyActive) {
      setIsCategoryCleared(true);
      updateUrlParam("categorySlug", "");
    } else {
      setIsCategoryCleared(false);
      const useCategoryParam = new URLSearchParams(searchParams.toString()).has("category");
      updateUrlParam(useCategoryParam ? "category" : "categorySlug", slug);
    }
  };

  const handleBrandClick = (slug: string) => {
    const isCurrentlyActive = brand === slug || 
      (brand === "" && availableBrands.length === 1 && availableBrands[0].slug === slug && !isBrandCleared);

    if (isCurrentlyActive) {
      setIsBrandCleared(true);
      updateUrlParam("brand", "");
    } else {
      setIsBrandCleared(false);
      updateUrlParam("brand", slug);
    }
  };

  // Page changing handler
  const handlePageChange = (newPage: number) => {
    if (isSearchView) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      setHomePage(newPage);
    }
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
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRetryAll = () => {
    if (isSearchView) {
      refetchSearchProducts();
    } else {
      refetchFeatured();
      refetchHomeProducts();
    }
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
          <div className="h-6 w-3/4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  // Map and shuffle products lists
  const featuredProducts = useMemo(() => {
    return featuredData?.data
      ? featuredData.data.map(mapBackendProductToProduct)
      : [];
  }, [featuredData]);

  const searchProducts = useMemo(() => {
    return searchProductsData?.data
      ? searchProductsData.data.map(mapBackendProductToProduct)
      : [];
  }, [searchProductsData]);

  const homeProducts = useMemo(() => {
    if (!homeProductsData?.data) return [];
    const mapped = homeProductsData.data.map(mapBackendProductToProduct);
    if (activeTab === "for-you") {
      return shuffleArray(mapped);
    }
    return mapped;
  }, [homeProductsData, activeTab]);

  const products = isSearchView ? searchProducts : homeProducts;
  const isLoading = isSearchView ? isSearchProductsLoading : isHomeProductsLoading;
  const productsError = isSearchView ? searchProductsError : homeProductsError;
  
  const meta = isSearchView ? searchProductsData?.meta : homeProductsData?.meta;
  const totalPages = meta?.totalPages || 1;
  const currentPageValue = isSearchView ? page : homePage;

  // popular static brand list for search filters
  const popularBrands = ["Apple", "Samsung", "Sony", "Bose", "Garmin", "HP", "Dyson", "Philips"];

  return (
    <div className="w-full pb-16">
      {/* Inline styles to hide scrollbars for cleaner UX */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Hero section: visible only on root path when not in search results */}
      {!isSearchView && pathname === "/" && (
        <HeroCarousel banners={banners} />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        {/* Flash Sale section - homepage only */}
        {!isSearchView && isFeaturedLoading && (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4 overflow-hidden py-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-72 w-64 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!isSearchView && featuredError && (
          <ReusableError
            title="Featured Products Error"
            message="Could not load flash sale featured products."
            onRetry={handleRetryAll}
          />
        )}

        {!isSearchView && !isFeaturedLoading && !featuredError && featuredProducts.length > 0 && (
          <FlashSale products={featuredProducts} />
        )}

        {/* Recommended Products Catalog Section */}
        <section id="catalog-section" className="space-y-6 pt-8 scroll-mt-20">
          
          {isSearchView ? (
            // Search result page header & Sorting
            <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Search Results
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Showing results for "{search}"
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
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("sort", e.target.value);
                    params.set("page", "1");
                    router.replace(`/?${params.toString()}`, { scroll: false });
                  }}
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
          ) : (
            // Dedicated Homepage catalog header
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Recommended For You
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse our real-time database catalog.
              </p>
            </div>
          )}

          {isSearchView ? (
            // 1. SEARCH LAYOUT (Sidebar Filters + Products Grid)
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
                      onClick={() => handleCategoryClick("")}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        (categorySlug === "" && (availableCategories.length !== 1 || isCategoryCleared))
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      All Categories
                    </button>
                    {availableCategories.map((cat) => {
                      const isSelected = categorySlug === cat.slug || 
                        (categorySlug === "" && availableCategories.length === 1 && availableCategories[0].slug === cat.slug && !isCategoryCleared);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center ${
                            isSelected
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
                      );
                    })}
                    {availableCategories.length === 0 && (
                      <p className="text-xs text-gray-400 px-2 py-1">No categories match</p>
                    )}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleBrandClick("")}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        (brand === "" && (availableBrands.length !== 1 || isBrandCleared))
                          ? "bg-indigo-50 text-indigo-600 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      All Brands
                    </button>
                    {availableBrands.map((b) => {
                      const isSelected = brand === b.slug || 
                        (brand === "" && availableBrands.length === 1 && availableBrands[0].slug === b.slug && !isBrandCleared);
                      return (
                        <button
                          key={b.id}
                          onClick={() => handleBrandClick(b.slug)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors flex justify-between items-center ${
                            isSelected
                              ? "bg-indigo-50 text-indigo-600 font-bold"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {b.productCount !== undefined && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                              {b.productCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {availableBrands.length === 0 && (
                      <p className="text-xs text-gray-400 px-2 py-1">No brands match</p>
                    )}
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

                {isLoading && renderProductSkeletons()}

                {!isLoading && !productsError && products.length === 0 && (
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

                {!isLoading && !productsError && products.length > 0 && (
                  <>
                    <ProductGrid products={products} />
                    <Pagination
                      currentPage={currentPageValue}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            // 2. HOMEPAGE DEDICATED CATALOG (Tabs Layout + Products Grid)
            <div className="space-y-8">
              {/* Category Tabs */}
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform active:scale-95 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Products Section */}
              <div className="w-full space-y-8">
                {productsError && (
                  <ReusableError
                    title="Catalog Request Failed"
                    message="Failed to retrieve products from the database."
                    onRetry={handleRetryAll}
                  />
                )}

                {isLoading && renderProductSkeletons()}

                {!isLoading && !productsError && products.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
                    <div className="text-3xl">🔍</div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-900">No products found</h3>
                      <p className="text-xs text-gray-500 max-w-xs">
                        No products are currently available in this category.
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading && !productsError && products.length > 0 && (
                  <>
                    <ProductGrid products={products} />
                    <Pagination
                      currentPage={currentPageValue}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          )}
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
