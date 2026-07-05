"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { checkoutApi } from "@/lib/api/checkout.api";
import ReusableError from "@/components/storefront/reusable-error";
import { Button } from "@/components/ui/button";
import { Clock, ShoppingBag, ArrowRight } from "lucide-react";

// Countdown Card component to update individual session countdown timers every second
function CheckoutCard({ session, formatPrice }: { session: any; formatPrice: (p: number) => string }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(
    session.status === "EXPIRED" || 
    (session.expiresAt && new Date(session.expiresAt).getTime() - Date.now() <= 0)
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session.status !== "PENDING") {
      setIsExpired(true);
      return;
    }

    const expirationTime = new Date(session.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = expirationTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const format = (num: number) => String(num).padStart(2, "0");
        setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session.status, session.expiresAt]);

  const items = session.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const discount = items.reduce((acc: number, item: any) => {
    const originalPrice = item.price;
    const discountPrice = item.discountPrice !== null ? item.discountPrice : originalPrice;
    return acc + (originalPrice - discountPrice) * item.quantity;
  }, 0);
  const shippingFee = 20000;
  const grandTotal = subtotal - discount + shippingFee;

  const urlSafeOrderNumber = session.orderNumber.replaceAll("/", "-");
  const displayOrderNumber = session.orderNumber;
  const productCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const formattedDate = new Date(session.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExpired ? "opacity-75 bg-gray-50/50 border-gray-100" : "border-gray-200 hover:border-indigo-200 hover:shadow-indigo-50/5"}`}>
      <div className="space-y-2.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-gray-900 tracking-tight text-base sm:text-lg">
            {displayOrderNumber}
          </span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-bold border uppercase ${
            session.status === "COMPLETED" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : session.status === "CANCELLED"
                ? "bg-gray-100 text-gray-700 border-gray-200"
                : isExpired
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse"
          }`}>
            {isExpired ? "EXPIRED" : session.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-gray-500 font-semibold">
          <div>
            <span className="text-gray-400 font-normal">Created:</span> {formattedDate}
          </div>
          <div>
            <span className="text-gray-400 font-normal">Products:</span> {productCount} items ({items.length} unique)
          </div>
          {!isExpired && session.status === "PENDING" && (
            <div className="flex items-center gap-1.5 text-red-600 font-bold">
              <Clock className="h-3.5 w-3.5" />
              {!isMounted ? (
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              ) : (
                <span>Expires in: {timeLeft}</span>
              )}
            </div>
          )}
        </div>

        <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
          <span className="text-xs text-gray-400 font-normal">Total Amount:</span>
          <span className="text-indigo-600 font-extrabold text-base">{formatPrice(grandTotal)}</span>
          <span className="text-3xs text-gray-400 font-semibold">(Incl. Rp20.000 Shipping)</span>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto">
        <Button
          type="button"
          disabled={isExpired || session.status !== "PENDING"}
          onClick={() => router.push(`/checkout/${urlSafeOrderNumber}`)}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm hover:shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Continue Checkout
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutListPage() {
  const {
    data: checkoutsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["checkouts"],
    queryFn: () => checkoutApi.getCheckouts(),
    refetchInterval: 30000, // Refetch every 30s
  });

  const sessions = checkoutsResponse?.data || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Render State 1: Loading
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-md" />
          <div className="h-4 w-64 bg-gray-200 rounded-md" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Render State 2: Fetch Error
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ReusableError
          title="Failed to Load Checkouts"
          message={error instanceof Error ? error.message : "Unable to retrieve your checkout sessions from the server."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Render State 3: Empty State
  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto animate-in fade-in duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300 border border-gray-100 shadow-sm">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">No Pending Checkouts</h1>
            <p className="text-sm text-gray-500">
              You don't have any pending checkouts. Add items to your cart and proceed to checkout.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-indigo-600/10 transition-colors font-bold active:scale-[0.98]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Title and summary header */}
        <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Pending Checkouts</h1>
            <p className="mt-2 text-sm text-gray-500">
              You have {sessions.length} total checkout session{sessions.length > 1 ? "s" : ""} on record.
            </p>
          </div>
        </div>

        {/* List of checkouts */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <CheckoutCard key={session.id} session={session} formatPrice={formatPrice} />
          ))}
        </div>
      </div>
    </div>
  );
}
