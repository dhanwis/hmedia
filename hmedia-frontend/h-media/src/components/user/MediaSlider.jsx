import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { PlayCircle } from "lucide-react";

import "swiper/css";
import { Link } from "react-router-dom";
import VideoPlayerModal from "./VideoPlayerModal";

const SkeletonSlide = () => (
  <div className="!w-72 animate-pulse">
    <div className="flex flex-col gap-3 mb-3">
      <div className="w-full h-44 bg-gray-300 rounded-lg"></div>
      <div className="text-center mt-2 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) {
    return null;
  }
  try {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    // Format the date (e.g., "Dec 15, 2025") and remove the comma
    return date.toLocaleDateString("en-US", options).replace(",", "");
  } catch (error) {
    // If the date is not valid, return the original string
    return dateString;
  }
};

export default function MediaSlider({
  title,
  items,
  video = false,
  loading = false,
  trending = false,
}) {
  const swiperRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Don't render the slider if there are no items and it's not loading
  if (!loading && (!items || items.length === 0)) {
    return null;
  }

  const handleLinkClick = () => {
    // Dispatch a custom event to show the global loader
    window.dispatchEvent(new Event("show-loader"));
  };

  const sanitizeContent = (html, limit = 140) => {
    if (!html) return "";

    // Decode HTML entities
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    let text = textarea.value;

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, " ");

    // Remove prefixes like "NEWS:"
    // text = text.replace(/^[^:]+:\s*/, "");

    // Normalize spaces
    text = text.replace(/\s+/g, " ").trim();

    // Safe truncation
    return text.length > limit ? text.slice(0, limit) + "…" : text;
  };

  return (
    <section className="container mx-auto w-full">
      <h2
        className="text-lg sm:text-xl md:text-2xl font-black uppercase 
        border-b-2 border-brand-red pb-2 text-brand-dark mb-6"
      >
        {title}
      </h2>

      {/* Video Popup Modal */}
      <VideoPlayerModal
        youtubeId={selectedVideo}
        onClose={() => {
          setSelectedVideo(null);

          if (video) {
            swiperRef.current?.autoplay?.start();
          }
        }}
      />

      {loading ? (
        <div className="flex space-x-7 overflow-hidden px-1">
          {[...Array(4)].map((_, i) => (
            <SkeletonSlide key={i} />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={7}
          slidesPerView={"auto"}
          loop={items.length > 4}
          speed={4000}
          allowTouchMove={!video}
          freeMode={video ? false : { enabled: true, momentum: false }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: !video,
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="!px-1 will-change-transform"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index} className="!w-72">
              {/* VIDEO CARD → NO LINK */}
              {video ? (
                <div className="group cursor-pointer flex flex-col gap-3 mb-3">
                  <div
                    className="relative overflow-hidden rounded-lg aspect-video"
                    onClick={() => {
                      setSelectedVideo(item.youtubeId);

                      if (video) {
                        swiperRef.current?.autoplay?.stop();
                      }
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/50 transition">
                      <PlayCircle
                        size={50}
                        className="text-brand-red group-hover:text-white transition"
                      />
                    </div>
                  </div>

                  {/* TITLE → NOT LINK */}
                  <h3 className="font-bold text-base line-clamp-2 font-mal transition-colors duration-300 group-hover:text-brand-red">
                    {item.title}
                  </h3>
                </div>
              ) : (
                /* NORMAL CARD → WITH LINK */
                <Link
                  to={
                    trending
                      ? `/trending-news/${item.slug}`
                      : `/more-news/${item.slug}`
                  }
                  onClick={handleLinkClick}
                  className="group flex flex-col mb-3"
                >
                  <div className="relative w-full overflow-hidden rounded-lg mb-3 aspect-video">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-fill transform-gpu transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* TRENDING LABEL */}
                    {item.trending && (
                      <span className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-brand-gold text-white text-[8px] sm:text-[9px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
                        Trending
                      </span>
                    )}

                    {/* SPONSORED LABEL */}
                    {item.sponsored && (
                      <span className="absolute bottom-1 right-1 z-10 bg-green-600 text-white text-[8px] sm:text-[9px] font-semibold px-1 py-[1px] rounded-md shadow uppercase tracking-wide">
                        Sponsored
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-base md:text-[18px] leading-snug line-clamp-2 font-mal group-hover:text-brand-red transition-colors mb-2">
                    {item.title}
                  </p>

                  {/* <p className="text-xs sm:text-sm md:[text-14px] text-black leading-relaxed line-clamp-2 font-mal mb-1">
                    {sanitizeContent(item.content, 70)}
                  </p> */}
                  <p className="text-xs sm:text-sm md:text-[14px] text-black leading-relaxed line-clamp-2 font-mal mb-1">
  {item.content}
</p>
                  
                  <span className="text-xs text-gray-500">
                    {formatDate(item.date)}
                  </span>
                </Link>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
