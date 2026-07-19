import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = []
    const siblingCount = 1 // Number of pages to show around current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1)
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, "...", totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1)
      return [firstPageIndex, "...", ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i)
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex]
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex flex-wrap items-center justify-between gap-3 w-full text-slate-700 dark:text-slate-200", className)}
    >
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Page <span className="font-bold text-slate-900 dark:text-slate-100">{page}</span> of{" "}
        <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className={cn(
            "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-150 cursor-pointer select-none",
            "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
            "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {getPages().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-8 items-center justify-center text-xs font-bold text-slate-400 select-none"
                >
                  ...
                </span>
              )
            }

            const pageNum = p as number
            const isActive = pageNum === page

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold border border-indigo-600"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className={cn(
            "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-150 cursor-pointer select-none",
            "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
            "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </nav>
  )
}
