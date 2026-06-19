"use client";

import Link from "next/link";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 text-center hover:border-indigo-200 hover:shadow-md hover:scale-[1.03] transition-all duration-200"
      aria-label={`View products in ${category.name}`}
    >
      <div className="text-4xl mb-3 select-none" role="img" aria-label={category.name}>
        {category.icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-gray-500 mt-1">
        {category.productCount} products
      </p>
    </Link>
  );
}
