import { X, RectangleHorizontal, Square } from "lucide-react";

export default function AdvertisementTypePopup({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 w-2xl max-w-2xl rounded-lg border border-gray-700 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold">Select Advertisement Type</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect("banner")}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-900 rounded-lg border-2 border-gray-700 hover:bg-gray-700 transition-all focus:outline-none cursor-pointer"
          >
            <RectangleHorizontal size={40} className="text-brand-red" />
            <span className="font-semibold text-lg">Banner Ad</span>
            <span className="text-xs text-gray-400 text-center">
              Uses a wide, full-width layout design.
            </span>
          </button>
          <button
            onClick={() => onSelect("square")}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-900 rounded-lg border-2 border-gray-700 hover:bg-gray-700 transition-all focus:outline-none cursor-pointer"
          >
            <Square size={40} className="text-brand-red" />
            <span className="font-semibold text-lg">Square Ad</span>
            <span className="text-xs text-gray-400 text-center">
              Uses a boxed layout for side sections and content.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
