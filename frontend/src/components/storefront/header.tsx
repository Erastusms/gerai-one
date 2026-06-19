"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface HeaderProps {
  cartCount?: number;
}

function SearchBarInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  // Synchronize local state with url search param updates
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentParam = searchParams.get("search") || "";
      if (searchValue === currentParam) return;

      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) {
        params.set("search", searchValue);
        params.set("page", "1"); // Reset to page 1 on new search
      } else {
        params.delete("search");
      }

      if (pathname !== "/") {
        router.push(`/?${params.toString()}`);
      } else {
        router.replace(`/?${params.toString()}`, { scroll: false });
      }
    }, 500); // 500ms debounce!

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-lg">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4.5 w-4.5 text-gray-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-full border border-gray-200 bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 transition-colors duration-200 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-label="Search products"
      />
    </div>
  );
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const handleMobileSearchClick = () => {
    // Navigate to homepage and focus search
    router.push("/?focusSearch=true");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT: Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="GeraiOne Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-white"
              aria-hidden="true"
            >
              <path d="M5.223 2.25h13.554a2.25 2.25 0 0 1 2.225 1.91l.61 4.272a2.25 2.25 0 0 1-2.225 2.59H4.613a2.25 2.25 0 0 1-2.225-2.59l.61-4.272a2.25 2.25 0 0 1 2.225-1.91Zm0 0V.75" />
              <path
                fillRule="evenodd"
                d="M6 12.75a.75.75 0 0 1 .75.75v6.75h10.5V13.5a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V13.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-gray-900 sm:inline-block">
            GeraiOne
          </span>
        </Link>

        {/* CENTER: Search Bar — visible on md+ */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <Suspense fallback={<div className="h-9 w-full max-w-lg bg-gray-100 rounded-full animate-pulse" />}>
            <SearchBarInput />
          </Suspense>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Mobile Search Icon — visible below md */}
          <button
            type="button"
            onClick={handleMobileSearchClick}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5.5 w-5.5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                clipRule="evenodd"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden="true" />

          {/* Auth: UserButton or Sign In */}
          {isLoaded ? (
            isSignedIn ? (
              <UserButton />
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign In
              </Link>
            )
          ) : (
            /* Skeleton placeholder while Clerk loads */
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          )}
        </div>
      </div>
    </header>
  );
}
