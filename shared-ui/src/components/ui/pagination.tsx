import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const getPages = () => {
    const pages = []
    const range = 2 // Number of pages to show before and after current page
    
    const start = Math.max(1, page - range)
    const end = Math.min(totalPages, page + range)
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push("...")
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex w-full justify-center items-center gap-1 sm:gap-2", className)}
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1 sm:gap-2">
        {getPages().map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-7 w-7 items-center justify-center text-sm text-slate-400 select-none"
              >
                ...
              </span>
            )
          }

          const pageNum = p as number
          const isActive = pageNum === page

          return (
            <Button
              key={`page-${pageNum}`}
              variant={isActive ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(pageNum)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
