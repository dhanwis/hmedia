import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function VideoPlayerModal({ youtubeId, onClose }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (youtubeId) {
      // When modal is open, disable body scroll
      document.body.classList.add("overflow-hidden");
      // Hide any global loader that might be stuck
      window.dispatchEvent(new Event("hide-loader"));
    } else {
      // When modal is closed, re-enable body scroll
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to ensure scroll is re-enabled when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [youtubeId]);

  useEffect(() => {
    if (!youtubeId) return;

    const onPlayerStateChange = (event) => {
      // YT.PlayerState.ENDED is 0
      if (event.data === 0) {
        onClose();
      }
    };

    const initializePlayer = () => {
      if (!document.getElementById("video-player-modal-container")) return;

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("video-player-modal-container", {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
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
  }, [youtubeId, onClose]);

  if (!youtubeId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => {
        window.dispatchEvent(new Event("hide-loader"));
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video player
      >
        <button
          onClick={() => {
            window.dispatchEvent(new Event("hide-loader"));
            onClose();
          }}
          className="absolute -top-3 -right-3 z-10 bg-white text-black rounded-full p-1.5 hover:bg-gray-200 transition-transform hover:scale-110 cursor-pointer"
          aria-label="Close video player"
        >
          <X size={20} />
        </button>
        <div id="video-player-modal-container" className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
