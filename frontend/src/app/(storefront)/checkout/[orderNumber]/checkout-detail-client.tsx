"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { checkoutApi } from "@/lib/api/checkout.api";
import { shippingApi } from "@/lib/api/shipping.api";
import { addressApi } from "@/lib/api/address.api";
import { useUI } from "@/components/providers/ui-provider";
import ReusableError from "@/components/storefront/reusable-error";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Truck, 
  Tag, 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  ShieldCheck,
  ShoppingBag,
  X,
  Home,
  Briefcase,
  Building2,
  Compass,
  Loader2
} from "lucide-react";

interface CheckoutDetailClientProps {
  orderNumber: string;
}

export default function CheckoutDetailClient({ orderNumber }: CheckoutDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showCartToast } = useUI() as any;
  const queryClient = useQueryClient();

  const warningsParam = searchParams.get("warnings") || "";
  const warnings = warningsParam ? warningsParam.split(",") : [];

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  // Fetch customer saved addresses
  const { data: addressesRes } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
  });
  const addresses = addressesRes?.data || [];

  // Update checkout address snapshot mutation
  const updateAddressMutation = useMutation({
    mutationFn: (addressId: string) => checkoutApi.updateCheckoutAddress(orderNumber, addressId),
    onSuccess: () => {
      showCartToast("Shipping address updated successfully", "success");
      refetch(); // Reload checkout session
      setIsAddressModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update address";
      showCartToast(msg, "error");
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Checkout Session details using the Order Number
  const {
    data: checkoutResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["checkout", orderNumber],
    queryFn: () => checkoutApi.getCheckout(orderNumber),
    enabled: !!orderNumber,
    refetchInterval: 15000, // Refetch every 15s to check status / expiration
  });

  const session = checkoutResponse?.data;
  const items = session?.items || [];

  // Expiration countdown logic
  useEffect(() => {
    if (!session?.expiresAt || session.status !== "PENDING") return;

    const calculateTimeLeft = () => {
      const expirationTime = new Date(session.expiresAt).getTime();
      const now = Date.now();
      const diff = expirationTime - now;

      if (diff <= 0) {
        return { text: "00:00:00", expired: true };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const format = (num: number) => String(num).padStart(2, "0");
      return {
        text: `${format(hours)}:${format(minutes)}:${format(seconds)}`,
        expired: false,
      };
    };

    // Calculate and set immediately
    const initial = calculateTimeLeft();
    setTimeLeft(initial.text);
    setIsExpired(initial.expired);

    const interval = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current.text);
      setIsExpired(current.expired);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.expiresAt, session?.status]);

  // Cancel Checkout Mutation
  const cancelMutation = useMutation({
    mutationFn: () => checkoutApi.cancelCheckout(orderNumber),
    onSuccess: () => {
      showCartToast("Checkout cancelled successfully", "success");
      router.push("/checkout");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to cancel checkout";
      showCartToast(msg, "error");
    },
  });

  // Fetch Active Shipping Services
  const { data: shippingServicesResponse, isLoading: isLoadingShipping } = useQuery({
    queryKey: ["shipping-services"],
    queryFn: () => shippingApi.getActiveShippingServices(),
  });
  const shippingServices = shippingServicesResponse?.data || [];

  // Update Shipping Service Mutation
  const updateShippingMutation = useMutation({
    mutationFn: (shippingServiceId: string) => checkoutApi.updateShippingService(orderNumber, shippingServiceId),
    onSuccess: (response) => {
      showCartToast("Shipping method updated successfully", "success");
      queryClient.setQueryData(["checkout", orderNumber], response);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update shipping method";
      showCartToast(msg, "error");
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Render State 1: Loading State
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-md" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-1 h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Render State 2: Fetch Error
  if (error || !session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ReusableError
          title="Checkout Load Failed"
          message={error instanceof Error ? error.message : "Unable to retrieve details of this checkout session."}
          onRetry={() => refetch()}
        />
        <div className="text-center mt-6">
          <Link href="/checkout" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Back to Checkout List
          </Link>
        </div>
      </div>
    );
  }

  // Render State 3: Session is already Cancelled or Expired
  const isSessionClosed = 
    session.status !== "PENDING" || 
    isExpired || 
    (session.expiresAt && new Date(session.expiresAt).getTime() - Date.now() <= 0);
  if (isSessionClosed) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 mx-auto border border-amber-100 shadow-sm">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Checkout Session {session.status === "EXPIRED" || isExpired ? "Expired" : "Cancelled"}
          </h1>
          <p className="text-gray-500 text-sm">
            This checkout session is no longer active. Reserved stock has been released back into available inventory.
          </p>
          <Link href="/checkout" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md">
            Return to Checkout List
          </Link>
        </div>
      </div>
    );
  }

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = items.reduce((acc, item) => {
    const originalPrice = item.price;
    const discountPrice = item.discountPrice !== null ? item.discountPrice : originalPrice;
    return acc + (originalPrice - discountPrice) * item.quantity;
  }, 0);
  const shippingFee = session.shippingFee !== null ? Number(session.shippingFee) : 0;
  const grandTotal = subtotal - discount + shippingFee;

  // Format Order Number for display (slashes look better than dashes in UI)
  const displayOrderNumber = orderNumber.replaceAll("-", "/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* WARNING BANNER */}
      {warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/75 p-4 text-amber-800 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5.5 w-5.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">Important Price Updates</h4>
              <div className="mt-1 space-y-1 text-xs text-amber-800 font-medium">
                {warnings.includes("PRICE_CHANGED") && (
                  <p>⚠ One or more items in your cart had price updates. We have updated your checkout session with the new rates.</p>
                )}
                {warnings.includes("DISCOUNT_CHANGED") && (
                  <p>⚠ Promotional discount savings on some items have changed since they were added to your cart.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to cancel this checkout session? Your stock reservations will be released.")) {
                cancelMutation.mutate();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel & Return to List</span>
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout Detail</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">Order Number: {displayOrderNumber}</p>
        </div>

        {/* TIMER DISPLAY */}
        {!isMounted || isLoading || !session ? (
          <div className="h-[52px] w-[140px] bg-gray-200 animate-pulse rounded-xl" />
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-2.5 shadow-sm text-red-700">
            <Clock className="h-5 w-5 animate-pulse text-red-500" />
            <div className="text-right">
              <p className="text-2xs uppercase tracking-wider font-bold text-red-500/80">Time Remaining</p>
              <p className="font-mono text-base font-extrabold tracking-widest leading-none mt-0.5">{timeLeft}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* LEFT COLUMN: Checkout Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Shipping Address */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span>1. Shipping Address</span>
              </h3>
              {addresses.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Change Address
                </button>
              )}
            </div>

            {session.shippingRecipientName ? (
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">{session.shippingRecipientName}</p>
                  {session.shippingLabel && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {session.shippingLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase">{session.shippingRecipientPhone}</p>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                  {session.shippingFullAddress}, {session.shippingSubDistrict}, {session.shippingDistrict}, {session.shippingCity}, {session.shippingProvince}, {session.shippingPostalCode}
                </p>
                {session.shippingNotes && (
                  <p className="text-xs font-semibold text-gray-400 italic mt-1">
                    Notes: {session.shippingNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-red-200 bg-red-50/20 p-5 text-center space-y-3 animate-fade-in">
                <p className="text-sm font-semibold text-red-800">
                  No default shipping address found.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  Add Shipping Address
                </Link>
              </div>
            )}
          </div>

          {/* SECTION 2: Shipping Method */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-indigo-600" />
              <span>2. Shipping Method</span>
            </h3>
            
            {isLoadingShipping ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-gray-150 rounded-xl" />
                <div className="h-16 bg-gray-150 rounded-xl" />
              </div>
            ) : shippingServices.length === 0 ? (
              <p className="text-sm text-gray-500 font-semibold italic">
                No active shipping services available.
              </p>
            ) : (
              <div className="space-y-3">
                {shippingServices.map((service) => {
                  const isSelected = session.shippingServiceId === service.id || 
                    (!session.shippingServiceId && session.shippingServiceName === service.name);
                  
                  const deliveryStr = service.estimatedDeliveryMinDay === service.estimatedDeliveryMaxDay
                    ? `${service.estimatedDeliveryMinDay} day`
                    : `${service.estimatedDeliveryMinDay}-${service.estimatedDeliveryMaxDay} days`;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      disabled={updateShippingMutation.isPending}
                      onClick={() => updateShippingMutation.mutate(service.id)}
                      className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/10 ring-1 ring-indigo-600"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      } ${updateShippingMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Custom Radio Button */}
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-indigo-600 text-indigo-600" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{service.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded border border-gray-150 uppercase tracking-wider">
                              {deliveryStr}
                            </span>
                          </p>
                          {service.description && (
                            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-extrabold text-indigo-600 shrink-0 ml-4">
                        {formatPrice(service.defaultPrice)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: Checkout Products */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <span>3. Review Checked-out Items</span>
            </h3>
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const variant = item.productVariant;
                const attributeString = variant?.attributeValues
                  ?.map((av: any) => `${av.attributeValue.attribute.name}: ${av.attributeValue.value}`)
                  .join(" · ");

                const basePrice = Number(item.price);
                const discountPrice = item.discountPrice !== null ? Number(item.discountPrice) : null;
                const effectivePrice = discountPrice !== null ? discountPrice : basePrice;

                return (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <Image
                        src={item.thumbnailUrl || "https://picsum.photos/seed/placeholder/600/600"}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.productName}</h4>
                      {attributeString && <p className="text-xs text-gray-400 font-medium mt-0.5">{attributeString}</p>}
                      <p className="text-xs text-gray-500 font-semibold mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {discountPrice !== null ? (
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-gray-900">{formatPrice(discountPrice)}</p>
                          <p className="text-xs text-gray-400 line-through">{formatPrice(basePrice)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-gray-900">{formatPrice(basePrice)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Voucher */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm opacity-75">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <span>4. Voucher Promotion</span>
            </h3>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 border border-gray-200">
                Coming Soon
              </span>
              <p className="text-xs text-gray-400 font-medium mt-2">Voucher codes and promo adjustments will be enabled in the next phase.</p>
            </div>
          </div>

          {/* SECTION 5: Payment Method */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm opacity-75">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span>5. Payment Method</span>
            </h3>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 border border-gray-200">
                Coming Soon
              </span>
              <p className="text-xs text-gray-400 font-medium mt-2">Direct bank transfer, credit card gateway, and digital wallets coming soon.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
            
            <div className="space-y-3.5 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">Discount Savings</span>
                  <span className="font-semibold text-emerald-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Shipping Fee</span>
                <span className="font-semibold text-gray-900">{formatPrice(shippingFee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2">
              <span className="text-base font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-extrabold text-indigo-600">{formatPrice(grandTotal)}</span>
            </div>

            {/* ACTION BUTTON */}
            <div className="space-y-3 pt-4">
              {!session.shippingRecipientName && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-xs font-bold flex items-center gap-2 mb-4 shadow-sm animate-pulse">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>A shipping address is required to place your order. <Link href="/profile" className="underline font-extrabold text-indigo-600 hover:text-indigo-800">Add Address</Link></span>
                </div>
              )}

              {!session.shippingServiceName && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-xs font-bold flex items-center gap-2 mb-4 shadow-sm animate-pulse">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>A shipping method selection is required to place your order.</span>
                </div>
              )}

              <Button
                type="button"
                disabled={isSessionClosed || !session.shippingRecipientName || !session.shippingServiceName || cancelMutation.isPending || updateShippingMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 text-center cursor-pointer shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  alert("Order draft placed successfully! Payment gateway integration will be introduced in the next phase.");
                  router.push("/checkout");
                }}
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Confirm & Place Order</span>
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-3xs text-gray-400 font-semibold uppercase tracking-wider text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Secure Stock Reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">Select Shipping Address</h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <p className="text-sm font-semibold text-gray-500">No active addresses found.</p>
                <Link
                  href="/profile"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Add Shipping Address
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl border p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm transition-all ${
                      addr.isDefault
                        ? "border-indigo-600 bg-indigo-50/5 ring-1 ring-indigo-500/10"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-3xs font-bold text-gray-600 uppercase tracking-wide">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="font-extrabold text-gray-800 text-sm block">
                          {addr.recipientName}
                        </span>
                        <span className="text-gray-400 font-bold tracking-wide uppercase mt-0.5 block">
                          {addr.recipientPhone}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 leading-relaxed mt-1">
                        {addr.fullAddress}, {addr.subDistrict}, {addr.district}, {addr.city}, {addr.province}, {addr.postalCode}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={updateAddressMutation.isPending}
                      onClick={() => updateAddressMutation.mutate(addr.id)}
                      className="shrink-0 inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {updateAddressMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Select"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
