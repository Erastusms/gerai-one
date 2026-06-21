import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/query-provider";
import { UIProvider } from "@/components/providers/ui-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GeraiOne — Grow Your Business",
  description:
    "Manage products, orders, customers, and payments from a single platform. GeraiOne is the modern ecommerce platform built for growing businesses.",
  keywords: [
    "ecommerce",
    "online store",
    "business management",
    "GeraiOne",
    "product management",
    "order tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
        <body className="min-h-full flex flex-col font-sans">
          <QueryProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
