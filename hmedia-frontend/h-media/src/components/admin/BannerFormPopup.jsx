import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { useApi } from "../../context/ApiContext";
import { addBanner, updateBanner } from "../../services/bannerService";

export default function BannerFormPopup({ isOpen, onClose, banner }) {
  const { baseURL } = useApi();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("Active");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setLink(banner.link || "");
      setStatus(banner.status || "Active");

      if (banner.image) {
        // const imgUrl = `${baseURL}/${banner.image.replace(/\\/g, "/")}`;
        const imgUrl = `${baseURL}/${banner.image.replace(/\\/g, "/")}?v=${banner.updated_at || banner.created_at || Date.now()}`;


        setImagePreview(imgUrl);

        setImageFile(null);


      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    } else {
      setTitle("");
      setLink("");
      setStatus("Active");
      setImagePreview(null);
      setImageFile(null);
      setErrors({});
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  /* -----------------------------------------------
     Image Helpers
  ------------------------------------------------ */

  // Validate orientation (landscape only)
  const checkOrientation = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width > img.height) resolve("landscape");
        else resolve("portrait");
      };
    });
  };

  // Compress image to approx 500 KB
  const compressImage = (file, maxSizeKB = 500) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.9;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);

          while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => resolve(blob));
        };
      };
    });
  };

  /* -----------------------------------------------
     Updated handleImageChange (with orientation validation)
  ------------------------------------------------ */

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors((prev) => ({ ...prev, image: undefined }));

    // Validate orientation
    const orientation = await checkOrientation(file);
    if (orientation !== "landscape") {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a landscape image.",
      }));
      setImagePreview(null);
      setImageFile(null);
      return;
    }

    // Compress to ~500 KB
    const compressedBlob = await compressImage(file, 500);
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
    });

    // Set states
    setImageFile(compressedFile);
    setImagePreview(URL.createObjectURL(compressedFile));
  };

  /* -----------------------------------------------
     Remove Image
  ------------------------------------------------ */
  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    document.getElementById("file-upload").value = "";
  };

  /* -----------------------------------------------
     Validation & Submit
  ------------------------------------------------ */
  const formTitle = banner ? "Edit Banner" : "Add New Banner";

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required.";
    if (!imagePreview) newErrors.image = "Banner image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("status", status);

    if (link.trim()) {
      formData.append("link", link.trim());
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      let updatedBanner;
      if (banner) {
        updatedBanner = await updateBanner(baseURL, banner.id, formData);
      } else {
        updatedBanner = await addBanner(baseURL, formData);
      }

      onClose(updatedBanner);
      loadBanners();
    } catch (err) {
      console.log("Error submitting banner form");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -----------------------------------------------
     UI
  ------------------------------------------------ */

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 -top-8">
      <div className="bg-gray-800 w-full max-w-xl sm:max-w-2xl rounded-lg border border-gray-700 shadow-2xl text-white overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold">{formTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          id="banner-form"
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-5"
        >
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Image
            </label>

            <label
              htmlFor="file-upload"
              className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 
               border-2 border-gray-600 border-dashed rounded-md cursor-pointer"
            >
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 sm:h-40 rounded-md object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-500" />
                    <p className="text-xs sm:text-sm text-gray-400">
                      Click to upload or drag & drop
                    </p>
                  </>
                )}
              </div>
            </label>

            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleImageChange}
            />

            {/* IMAGE ERROR DISPLAYED HERE */}
            {errors.image && (
              <p className="mt-2 text-sm text-red-500">{errors.image}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-brand-red py-2 px-3"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* URL (Optional) */}
          <div>
            <label
              htmlFor="link"
              className="block text-sm font-medium text-gray-300"
            >
              Redirect URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-0 focus:border-brand-red py-2 px-3"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() =>
                  setStatus(status === "Active" ? "Inactive" : "Active")
                }
                className={`${
                  status === "Active" ? "bg-green-500" : "bg-gray-600"
                } h-6 w-11 rounded-full transition cursor-pointer`}
              >
                <span
                  className={`${
                    status === "Active" ? "translate-x-3" : "-translate-x-3"
                  } inline-block h-6 w-6 bg-white rounded-full transform transition`}
                />
              </button>
              <span className="text-sm text-gray-300">{status}</span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 p-4 sm:p-5 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="banner-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark cursor-pointer flex items-center justify-center disabled:bg-brand-dark disabled:cursor-wait"
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
            ) : banner ? (
              "Save Changes"
            ) : (
              "Create Banner"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
