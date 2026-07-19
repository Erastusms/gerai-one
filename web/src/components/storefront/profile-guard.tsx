"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile.api";
import { Loader2 } from "lucide-react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();

  // Fetch local customer profile
  const { data: profileRes, isLoading: isProfileLoading, isError } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: () => profileApi.getProfile(),
    enabled: isClerkLoaded && isSignedIn,
    retry: 1,
  });

  const profile = profileRes?.data;
  const isProfileCompleted = profile?.isProfileCompleted ?? false;
  const role = profile?.role;

  useEffect(() => {
    if (!isClerkLoaded || isProfileLoading) return;

    // Redirect ADMIN or SUPER_ADMIN users directly to the Admin console
    if (isSignedIn && (role === "ADMIN" || role === "SUPER_ADMIN")) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";
      window.location.href = adminUrl;
      return;
    }

    // Only redirect signed-in users with incomplete profiles
    if (isSignedIn && !isProfileCompleted) {
      const isSetupPage = pathname === "/profile/setup";
      
      // Restricted routes
      const isRestricted =
        pathname === "/" ||
        pathname.startsWith("/cart") ||
        pathname.startsWith("/wishlist") ||
        pathname.startsWith("/checkout") ||
        (pathname.startsWith("/profile") && !isSetupPage);

      if (isRestricted) {
        router.push("/profile/setup");
      }
    }
  }, [isClerkLoaded, isProfileLoading, isSignedIn, isProfileCompleted, role, pathname, router]);

  // While checking status, show a premium loading indicator for blocked pages
  const isBlockedRoute =
    pathname === "/" ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/wishlist") ||
    pathname.startsWith("/checkout") ||
    (pathname.startsWith("/profile") && pathname !== "/profile/setup");

  if (isClerkLoaded && isSignedIn && isProfileLoading && isBlockedRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Verifying account status...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
