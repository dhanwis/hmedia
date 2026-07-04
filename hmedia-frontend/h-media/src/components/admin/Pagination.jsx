import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  const getPaginationItems = () => {
    let pages = [];

    // Always show the first page
    pages.push(1);

    // Add left ellipsis
    if (currentPage > 3) {
      pages.push("...");
    }

    // Add previous page (if valid)
    if (currentPage - 1 > 1) {
      pages.push(currentPage - 1);
    }

    // Add current page
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(currentPage);
    }

    // Add next page (if valid)
    if (currentPage + 1 < totalPages) {
      pages.push(currentPage + 1);
    }

    // Add right ellipsis
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-2">
        {getPaginationItems().map((item, index) => {
          if (typeof item === "string") {
            return (
              <span
                key={`${item}-${index}`}
                className="flex items-center justify-center w-9 h-9 text-gray-500"
              >
                ...
              </span>
            );
          }
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentPage === item
                  ? "bg-brand-red text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
