import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />
      
      <div
        className={cn(
          "relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-200 z-10",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-100"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
            {title}
          </div>
        )}

        <div className="flex-1 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
