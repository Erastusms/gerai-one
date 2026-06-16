import { categories } from "@/data/categories";
import CategoryCard from "@/components/storefront/category-card";

export const metadata = {
  title: "All Categories — GeraiOne",
  description: "Browse products by department and category. Find electronics, fashion, home decor, beauty, and more on GeraiOne.",
};

export default function CategoriesPage() {
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

      {/* Grid of category cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
