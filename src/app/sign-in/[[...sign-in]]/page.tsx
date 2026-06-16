"use client";

import { BrandingPanel } from "@/components/sign-in/branding-panel";
import { SignInCard } from "@/components/sign-in/sign-in-card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen" id="sign-in-page">
      {/* Left side — Branding panel (hidden on mobile) */}
      <BrandingPanel />

      {/* Right side — Sign in form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        {/* Subtle background pattern for right side */}
        <div className="absolute inset-0 lg:left-1/2 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 lg:left-1/2 w-72 h-72 bg-purple-50/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        {/* Sign-in card */}
        <div className="relative z-10 w-full max-w-md">
          <SignInCard />

          {/* Footer text */}
          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-600 underline underline-offset-2 transition-colors duration-200"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-600 underline underline-offset-2 transition-colors duration-200"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
