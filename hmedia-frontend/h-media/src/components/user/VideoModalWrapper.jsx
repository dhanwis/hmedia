import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";


export default function VideoPlayerWrapper({ teasers }) {
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
      const hasTzInfo = /Z|[+-]\d{2}:?\d{2}$/.test(dateString);

      let date;
      if (isDateOnly) {
        const [y, m, d] = dateString.split("-").map(Number);
        date = new Date(Date.UTC(y, m - 1, d));
      } else if (/T/.test(dateString) && !hasTzInfo) {
        date = new Date(dateString + "Z");
      } else {
        date = new Date(dateString);
      }

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {teasers.map((item) => {
          // Robust YouTube ID extraction to handle watch?v=, youtu.be/, and embed/ URLs
          const getYouTubeId = (url) => {
            if (!url) return null;
            const patterns = [
              /[?&]v=([^&]+)/, // watch?v=
              /youtu\.be\/([^?&/]+)/, // youtu.be/
              /\/embed\/([^?&/]+)/, // /embed/
            ];
            for (const p of patterns) {
              const m = url.match(p);
              if (m && m[1]) return m[1];
            }
            const m = url.match(/([A-Za-z0-9_-]{11})/);
            return m ? m[1] : null;
          };

          const videoId =
            getYouTubeId(item.video_url) || item.youtubeId || null;
          if (!videoId) {
            console.warn(
              "Unable to parse YouTube ID from:",
              item.video_url,
              "item id:",
              item.id
            );
          }

          const thumbnail =
            item.thumbnail ||
            (videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : null);

          return (
            <VideoCard
              key={item.id}
              thumbnail={thumbnail}
              title={item.video_title}
              date={formatDate(item.published_date)}
              onClick={videoId ? () => setPlayingVideoId(videoId) : undefined}
            />
          );
        })}
      </div>

      <VideoPlayerModal
        youtubeId={playingVideoId}
        onClose={() => setPlayingVideoId(null)}
      />
    </>
  );
}
