"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";

interface UIContextType {
  showWishlistSuccessModal: () => void;
  showToast: (message: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showWishlistSuccessModal = () => {
    setIsModalOpen(true);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <UIContext.Provider value={{ showWishlistSuccessModal, showToast }}>
      {children}

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Heart Icon Container */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner animate-bounce">
              <Heart className="h-8 w-8" fill="currentColor" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Successfully Added to Wishlist
              </h2>
              <p className="text-sm text-gray-500">
                This product has been saved to your wishlist.
              </p>
            </div>

            <div className="flex w-full flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  router.push("/wishlist");
                }}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                View Your Wishlist
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in max-w-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Heart className="h-4.5 w-4.5" fill="currentColor" />
          </div>
          <p className="text-sm font-medium text-gray-900">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
