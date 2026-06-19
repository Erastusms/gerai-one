"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/storefront/product-card";

interface FlashSaleProps {
  products: Product[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: "08",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // Set target time to 8 hours from now
    const targetTime = new Date().getTime() + 8 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Flash Sale</h2>
          <span className="text-2xl" role="img" aria-label="fire">🔥</span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2" aria-label="Time remaining">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mr-1">Ends In:</span>
          <div className="flex items-center gap-1.5 font-mono text-lg font-bold">
            <span className="bg-gray-900 text-white rounded-lg px-3 py-1.5 shadow-sm">{timeLeft.hours}</span>
            <span className="text-gray-900">:</span>
            <span className="bg-gray-900 text-white rounded-lg px-3 py-1.5 shadow-sm">{timeLeft.minutes}</span>
            <span className="text-gray-900">:</span>
            <span className="bg-gray-900 text-white rounded-lg px-3 py-1.5 shadow-sm">{timeLeft.seconds}</span>
          </div>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {products.map((product) => (
            <div key={product.id} className="w-[280px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
