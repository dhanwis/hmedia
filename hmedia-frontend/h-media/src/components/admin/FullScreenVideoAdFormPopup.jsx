import { useState, useEffect } from "react";
import { X, UploadCloud, ChevronDown } from "lucide-react";

const PAGE_TYPE_OPTIONS = [
  "Home",
  "Latest News",
  "Cinema News",
  "Meet The Person",
  "Business Stories",
  "News Detail",
];

export default function FullScreenVideoAdFormPopup({
  isOpen,
  onClose,
  onSubmit,
  ad,
  allAds = [],
}) {
  const [formData, setFormData] = useState({
    title: "",
    pageType: PAGE_TYPE_OPTIONS[0],
    link: "",
    status: "Active",
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
useEffect(() => {
  if (isOpen) {
    if (ad) {
      setFormData({
        title: ad.title || "",
        pageType: ad.page_type || PAGE_TYPE_OPTIONS[0],
        link: ad.link || "",
        status: ad.status ? "Active" : "Inactive",
      });

      if (ad?.image) {
        const fullUrl = ad.image.startsWith("http")
          ? ad.image
          : `http://127.0.0.1:8000${ad.image}`;

        console.log("VIDEO URL:", fullUrl);  // 👈 check this

        setVideoPreview(fullUrl);
      } else {
        setVideoPreview(null);
      }
    } else {
      setVideoPreview(null);
    }
  }
}, [ad, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));

      if (errors.video) {
        setErrors((prev) => ({ ...prev, video: null }));
      }
    }
  };

  const handleRemoveVideo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setVideoPreview(null);
    setVideoFile(null);

    const input = document.getElementById("video-upload");
    if (input) input.value = "";
  };

  const handlePageTypeSelect = (pageType) => {
    setFormData((prev) => ({ ...prev, pageType }));
    setDropdownOpen(false);

    const adExists = allAds.some(
      (existingAd) =>
       existingAd.page_type === pageType &&
existingAd.status === true &&
        existingAd.id !== ad?.id
    );

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (adExists) {
        newErrors.pageType =
          "Already one ACTIVE ad uploaded in this page";
      } else {
        delete newErrors.pageType;
      }
      return newErrors;
    });
  };
const validate = () => {
  const newErrors = {};

  if (!formData.title.trim())
    newErrors.title = "Title is required.";

  // ✅ Only require video when ADDING
  if (!ad && !videoFile) {
    newErrors.video = "A video is required.";
  }

  // ✅ If editing and user removed existing video without uploading new one
  if (ad && !videoFile && !videoPreview) {
    newErrors.video = "A video is required.";
  }

  const adExists = allAds.some(
    (existingAd) =>
      existingAd.page_type === formData.pageType &&
      existingAd.status === true &&
      existingAd.id !== ad?.id
  );

  if (adExists)
    newErrors.pageType =
      "Already one ACTIVE ad uploaded in this page";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!validate()) return;

//   try {
//     setIsSubmitting(true);

//     const payload = {
//       title: formData.title.trim(),
//       page_type: formData.pageType,
//       link: formData.link || "",
//       status: formData.status === "Active",
//       image: videoFile ? videoFile.name : videoPreview, 
//       // since backend expects STRING
//     };

//     await onSubmit(payload);

//     onClose();
//   } catch (error) {
//     console.error("Submit failed:", error);
//   } finally {
//     setIsSubmitting(false);
//   }
// };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    setIsSubmitting(true);

    const payload = {
      id: ad?.id, // 👈 VERY IMPORTANT FOR EDIT
      title: formData.title.trim(),
      page_type: formData.pageType,
      link: formData.link || "",
      status: formData.status === "Active",
      videoFile: videoFile || null,
      existingVideo: !videoFile ? videoPreview : null,
    };

    await onSubmit(payload);

    onClose(); // 👈 You forgot this earlier
  } catch (error) {
    console.error("Submit failed:", error);
  } finally {
    setIsSubmitting(false);
  }
};
  const formTitle = ad ? "Edit Full Screen Video Ad" : "Add Full Screen Video Ad";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 w-full max-w-4xl rounded-lg border border-gray-700 text-white max-h-[90vh] overflow-y-auto scrollbar-hide">

        {/* HEADER */}
        <div className="sticky top-0 bg-gray-800 flex justify-between items-center p-5 border-b border-gray-700 z-10">
          <h2 className="text-xl font-bold">{formTitle}</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <form
          id="fullscreen-video-ad-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          {/* VIDEO UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ad Video
            </label>

            <label
              htmlFor="video-upload"
              className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer"
            >
              <div className="text-center">
                {videoPreview ? (
                  <div className="relative inline-block">
                    <video
  key={videoPreview}
  src={videoPreview}
  controls
  autoPlay
  muted
  playsInline
  className="mx-auto h-40 rounded-md object-contain"
/>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Click to upload video
                    </p>
                    <p className="text-xs text-gray-500">
                      MP4 recommended
                    </p>
                  </>
                )}
              </div>
            </label>

            <input
              id="video-upload"
              type="file"
              className="sr-only"
              accept="video/*"
              onChange={handleVideoChange}
            />

            {errors.video && (
              <p className="mt-2 text-sm text-red-500">
                {errors.video}
              </p>
            )}
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 px-3 text-sm"
              placeholder="Enter Title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* PAGE TYPE + LINK + STATUS */}
          {/* EXACT SAME AS YOUR IMAGE FORM */}
          {/* Page Type */}
                    <div>
                      <div className="relative w-full">
                        <label
                          htmlFor="pageType"
                          className="block text-sm font-medium text-gray-300 mb-1"
                        >
                          Page Type
                        </label>
                        <button
                          type="button"
                          className="w-full sm:w-60 bg-gray-900 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all cursor-pointer"
                          onClick={() => setDropdownOpen((prev) => !prev)}
                        >
                          <span>{formData.pageType}</span>
                          <ChevronDown
                            size={20}
                            className="text-gray-400 transition-transform"
                          />
                        </button>
                        {dropdownOpen && (
                          <ul className="absolute z-50 mt-1 sm:w-60 w-full bg-gray-900 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-hide">
                            {PAGE_TYPE_OPTIONS.map((opt) => (
                              <li
                                key={opt}
                                className={`px-4 py-2 cursor-pointer text-gray-300 hover:bg-brand-red hover:text-white transition-colors ${
                                  formData.pageType === opt
                                    ? "bg-brand-red text-white"
                                    : ""
                                }`}
                                onClick={() => handlePageTypeSelect(opt)}
                              >
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.pageType && (
                        <p className="mt-1 text-sm text-red-500">{errors.pageType}</p>
                      )}
                    </div>
          
                    {/* Link (Optional) */}
                    <div>
                      <label
                        htmlFor="link"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Link (Optional)
                      </label>
                      <input
                        type="text"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg py-2.5 px-3 text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
          
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Status
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              status: prev.status === "Active" ? "Inactive" : "Active",
                            }))
                          }
                          className={`${
                            formData.status === "Active" ? "bg-green-500" : "bg-gray-600"
                          } h-6 w-11 rounded-full transition cursor-pointer`}
                          role="switch"
                          aria-checked={formData.status === "Active"}
                        >
                          <span
                            className={`${
                              formData.status === "Active"
                                ? "translate-x-3"
                                : "-translate-x-3"
                            } inline-block h-6 w-6 bg-white rounded-full transform transition`}
                          />
                        </button>
                        <span className="text-sm font-medium text-gray-300 w-14 text-right">
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </form>
          
                  <div className="sticky bottom-0 bg-gray-800 flex justify-end items-center gap-4 p-5 border-t border-gray-700">
                    <button
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    {/* <button
                      
                      form="fullscreen-video-ad-form"
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark transition-colors text-sm cursor-pointer flex items-center justify-center disabled:bg-brand-dark disabled:cursor-wait"
                    > */}
                    <button
  type="submit"
  form="fullscreen-video-ad-form"
  disabled={isSubmitting}
  className="px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark transition-colors text-sm cursor-pointer flex items-center justify-center disabled:bg-brand-dark disabled:cursor-wait"
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
                      ) : ad ? (
                        "Save Changes"
                      ) : (
                        "Add Full Screen Ad"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          }