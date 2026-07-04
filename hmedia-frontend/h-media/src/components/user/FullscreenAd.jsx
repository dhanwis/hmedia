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

const FullscreenAd = ({ ads }) => {
  const [show, setShow] = useState(false); // start hidden
  const [timeLeft, setTimeLeft] = useState(7);
  const location = useLocation();
  const playerRef = useRef(null);

  const ad = ads && ads.length > 0 ? ads[0] : null;
  const ytId = ad ? getYouTubeId(ad.link) : null;

  // const isLocalVideo =
  // ad?.image?.endsWith(".mp4") ||
  // ad?.image?.endsWith(".mov") ||
  // ad?.image?.endsWith(".webm");
  const isLocalVideo =
  /\.(mp4|mov|webm)(\?.*)?$/i.test(ad?.image || "");

  // ⏱ Show ad
  useEffect(() => {
    if (!ad) return;
    if (visitedRoutes.has(location.pathname)) return;

    const showTimer = setTimeout(() => {
      setShow(true);
      visitedRoutes.add(location.pathname);
    }, 200);

    return () => clearTimeout(showTimer);
  }, [location.pathname, ad]);

  // ⏱ Auto remove
  useEffect(() => {
    if (!show || ytId || isLocalVideo) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShow(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
      if (!document.getElementById("fullscreen-ad-player")) return;

      playerRef.current = new window.YT.Player("fullscreen-ad-player", {
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


      playerRef.current = new window.YT.Player("fullscreen-ad-player", {
  videoId: ytId,
  width: "100%",
  height: "100%",
  playerVars: {
    autoplay: 1,
    mute: 1,
    rel: 0,
    controls: 0,
    disablekb: 1,
    fs: 0,
    modestbranding: 1,
    iv_load_policy: 3,
    showinfo: 0,
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

  // const AdContent = ytId ? (
  //   <div className="w-full h-full bg-black flex items-center justify-center">
  //     <div id="fullscreen-ad-player" className="w-full h-full"></div>
  //   </div>
  // ) : (
  //   <div className="relative w-full h-full flex gap-0 ">
  //     {/* Left Half */}
  //     <div className="relative w-1/2 h-full overflow-hidden animate-slide-left">
  //       {/* Background Blur */}
  //       <div className="absolute top-0 left-0 w-[200%] h-full">
  //         <img
  //           src={ad.image}
  //           alt={ad.title || "Ad"}
  //           className="w-full h-full object-cover blur-2xl opacity-60 scale-110"
  //         />
  //         <div className="absolute inset-0 bg-black/40" />
  //       </div>
  //       <img
  //         src={ad.image}
  //         alt={ad.title || "Ad Left"}
  //         className="absolute top-0 left-0 w-[200%] h-full max-w-none object-contain md:object-fill z-10"
  //       />
  //     </div>

  //     {/* Right Half */}
  //     <div className="relative w-1/2 h-full overflow-hidden animate-slide-right">
  //       {/* Background Blur */}
  //       <div className="absolute top-0 right-0 w-[200%] h-full">
  //         <img
  //           src={ad.image}
  //           alt={ad.title || "Ad"}
  //           className="w-full h-full object-cover blur-2xl opacity-60 scale-110"
  //         />
  //         <div className="absolute inset-0 bg-black/40" />
  //       </div>
  //       <img
  //         src={ad.image}
  //         alt={ad.title || "Ad Right"}
  //         className="absolute top-0 right-0 w-[200%] h-full max-w-none object-contain md:object-fill z-10"
  //       />
  //     </div>
  //   </div>
  // );

  const AdContent = ytId ? (
  // ✅ YOUTUBE VIDEO
  <div className="w-full h-full  bg-black flex items-center justify-center">
    <div id="fullscreen-ad-player" className="w-full h-full"></div>
  </div>

)  : isLocalVideo ? (
  // ✅ UPLOADED VIDEO (.mp4)
  <div className="w-full h-full bg-black flex items-center justify-center relative">

    <video
      ref={playerRef}
      src={ad.image}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      controls={false}
      onEnded={() => setShow(false)}
    />

    {/* 🔊 Unmute Button */}
    <button
  onClick={() => {
    if (playerRef.current) {
      playerRef.current.muted = false;
      playerRef.current.volume = 1;
      playerRef.current.play();
    }
  }}
  className="absolute right-6 bottom-10 -translate-y-1/2 
  bg-white/90 hover:bg-white 
  text-black 
  px-5 py-3 
  rounded-full 
  font-semibold 
  shadow-xl 
  transition 
  backdrop-blur-md"
>
  🔊
</button>
  </div>

) : (
  // ✅ IMAGE AD
  <div className="relative w-full h-full flex gap-0">
    {/* Left Half */}
    <div className="relative w-1/2 h-full overflow-hidden animate-slide-left">
      <div className="absolute top-0 left-0 w-[200%] h-full">
        <img
          src={ad.image}
          alt={ad.title || "Ad"}
          className="w-full h-full object-cover blur-2xl opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <img
        src={ad.image}
        alt={ad.title || "Ad Left"}
        className="absolute top-0 left-0 w-[200%] h-full max-w-none object-contain md:object-fill z-10"
      />
    </div>

    {/* Right Half */}
    <div className="relative w-1/2 h-full overflow-hidden animate-slide-right">
      <div className="absolute top-0 right-0 w-[200%] h-full">
        <img
          src={ad.image}
          alt={ad.title || "Ad"}
          className="w-full h-full object-cover blur-2xl opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <img
        src={ad.image}
        alt={ad.title || "Ad Right"}
        className="absolute top-0 right-0 w-[200%] h-full max-w-none object-contain md:object-fill z-10"
      />
    </div>
  </div>
);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Close Button */}
      {/* <button
        onClick={() => setShow(false)}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 group"
      >
        <span className="text-xs font-medium">
          {ytId ? "Close" : `Skip in ${timeLeft}s`}
        </span>
        <X size={18} className="group-hover:scale-110 transition-transform" />
      </button> */}

      {/* Close Button (ONLY for image ads) */}
{!ytId && !isLocalVideo &&  (
  <button
    onClick={() => setShow(false)}
    className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 group"
  >
    <span className="text-xs font-medium">
      Skip in {timeLeft}s
    </span>
    <X size={18} className="group-hover:scale-110 transition-transform" />
  </button>
)}


      {/* Video message overlay
{ytId && (
  // <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white px-8 py-3 rounded-xl backdrop-blur-md border border-white/10 text-lg font-semibold text-xl">
  //   📰 News will be shown after this video.
  // </div>


  <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-50 
  bg-black/60 text-white 
  px-4 sm:px-6 md:px-8 
  py-2 sm:py-2.5 md:py-3 
  rounded-lg sm:rounded-xl 
  backdrop-blur-md border border-white/10 
  text-sm sm:text-base md:text-lg 
  font-semibold 
  w-[90%] sm:w-auto 
  text-center">
  
  📰 News will be shown after this video.
</div>

)} */}
{(ytId || isLocalVideo) && (
  <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-50 
  bg-black/60 text-white 
  px-4 sm:px-6 md:px-8 
  py-2 sm:py-2.5 md:py-3 
  rounded-lg sm:rounded-xl 
  backdrop-blur-md border border-white/10 
  text-sm sm:text-base md:text-lg 
  font-semibold 
  w-[90%] sm:w-auto 
  text-center">
  
  📰 News will be shown after this video.
  
  </div>
)}

      {/* Ad Container */}
      {ytId ? (
        AdContent
      ) : ad.link ? (
        isSameSite(ad.link) ? (
          <Link
            to={new URL(ad.link, window.location.origin).pathname}
            onClick={handleSameSiteClick}
            className="w-full h-full block"
          >
            {AdContent}
          </Link>
        ) : (
          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
            {AdContent}
          </a>
        )
      ) : (
        AdContent
      )}
    </div>
  );
};

export default FullscreenAd;
