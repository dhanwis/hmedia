import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

export default function NewsPagination({ currentPage, totalPages }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;

  // Create page URL
  const createPageURL = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return "#";

    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Smart pagination logic for large pages
  const getPaginationItems = () => {
    const pages = [];
    const range = 2; // pages around current

    pages.push(1); // always show first page

    if (currentPage > range + 2) pages.push("..."); // left ellipsis

    // pages around current
    for (
      let i = Math.max(2, currentPage - range);
      i <= Math.min(totalPages - 1, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - (range + 1)) pages.push("..."); // right ellipsis

    if (totalPages > 1) pages.push(totalPages); // always last page

    return pages;
  };

  if (totalPages <= 1) return null;

  // Single page button
  const PageLink = ({ page, children, className, disabled, ariaLabel }) => {
    if (disabled) {
      return (
        <span
          className={`${className} cursor-not-allowed opacity-50`}
          aria-disabled="true"
        >
          {children}
        </span>
      );
    }

    return (
      <Link to={createPageURL(page)} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  };

  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 pt-6">
      {/* Previous button */}
      <PageLink
        page={currentPage - 1}
        disabled={currentPage === 1}
        ariaLabel="Previous Page"
        className="
          flex items-center justify-center
          min-w-[32px] h-8 sm:min-w-[36px] sm:h-9
          px-2
          bg-white border border-gray-300 rounded-md
          text-gray-600 hover:bg-gray-100 transition
        "
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </PageLink>

      {/* Page numbers */}
      {getPaginationItems().map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="
                flex items-center justify-center
                min-w-[32px] h-8 sm:min-w-[36px] sm:h-9
                px-2
                text-gray-500
              "
            >
              ...
            </span>
          );
        }

        return (
          <PageLink
            key={item}
            page={item}
            className={`
              flex items-center justify-center
              min-w-[32px] h-8 sm:min-w-[36px] sm:h-9
              px-2
              text-xs sm:text-sm font-medium rounded-md
              transition
              ${
                currentPage === item
                  ? "bg-brand-red text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {item}
          </PageLink>
        );
      })}

      {/* Next button */}
      <PageLink
        page={currentPage + 1}
        disabled={currentPage === totalPages}
        ariaLabel="Next Page"
        className="
          flex items-center justify-center
          min-w-[32px] h-8 sm:min-w-[36px] sm:h-9
          px-2
          bg-white border border-gray-300 rounded-md
          text-gray-600 hover:bg-gray-100 transition
        "
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </PageLink>
    </div>
  );
}
