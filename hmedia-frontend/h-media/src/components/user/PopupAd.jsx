import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const visitedRoutes = new Set();

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
  // Only match if the whole string is an ID (11 chars) to avoid false positives in other URLs
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

export default function PopupAd({ ads }) {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const playerRef = useRef(null);

  const ad = ads && ads.length > 0 ? ads[0] : null;
  const ytId = ad ? getYouTubeId(ad.link) : null;

  // Show popup after 2 seconds, only once per route
  useEffect(() => {
    if (!ads || ads.length === 0) return;
    if (visitedRoutes.has(location.pathname)) return;

    const timer = setTimeout(() => {
      setShow(true);
      visitedRoutes.add(location.pathname);
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname, ads]);

  // Auto close after 15 seconds, but not if it is a video ad
  useEffect(() => {
    if (show && !ytId) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [show, ytId]);

  // Initialize YouTube Player API to detect when video ends
  useEffect(() => {
    if (!show || !ytId) return;

    const onPlayerStateChange = (event) => {
      // YT.PlayerState.ENDED is 0
      if (event.data === 0) {
        setShow(false);
      }
    };

    const initializePlayer = () => {
      if (!document.getElementById("popup-youtube-player")) return;

      playerRef.current = new window.YT.Player("popup-youtube-player", {
        videoId: ytId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [show, ytId]);

  if (!show || !ad) return null;

  const handleSameSiteClick = () => {
    setShow(false);
    window.dispatchEvent(new Event("show-loader"));
  };

  const renderAdContent = () => {
    if (ytId) {
      return (
        <div className="w-[90vw] sm:w-[600px] aspect-video bg-black">
          <div id="popup-youtube-player" className="w-full h-full"></div>
        </div>
      );
    }

    const imageElement = (
      <img
        src={ad.image}
        alt={ad.title || "Popup Ad"}
        className="w-auto h-auto max-h-[80vh] max-w-full object-contain"
      />
    );

    if (ad.link) {
      if (isSameSite(ad.link)) {
        return (
          <Link
            to={new URL(ad.link, window.location.origin).pathname}
            onClick={handleSameSiteClick}
            className="cursor-pointer"
          >
            {imageElement}
          </Link>
        );
      }
      return (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          {imageElement}
        </a>
      );
    }
    return imageElement;
  };

  return (
      <div
        className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60"
        onClick={() => setShow(false)}
      >
        {/* IMAGE CONTAINER */}
        <div
          className="relative w-auto max-w-[90%] sm:max-w-[60%] rounded-lg overflow-hidden shadow-2xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-2 right-2 z-10 bg-black/70 text-white rounded-full p-1 hover:bg-black cursor-pointer"
          >
            <X size={18} />
          </button>

          {renderAdContent()}
        </div>
      </div>
  );
}
