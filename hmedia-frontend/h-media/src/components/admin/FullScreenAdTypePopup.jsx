import { X, Image as ImageIcon, Video } from "lucide-react";

export default function FullScreenAdTypePopup({
  isOpen,
  onClose,
  onSelect,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      // onClick={onClose}
    >
      <div
        className="bg-gray-800 w-full max-w-xl rounded-lg border border-gray-700 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold">
            Select Full Screen Advertisement Type
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect("image")}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-900 rounded-lg border-2 border-gray-700 hover:bg-gray-700 hover:border-brand-red transition-all"
          >
            <ImageIcon size={40} className="text-brand-red" />
            <span className="font-semibold text-lg">Image Ad</span>
          </button>

          <button
            onClick={() => onSelect("video")}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-900 rounded-lg border-2 border-gray-700 hover:bg-gray-700 hover:border-brand-red transition-all"
          >
            <Video size={40} className="text-brand-red" />
            <span className="font-semibold text-lg">Video Ad</span>
          </button>
        </div>
      </div>
    </div>
  );
}