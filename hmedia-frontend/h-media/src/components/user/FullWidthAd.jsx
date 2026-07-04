import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import VideoPlayerModal from "./VideoPlayerModal";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /\/embed\/([^?&/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
};

const isSameSite = (url) => {
  if (typeof window === "undefined" || !url) {
    return false;
  }
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
};

export default function FullWidthAd({ ads }) {
  const [youtubeId, setYoutubeId] = useState(null);
  const swiperRef = useRef(null);

  if (!ads || ads.length === 0) {
    return null;
  }

  const handleSameSiteClick = () => {
    window.dispatchEvent(new Event("show-loader"));
  };

  return (
    <section className="w-full lg:py-8 ">
      <div>
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Autoplay, Pagination, Navigation]}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="rounded-l"
        >
          {ads.map((ad, index) => {
            const ytId = getYouTubeId(ad.link);

            return (
              <SwiperSlide key={index}>
                <div className="relative w-full">
                  {/* Ad Image */}
                  {ytId ? (
                    <div
                      className="block cursor-pointer"
                      onClick={() => {
                        swiperRef.current?.autoplay?.stop();
                        setYoutubeId(ytId);
                      }}
                    >
                      <img
                        src={ad.image}
                        alt="Advertisement"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : ad.link ? (
                    isSameSite(ad.link) ? (
                      <Link
                        to={new URL(ad.link, window.location.origin).pathname}
                        onClick={handleSameSiteClick}
                        className="block"
                      >
                        <img
                          src={ad.image}
                          alt="Advertisement"
                          className="w-full h-auto object-cover"
                        />
                      </Link>
                    ) : (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={ad.image}
                          alt="Advertisement"
                          className="w-full h-auto object-cover"
                        />
                      </a>
                    )
                  ) : (
                    <img
                      src={ad.image}
                      alt="Advertisement"
                      className="w-full h-auto object-cover"
                    />
                  )}

                  {/* Contact Button */}
                  {ad.showContact && (
                    <a
                      href="mailto:admin@channelhmedia.in"
                      className="
                    absolute bottom-8 right-1
                    md:bottom-16 md:right-2 lg:bottom-16 lg:right-2 xl:bottom-22 xl:right-3 2xl:bottom-28 2xl:right-3
                    bg-brand-red text-white 
                    py-1 px-2 sm:px-3 sm:py-1.5
                    md:px-4 md:py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-2
                    rounded-lg 
                    text-[6px] md:text-sm lg:text-base xl:text-base
                    font-semibold
                    shadow-lg
                    hover:bg-brand-dark transition
                  "
                    >
                      Contact Us
                    </a>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <VideoPlayerModal
        youtubeId={youtubeId}
        onClose={() => {
          setYoutubeId(null);
          swiperRef.current?.autoplay?.start();
        }}
      />
    </section>
  );
}
