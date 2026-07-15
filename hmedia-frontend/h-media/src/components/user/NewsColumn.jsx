import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsColumn({
  title,
  items = [],
  trending = false,
  loading = false,
  category,
  sponsored = false,
  layout = "default",
}) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      };
      return date.toLocaleDateString("en-US", options).replace(",", "");
    } catch (error) {
      return dateString;
    }
  };

  // const sanitizeContent = (html, limit = 140) => {
  //   if (!html) return "";

  //   // Decode HTML entities
  //   const textarea = document.createElement("textarea");
  //   textarea.innerHTML = html;
  //   let text = textarea.value;

  //   // Remove HTML tags
  //   text = text.replace(/<[^>]+>/g, " ");

   

  //   // Normalize spaces
  //   text = text.replace(/\s+/g, " ").trim();

  //   // Safe truncation
  //   return text.length > limit ? text.slice(0, limit) + "…" : text;
  // };
// REPLACE IT WITH THIS:
  const sanitizeContent = (html, limit = 140) => {
    if (!html) return "";
    // Decode HTML entities (loop up to 5 times for double-escaping)
    const textarea = document.createElement("textarea");
    let lastVal = "";
    let currentVal = html;
    for (let i = 0; i < 5; i++) {
      lastVal = currentVal;
      textarea.innerHTML = currentVal;
      currentVal = textarea.value;
      if (currentVal === lastVal) break;
    }
    // Remove HTML tags
    let text = currentVal.replace(/<[^>]+>/g, " ");
    // Normalize spaces
    text = text.replace(/\s+/g, " ").trim();
    // Safe truncation
    return text.length > limit ? text.slice(0, limit) + "…" : text;
  };
  // Skeleton placeholder
  const SkeletonItem = () => (
    <div className="flex gap-3 sm:gap-4 items-start animate-pulse">
      <div className="w-24 sm:w-28 md:w-32 h-20 sm:h-24 md:h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 sm:h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );

  const handleLinkClick = () => {
    // Dispatch a custom event to show the global loader
    window.dispatchEvent(new Event("show-loader"));
  };

  const getViewMorePath = () => {
    console.log("Category:", category);
    switch (category) {
      case "news":
        return "/latestnews";
      case "cinema-news":
        return "/cinemanews";
      case "meet-person":
        return "/meettheperson";
      case "more-news":
        return "/more"; 
      
      default:
        return `/${category}`;
    }
   
  };
    
  return (
    <div className="flex flex-col">
      {/* TITLE */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase border-b-2 border-brand-red pb-2 text-brand-dark mb-6">
        {title}
      </h2>
      {/* LIST */}
      <div className="space-y-4 sm:space-y-5">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <SkeletonItem key={index} />
            ))
          : items.map((item, index) => (
              <Link
                to={`/${category}/${item.slug}`}
                key={item.slug}
                className="flex gap-3 sm:gap-4 group cursor-pointer items-start"
                onClick={handleLinkClick}
              >
                {/* IMAGE BOX */}
                <div className="relative w-32 sm:w-28 md:w-32 h-20 sm:h-24 md:h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  {/* SPONSORED BADGE (GREEN) */}
                  {item.sponsored && (
                    <span className="absolute bottom-0 right-0 z-10 bg-green-600 text-white text-[8px] sm:text-[8px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
                      Sponsored
                    </span>
                  )}

                  {item.trending && (
                    <span className="absolute top-0 left-0 z-10 flex items-center gap-1 bg-brand-gold text-white text-[8px] sm:text-[8px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
                      Trending
                    </span>
                  )}
                  {/* <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-fill transition-transform duration-300 group-hover:scale-110"
                  /> */}
                  <img
  src={item.image}
  alt={item.title}
  loading="lazy"
  className="w-full h-full object-fill transition-transform duration-300 group-hover:scale-110"
/>
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold sm:font-bold text-gray-800 text-base md:text-[18px] leading-snug group-hover:text-brand-red transition-colors duration-300 line-clamp-2 overflow-hidden font-mal">
                    {/* {item.title} */}
            {/* 10/06/26 */}
                     {/* {item.title.replace(/<[^>]*>/g, "")} */}
                     {sanitizeContent(item.title, 100)}

                  </h3>
{/* 
                {item.content && (
  <div className="text-xs sm:text-sm md:text-[14px] text-black mt-1.5 leading-relaxed font-mal line-clamp-2">
    {item.content}
  </div>
)} */}
  {item.content && (
                  <div className="text-xs sm:text-sm md:text-[14px] text-black mt-1.5 leading-relaxed font-mal line-clamp-2">
                    {sanitizeContent(item.content, 140)}
                  </div>
                )}

                  {item.date && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {formatDate(item.date)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
      </div>

      {/* VIEW MORE */}
      {!trending && !loading && items.length >= 5 &&  (
        <div className="mt-6 text-center">
          <Link
            to={getViewMorePath()}
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:text-brand-dark group transition-colors"
            onClick={handleLinkClick}
          >
            View More
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}
    </div>
  );
}
