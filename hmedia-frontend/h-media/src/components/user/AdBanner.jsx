import { useState } from "react";
import { Link } from "react-router-dom";
import VideoPlayerModal from "./VideoPlayerModal";

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

export default function AdBanner({ image, link, onContact }) {
  const [youtubeId, setYoutubeId] = useState(null);

  const handleSameSiteClick = () => {
    window.dispatchEvent(new Event("show-loader"));
  };

  const ImageComponent = () => (
    <div className="relative w-full h-full">
      {/* Image */}
      <img
        src={image}
        alt="Advertisement"
        className="w-full h-full object-cover rounded-lg"
      />

      {/* Contact Button */}
      {onContact && (
        <a
          href="mailto:admin@channelhmedia.in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="
          absolute bottom-2 sm:bottom-3 md:bottom-2 xl:bottom-4 left-1/2 -translate-x-1/2
          bg-brand-red text-white 
          px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-1.5 lg:py-1.5 rounded-lg 
          text-xs sm:text-sm md:text-sm font-semibold
          shadow-lg
          hover:bg-brand-dark transition cursor-pointer
          whitespace-nowrap
        "
          >
            Contact Us
          </button>
        </a>
      )}
    </div>
  );

  const ytId = getYouTubeId(link);

  if (ytId) {
    return (
      <>
        <div
          className="block relative cursor-pointer"
          onClick={() => setYoutubeId(ytId)}
        >
          <ImageComponent />
        </div>
        <VideoPlayerModal
          youtubeId={youtubeId}
          onClose={() => setYoutubeId(null)}
        />
      </>
    );
  }

  if (link && link !== "#") {
    if (isSameSite(link)) {
      return (
        <Link
          to={new URL(link, window.location.origin).pathname}
          onClick={handleSameSiteClick}
          className="block relative"
        >
          <ImageComponent />
        </Link>
      );
    }
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <ImageComponent />
      </a>
    );
  }

  return (
    <div className="block relative">
      <ImageComponent />
    </div>
  );
}
