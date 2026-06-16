"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous pages / ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          type="button"
          onClick={() => onPageChange(1)}
          className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis-start"
            className="flex h-10 w-10 items-center justify-center text-sm font-medium text-gray-400"
          >
            ...
          </span>
        );
      }
    }

    // Number buttons
    for (let page = startPage; page <= endPage; page++) {
      const isActive = page === currentPage;
      pages.push(
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={isActive ? "page" : undefined}
          className={`flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            isActive
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      );
    }

    // Next pages / ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis-end"
            className="flex h-10 w-10 items-center justify-center text-sm font-medium text-gray-400"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          type="button"
          onClick={() => onPageChange(totalPages)}
          className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 py-6" aria-label="Pagination Navigation">
      {/* Prev Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">{renderPageButtons()}</div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </nav>
  );
}
