"use client";

import React from "react";

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
    ),
    title: "Product Management",
    description: "Organize and manage your entire product catalog with ease.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    ),
    title: "Order Tracking",
    description: "Track and fulfill orders from placement to delivery.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
    title: "Customer Insights",
    description: "Understand your customers with powerful analytics.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
    title: "Payment Processing",
    description: "Accept payments securely with multiple gateways.",
  },
];

export function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-white/5 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-purple-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-indigo-500/5 blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="size-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.993 2.993 0 00.506-1.599l.694-4.85A1.5 1.5 0 015.686 1.5h12.628a1.5 1.5 0 011.486 1.3l.694 4.85A2.993 2.993 0 0021 9.349"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              GeraiOne
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Grow Your Business
            <br />
            <span className="text-indigo-200">with GeraiOne</span>
          </h1>
          <p className="text-lg text-indigo-100/80 leading-relaxed max-w-md">
            Manage products, orders, customers, and payments from a single
            platform.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-4 animate-fade-in-up-delayed">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-indigo-200 shrink-0 group-hover:bg-white/15 group-hover:border-white/20 transition-all duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-indigo-200/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in-up-delayed">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-indigo-200/60">Active Merchants</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-indigo-200/60">Uptime</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-indigo-200/60">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
