import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useApi } from "../../context/ApiContext";
import { fetchFlashNews } from "../../services/flashNewsService";
import VideoPlayerModal from "./VideoPlayerModal";

import { Link } from "react-router-dom";

export default function FlashNews() {
  const { baseURL } = useApi();
  const [flash, setFlash] = useState([]);
  const [youtubeId, setYoutubeId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFlashNews(baseURL);

        const activeNews = data
          .filter((item) => item.status?.toLowerCase() === "active")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFlash(activeNews);
      } catch (err) {
        console.error("Flash News Load Error");
      }
    }

    load();
  }, [baseURL]);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isSameSite = (url) => {
    try {
      return (
        new URL(url, window.location.origin).origin === window.location.origin
      );
    } catch {
      return false;
    }
  };

  if (!flash.length)
    return (
      <div className="bg-brand-red text-white py-2 text-center text-xs sm:text-sm font-bold leading-tight">
        Loading flash news...
      </div>
    );

  // Duplicate list for seamless looping
  const duplicated = [...flash, ...flash];

  return (
    <div className="bg-brand-red ">
      <div className="container mx-auto text-white py-2 overflow-hidden flex items-center relative">
        {/* Flash News Label */}
        <div className="px-2 sm:px-4 py-2 mx-2 sm:mx-4 rounded-md bg-brand-dark text-white font-semibold text-xs sm:text-sm uppercase shadow-md">
          Flash News
        </div>

        {/* Marquee */}
        <div className="relative flex-1 overflow-hidden">
          <div className="marquee whitespace-nowrap flex gap-12">
            {duplicated.map((item, i) => {
              const ytId = getYoutubeId(item.link);

              const Content = (
                <>
                  <Zap
                    size={28}
                    className="text-yellow-300 fill-yellow-300 mt-1"
                  />
                  <p className="mt-2.5 lg:mt-[8px]">{item.title}</p>
                </>
              );

              return (
                <span
                  key={i}
                  className="flex items-center gap-2 text-white/90 font-bold leading-tight text-sm sm:text-lg font-mal"
                >
                  {ytId ? (
                    /* YOUTUBE → MODAL */
                    <span
                      onClick={() => setYoutubeId(ytId)}
                      className="flex items-center gap-2 cursor-pointer hover:underline"
                    >
                      {Content}
                    </span>
                  ) : item.link ? (
                    /* LINK */
                    isSameSite(item.link) ? (
                      <Link
                        to={new URL(item.link, window.location.origin).pathname}
                        className="flex items-center gap-2 cursor-pointer hover:underline"
                      >
                        {Content}
                      </Link>
                    ) : (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer hover:underline"
                      >
                        {Content}
                      </a>
                    )
                  ) : (
                    /* NO LINK */
                    <span className="flex items-center gap-2 cursor-default">
                      {Content}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <VideoPlayerModal
          youtubeId={youtubeId}
          onClose={() => setYoutubeId(null)}
        />
      </div>

      <style>{`
  .marquee {
    display: inline-flex;
    animation: marquee 60s linear infinite;
  }
  .marquee:hover {
    animation-play-state: paused;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`}</style>
    </div>
  );
}
