"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Banner } from "@/types";

interface HeroCarouselProps {
  banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (banners.length === 0) return null;

  return (
    <section
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden"
      aria-label="Promotional banners"
      role="region"
    >
      {/* Slides container */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`relative flex-shrink-0 w-full h-full ${banner.gradient}`}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                <div className="max-w-2xl space-y-5">
                  {banner.badge && (
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full border border-white/30">
                      {banner.badge}
                    </span>
                  )}

                  <h2
                    className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight ${banner.textColor}`}
                  >
                    {banner.title}
                  </h2>

                  <p
                    className={`text-base sm:text-lg md:text-xl leading-relaxed ${banner.textColor} opacity-90`}
                  >
                    {banner.subtitle}
                  </p>

                  <Link
                    href={banner.ctaLink}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-full hover:bg-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-100 text-sm md:text-base"
                  >
                    {banner.ctaText}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous button */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              index === currentSlide
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
