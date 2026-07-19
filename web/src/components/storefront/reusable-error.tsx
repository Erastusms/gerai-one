"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReusableErrorProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export default function ReusableError({
  title = "Connection Error",
  message = "Unable to retrieve information from the server. Please check your internet connection or try again.",
  onRetry,
}: ReusableErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/30 rounded-2xl border border-red-100 max-w-md mx-auto my-12 space-y-4 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-red-950">{title}</h3>
        <p className="text-xs text-red-700 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-200 hover:bg-red-50/50 hover:text-red-950 text-red-900 font-semibold text-xs px-4 py-2 h-auto rounded-lg shadow-sm"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
