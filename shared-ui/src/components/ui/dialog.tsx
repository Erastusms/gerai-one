import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  closeOnOutsideClick?: boolean
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeOnOutsideClick = true,
}: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (closeOnOutsideClick) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-default" onClick={handleBackdropClick} />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-200 z-10 text-slate-900 dark:text-slate-100",
          className
        )}
      >
        {/* Header with Title on Left & Close Button on Top Right */}
        {title ? (
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-4">
            <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
          {children}
        </div>
      </div>
    </div>
  )
}
