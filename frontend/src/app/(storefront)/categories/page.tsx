"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category.api";
import { mapBackendCategoryToCategory } from "@/lib/api/mappers";
import CategoryCard from "@/components/storefront/category-card";
import ReusableError from "@/components/storefront/reusable-error";

export default function CategoriesPage() {
  // Fetch active categories
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryApi.getCategories({ limit: 100 }),
  });

  const categories = categoriesData?.data 
    ? categoriesData.data.map(mapBackendCategoryToCategory)
    : [];

  const renderCategorySkeletons = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-gray-200 bg-white p-6 text-center animate-pulse space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />
          <div className="mx-auto h-4 w-3/4 rounded bg-gray-200" />
          <div className="mx-auto h-3 w-1/2 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title section */}
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          All Categories
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse our wide range of products across different departments.
        </p>
      </div>

      {error && (
        <ReusableError
          title="Categories Unreachable"
          message="Could not load categories catalog list from the server."
          onRetry={() => refetch()}
        />
      )}

      {isLoading && renderCategorySkeletons()}

      {!isLoading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4 max-w-md mx-auto">
          <div className="text-3xl">📦</div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">No categories found</h3>
            <p className="text-xs text-gray-500">
              No categories have been added to the storefront database yet.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        /* Grid of category cards */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
