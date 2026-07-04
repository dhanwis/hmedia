import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { PlayCircle } from "lucide-react";

import "swiper/css";
import VideoPlayerModal from "./VideoPlayerModal";

/**
 * VideoVerticalSlider
 * Left: video thumbnail
 * Right: title
 * Vertical autoplay slider
 * Autoplay can be enabled/disabled via prop
 */

export default function VideoVerticalSlider({
  title,
  items = [],
  autoSlide = true,
  delay = 3000,
  loading = false,
}) {
  const swiperRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section className="container mx-auto w-full">
      {title && (
        <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase border-b-2 border-brand-red pb-2 text-brand-dark mb-6">
          {title}
        </h2>
      )}

      {/* Video Modal */}
      <VideoPlayerModal
        youtubeId={selectedVideo}
        onClose={() => {
          setSelectedVideo(null);
          swiperRef.current?.autoplay?.start();
        }}
      />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <div className="w-40 h-24 bg-gray-300 rounded-lg" />
              <div className="flex-1 h-4 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          direction="vertical"
          spaceBetween={14}
          loop={items.length > 6}
          autoplay={
            autoSlide
              ? {
                  delay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          speed={800}
          modules={[Autoplay]}
          className="h-[550px] xl:h-[460px] 2xl:h-[550px]"
          breakpoints={{
            0: {
              slidesPerView: 6,
            },
            640: {
              slidesPerView: 6,
            },
            768: {
              slidesPerView: 6,
            },
            1280: {
              slidesPerView: 5,
            },
            1536: {
              slidesPerView: 6,
            },
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="group flex gap-4 cursor-pointer items-center"
                onClick={() => {
                  swiperRef.current?.autoplay?.stop();
                  setSelectedVideo(item.youtubeId);
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-36 h-20 overflow-hidden rounded-lg flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <PlayCircle className="text-brand-red" size={36} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm md:text-base line-clamp-2 font-mal group-hover:text-brand-red transition-colors">
                  {item.title}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
