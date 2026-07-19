"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { categoryApi } from "@/lib/api/category.api";
import { productApi } from "@/lib/api/product.api";
import { mapBackendProductToProduct } from "@/lib/api/mappers";
import ProductGrid from "@/components/storefront/product-grid";
import Pagination from "@/components/storefront/pagination";
import ReusableError from "@/components/storefront/reusable-error";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, RotateCcw } from "lucide-react";

function CategoryDetailPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = typeof slug === "string" ? slug : "";

  // Parse URL query parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const limit = 12;

  // Local search input
  const [searchInput, setSearchInput] = useState(search);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // 1. Fetch Category details
  const {
    data: categoryResponse,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: () => categoryApi.getCategoryBySlug(categorySlug),
    enabled: !!categorySlug,
  });

  // 2. Fetch Paginated Products inside this category (with search and sorting)
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    error: productsError,
    refetch,
  } = useQuery({
    queryKey: ["category-products", categorySlug, page, search, sort],
    queryFn: () =>
      productApi.getProducts({
        categorySlug,
        page,
        limit,
        search: search || undefined,
        sort: sort as any,
      }),
    enabled: !!categorySlug,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`/categories/${categorySlug}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.replace(`/categories/${categorySlug}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`/categories/${categorySlug}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    router.replace(`/categories/${categorySlug}`, { scroll: false });
  };

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

  const category = categoryResponse?.data?.category;
  const products = productsResponse?.data
    ? productsResponse.data.map(mapBackendProductToProduct)
    : [];
  const meta = productsResponse?.meta;
  const totalPages = meta?.totalPages || 1;

  if (categoryError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ReusableError
          title="Category Not Found"
          message={`Unable to retrieve category details for "${categorySlug}".`}
          onRetry={() => router.push("/categories")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back button and Header details */}
      <div className="space-y-4">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all categories
        </Link>

        {isCategoryLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-200 rounded" />
          </div>
        ) : (
          category && (
            <div className="border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          )
        )}
      </div>

      {/* Toolbar: Search and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/50 shadow-sm">
        {/* Search within Category */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search in this category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Go
          </button>
        </form>

        {/* Sort select */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <label htmlFor="category-sort" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sort By
          </label>
          <select
            id="category-sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none shadow-sm"
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

      {/* Main product listing section */}
      <div className="space-y-8">
        {productsError && (
          <ReusableError
            title="Products Load Failure"
            message="Failed to retrieve products for this category from the server."
            onRetry={() => refetch()}
          />
        )}

        {isProductsLoading && renderProductSkeletons()}

        {!isProductsLoading && !productsError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4 max-w-md mx-auto">
            <div className="text-3xl">🔍</div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">No products found</h3>
              <p className="text-xs text-gray-500">
                {search
                  ? `We couldn't find anything matching "${search}" in this category.`
                  : "No active products are available in this category yet."}
              </p>
            </div>
            {search && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Clear Search Query
              </button>
            )}
          </div>
        )}

        {!isProductsLoading && !productsError && products.length > 0 && (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function CategoryDetailPage() {
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
      <CategoryDetailPageContent />
    </Suspense>
  );
}
