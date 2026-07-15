import { Link } from "react-router-dom";


export default function ArticleCard({
  slug,
  title,
  image,
  date,
  category,
  content,
  loading,
  trending,
  sponsored,
}) {
  const formatDate = (dateString) => {
    if (!dateString) {
      return null;
    }
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
  // const { baseURL } = ApiContext();
  

  const handleLinkClick = () => {
    // Dispatch a custom event to show the global loader
    window.dispatchEvent(new Event("show-loader"));
  };

  // const sanitizeContent = (html, limit = 140) => {
  //   if (!html) return "";

  //   // Decode HTML entities
  //   const textarea = document.createElement("textarea");
  //   textarea.innerHTML = html;
  //   let text = textarea.value;

  //   // Remove HTML tags
  //   text = text.replace(/<[^>]+>/g, " ");

  //   // Remove prefixes like "NEWS:"
  //   // text = text.replace(/^[^:]+:\s*/, "");

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

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mb-5 animate-pulse font-mal">
        <div className="relative overflow-hidden rounded-lg aspect-video bg-gray-300"></div>
        <div className="space-y-2.5 mt-1">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3 mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/${category}/${slug}`}
      className="group cursor-pointer flex flex-col gap-3 mb-5 font-mal"
      onClick={handleLinkClick}
    >
      <div className="relative overflow-hidden rounded-lg aspect-video">
        {/* <img
          src={image}
          alt={title}
          className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-105"
        /> */}
        <img
  src={image}
    // src={`${baseURL}/${image}`}
  // alt={title}

  // 10/07/26
    alt={sanitizeContent(title, 50)}

  loading="lazy"
  className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-105"
/>

        {/* TRENDING LABEL */}
        {trending && (
          <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-brand-gold text-white text-[8px] sm:text-[9px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
            Trending
          </span>
        )}

        {/* SPONSORED LABEL */}
        {sponsored && (
          <span className="absolute bottom-2 right-2 z-10 bg-green-600 text-white text-[8px] sm:text-[9px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
            Sponsored
          </span>
        )}
      </div>
      <div>
        {/* 10/07/26 */}
              
        <h3 className="font-bold text-base md:text-[18px] group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
          {sanitizeContent(title, 100)} {/* <-- Uses sanitizeContent to decode and strip HTML */}
        </h3>

        {/* <h3 className="font-bold text-base md:text-[18px] group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
          {title}
        </h3> */}
        {/* Strip HTML tags from content */}
        {/* {content && (
          <p className="text-xs sm:text-sm md:[text-14px] text-black mt-1.5 line-clamp-2 leading-relaxed">
            
            {sanitizeContent(content, 140)}
          </p>
        )} */}
        <p className="text-xs sm:text-sm md:[text-14px] text-black mt-1.5 line-clamp-2 leading-relaxed">
          {sanitizeContent(content, 140)}
        </p>
        {date && (
          <p className="text-xs text-gray-500 mt-2">{formatDate(date)}</p>
        )}
      </div>
    </Link>
  );
}
