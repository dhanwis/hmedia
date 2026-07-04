import { useState, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import VideoPlayerModal from "./VideoPlayerModal";
import "swiper/css";

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

const BottomAdBanner = ({ ads }) => {
  const [open, setOpen] = useState(true);
  const [youtubeId, setYoutubeId] = useState(null);
  const swiperRef = useRef(null);

  const handleSameSiteClick = () => {
    window.dispatchEvent(new Event("show-loader"));
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl transition-transform duration-300
          ${open ? "translate-y-0" : "translate-y-[calc(100%_-_34px)]"}`}
      >
        {/* Arrow Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setOpen(!open)}
            className="mb-1 flex items-center justify-center rounded-md bg-white border shadow px-3 py-1 text-brand-gold hover:bg-brand-red hover:text-white transition-all font-bold"
          >
            {open ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Banner Image */}
        <div className="bg-white rounded-lg">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            className="w-full rounded-xl"
          >
            {ads.map((ad, index) => {
              const ytId = getYouTubeId(ad.link);
              const imageElement = (
                <img
                  src={ad.image}
                  alt={ad.title || "Advertisement"}
                  className="w-full rounded-lg border border-gray-200 object-cover"
                />
              );

              return (
                <SwiperSlide key={index}>
                  {ytId ? (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        swiperRef.current?.autoplay?.stop();
                        setYoutubeId(ytId);
                      }}
                    >
                      {imageElement}
                    </div>
                  ) : ad.link ? (
                    isSameSite(ad.link) ? (
                      <Link
                        to={new URL(ad.link, window.location.origin).pathname}
                        onClick={handleSameSiteClick}
                      >
                        {imageElement}
                      </Link>
                    ) : (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {imageElement}
                      </a>
                    )
                  ) : (
                    <div>{imageElement}</div>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
      <VideoPlayerModal
        youtubeId={youtubeId}
        onClose={() => {
          setYoutubeId(null);
          swiperRef.current?.autoplay?.start();
        }}
      />
    </>
  );
};

export default BottomAdBanner;
