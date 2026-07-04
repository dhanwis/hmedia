import { X } from "lucide-react";

export default function ImagePopup({ src, onClose }) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-3xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-black/60 p-2 rounded-full text-white hover:bg-black cursor-pointer"
        >
          <X size={20} />
        </button>

        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[90vh] rounded-lg shadow-xl object-contain"
        />
      </div>
    </div>
  );
}
