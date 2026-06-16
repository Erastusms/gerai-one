"use client";

import { SignIn, useClerk } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

function SignInSkeleton() {
  return (
    <div className="space-y-6 p-2">
      {/* Social buttons skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Divider skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-px flex-1" />
      </div>

      {/* Input fields skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Footer skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function SignInCard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const clerk = useClerk();

  useEffect(() => {
    if (clerk.loaded) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [clerk.loaded]);

  return (
    <Card className="w-full max-w-md border-0 shadow-xl shadow-black/5 ring-1 ring-gray-200 animate-slide-in-right">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center gap-2 lg:hidden mb-4">
          <div className="flex items-center justify-center size-8 rounded-lg bg-indigo-600 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.993 2.993 0 00.506-1.599l.694-4.85A1.5 1.5 0 015.686 1.5h12.628a1.5 1.5 0 011.486 1.3l.694 4.85A2.993 2.993 0 0021 9.349"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            GeraiOne
          </span>
        </div>
        <CardTitle>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        </CardTitle>
        <CardDescription>
          <p className="text-gray-500">Sign in to continue to your account</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
          <SignInSkeleton />
        ) : null}
        <div
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none p-0 bg-transparent w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg h-11 font-medium text-gray-700",
                socialButtonsBlockButtonText: "font-medium text-sm",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-400 text-xs",
                formFieldLabel: "text-sm font-medium text-gray-700",
                formFieldInput:
                  "rounded-lg border-gray-200 h-11 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200",
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-700 rounded-lg h-11 font-medium transition-all duration-200 shadow-sm shadow-indigo-600/25",
                footerActionLink:
                  "text-indigo-600 hover:text-indigo-700 font-medium",
                formFieldAction: "text-indigo-600 hover:text-indigo-700",
                identityPreviewEditButton: "text-indigo-600",
                alert: "rounded-lg",
                alertText: "text-sm",
                footer: "pt-4",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </CardContent>
    </Card>
  );
}
