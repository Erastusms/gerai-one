"use client";

import { useState } from "react";
import { products } from "@/data/products";
import { banners } from "@/data/banners";
import HeroCarousel from "@/components/storefront/hero-carousel";
import FlashSale from "@/components/storefront/flash-sale";
import ProductGrid from "@/components/storefront/product-grid";
import Pagination from "@/components/storefront/pagination";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter flash sale products
  const flashSaleProducts = products.filter((product) => product.isFlashSale);

  // Paginate recommended products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="w-full pb-16">
      {/* Hero section - full width */}
      <HeroCarousel banners={banners} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        {/* Flash Sale section */}
        {flashSaleProducts.length > 0 && (
          <FlashSale products={flashSaleProducts} />
        )}

        {/* Recommended Products section */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Recommended For You
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Handpicked products tailored to your preferences.
            </p>
          </div>

          <ProductGrid products={paginatedProducts} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>
    </div>
  );
}
