import { useState } from "react";
import { PlayCircle } from "lucide-react";

export default function VideoCard({
  thumbnail,

  title,
  date,
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="group cursor-pointer flex flex-col gap-3 mb-8"
      onClick={onClick}
    >
      {/* Thumbnail Wrapper */}
      <div className="relative overflow-hidden rounded-lg aspect-video">
        {/* Image with Zoom Effect or fallback */}
        {!imgError && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <PlayCircle
              size={50}
              className="text-brand-red"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Dark Overlay & Play Button */}
        <div className="absolute inset-0  group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <PlayCircle
            size={50}
            className="text-brand-red group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Video Details */}
      <div>
        <h3 className="font-bold text-lg group-hover:text-brand-red transition-colors mt-1 font-mal line-clamp-2">
          {title}
        </h3>

        <p className="text-xs text-gray-500 mt-2">{date}</p>
      </div>
    </div>
  );
}
