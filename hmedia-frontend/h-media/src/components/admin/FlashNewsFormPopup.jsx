import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function FlashNewsFormPopup({
  isOpen,
  onClose,
  onSubmit,
  newsItem,
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Active");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (newsItem) {
        setTitle(newsItem.title || "");
        setStatus(newsItem.status || "Active");
        setUrl(newsItem.link  || "");
      } else {
        // Reset for new entry
        setTitle("");
        setStatus("Active");
        setUrl("");
      }
      setError(""); // Clear errors when opening
      setIsSubmitting(false); // Reset submitting state
    }
  }, [isOpen, newsItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title, status, url });
    } catch (err) {
      console.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = newsItem ? "Edit Flash News" : "Add Flash News";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 w-full max-w-3xl rounded-lg border border-gray-700 shadow-2xl text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold">{formTitle}</h2>
          <button
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          id="flashnews-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:border-brand-red text-sm"
              placeholder="Enter flash news title"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          {/* URL (Optional) */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-300"
            >
              URL (optional)
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:border-brand-red text-sm"
              placeholder="https://example.com"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
              Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setStatus(status === "Active" ? "Inactive" : "Active")
                }
                className={`${
                  status === "Active" ? "bg-green-500" : "bg-gray-600"
                } h-6 w-11 rounded-full transition cursor-pointer`}
                role="switch"
                aria-checked={status === "Active"}
              >
                <span
                  className={`${
                    status === "Active" ? "translate-x-3" : "-translate-x-3"
                  } inline-block h-6 w-6 bg-white rounded-full transform transition`}
                />
              </button>
              <span className="text-sm font-medium text-gray-300">
                {status}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end items-center gap-4 p-5 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="flashnews-form"
            disabled={isSubmitting}
            className="w-46 px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark transition-colors text-sm cursor-pointer flex items-center justify-center disabled:bg-brand-dark disabled:cursor-wait"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : newsItem ? (
              "Save Changes"
            ) : (
              "Add News"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
