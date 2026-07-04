// import { useState, useEffect } from "react";
// import { X, UploadCloud, ChevronDown } from "lucide-react";

// const PAGE_TYPE_OPTIONS = [
//   "Home",
//   "Latest News",
//   "Cinema News",
//   "Meet The Person",
//   "Business Stories",
//   "News Detail",
// ];

// export default function PopupAdFormPopup({
//   isOpen,
//   onClose,
//   onSubmit,
//   ad,
//   allAds = [],
// }) {
//   const [formData, setFormData] = useState({
//     title: "",
//     pageType: PAGE_TYPE_OPTIONS[0],
//     link: "",
//     status: "Active",
//   });
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       if (ad) {
//         setFormData({
//           title: ad.title || "",
//           pageType: ad.pageType || PAGE_TYPE_OPTIONS[0],
//           link: ad.link || "",
//           status: ad.status || "Active",
//         });
//         setImagePreview(ad.image || null);
//       } else {
//         setFormData({
//           title: "",
//           pageType: PAGE_TYPE_OPTIONS[0],
//           link: "",
//           status: "Active",
//         });
//         setImagePreview(null);
//       }
//       setImageFile(null);
//       setErrors({});
//       setIsSubmitting(false);
//     }
//   }, [ad, isOpen]);

//   if (!isOpen) return null;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     }
//   };

//   // const compressImage = (file, maxSizeKB = 500) => {
//   //   return new Promise((resolve) => {
//   //     const reader = new FileReader();
//   //     reader.readAsDataURL(file);
//   //     reader.onload = (event) => {
//   //       const img = new Image();
//   //       img.src = event.target.result;
//   //       img.onload = () => {
//   //         const canvas = document.createElement("canvas");
//   //         const ctx = canvas.getContext("2d");
//   //         canvas.width = img.width;
//   //         canvas.height = img.height;
//   //         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//   //         let quality = 0.9;
//   //         let dataUrl = canvas.toDataURL("image/jpeg", quality);
//   //         while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
//   //           quality -= 0.05;
//   //           dataUrl = canvas.toDataURL("image/jpeg", quality);
//   //         }
//   //         fetch(dataUrl)
//   //           .then((res) => res.blob())
//   //           .then((blob) => resolve(blob));
//   //       };
//   //     };
//   //   });
//   // };


//   const compressImage = (file, maxSizeKB = 500) => {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);

//     reader.onload = (event) => {
//       const img = new Image();
//       img.src = event.target.result;

//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");

//         canvas.width = img.width;
//         canvas.height = img.height;

//         ctx.drawImage(img, 0, 0);

//         let quality = 0.9;

//         const outputType =
//           file.type === "image/png" ? "image/png" : "image/jpeg";

//         let dataUrl = canvas.toDataURL(outputType, quality);

//         while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
//           quality -= 0.05;
//           dataUrl = canvas.toDataURL(outputType, quality);
//         }

//         fetch(dataUrl)
//           .then((res) => res.blob())
//           .then((blob) => resolve(blob));
//       };
//     };
//   });
// };

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const compressedBlob = await compressImage(file, 500);
//       const compressedFile = new File([compressedBlob], file.name, {
//         type: compressedBlob.type,
//       });
//       setImageFile(compressedFile);
//       setImagePreview(URL.createObjectURL(compressedFile));
//       if (errors.image) {
//         setErrors((prev) => ({ ...prev, image: null }));
//       }
//     }
//   };

//   const handleRemoveImage = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setImagePreview(null);
//     setImageFile(null);
//     const fileInput = document.getElementById("file-upload");
//     if (fileInput) {
//       fileInput.value = "";
//     }
//   };

//   const handlePageTypeSelect = (pageType) => {
//     setFormData((prev) => ({ ...prev, pageType }));
//     setDropdownOpen(false);

//     const adExists = allAds.some(
//       (existingAd) =>
//         existingAd.pageType === pageType && existingAd.id !== ad?.id
//     );

//     setErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       if (adExists) {
//         newErrors.pageType = "already one ad uploade in this page";
//       } else {
//         delete newErrors.pageType;
//       }
//       return newErrors;
//     });
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!formData.title.trim()) newErrors.title = "Title is required.";
//     if (!imagePreview) newErrors.image = "An image is required.";
//     const adExists = allAds.some(
//       (existingAd) =>
//         existingAd.pageType === formData.pageType && existingAd.id !== ad?.id
//     );
//     if (adExists) newErrors.pageType = "already one ad uploade in this page";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (validate()) {
//       setIsSubmitting(true);
//       await onSubmit({ ...formData, imageFile });
//       setIsSubmitting(false);
//     }
//   };

//   const formTitle = ad ? "Edit Popup Ad" : "Add Popup Ad";

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
//       <div className="bg-gray-800 w-full max-w-4xl rounded-lg border border-gray-700 shadow-sm text-white max-h-[90vh] overflow-y-auto scrollbar-hide">
//         <div className="sticky top-0 bg-gray-800 flex justify-between items-center p-5 border-b border-gray-700 z-10">
//           <h2 className="text-xl font-bold">{formTitle}</h2>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         <form id="popup-ad-form" onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Image Upload */}
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Ad Image
//             </label>
//             <label
//               htmlFor="file-upload"
//               className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer"
//             >
//               <div className="space-y-1 text-center">
//                 {imagePreview ? (
//                   <div className="relative inline-block">
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="mx-auto h-40 rounded-md object-contain"
//                     />
//                     <button
//                       type="button"
//                       onClick={handleRemoveImage}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
//                     <p className="text-sm text-gray-400">Click to upload</p>
//                     <p className="text-xs text-gray-500">
//                       Recommended: Square/Portrait
//                     </p>
//                   </>
//                 )}
//               </div>
//             </label>
//             <input
//               id="file-upload"
//               name="file-upload"
//               type="file"
//               className="sr-only"
//               onChange={handleImageChange}
//               accept="image/*"
//             />
//             {errors.image && (
//               <p className="mt-2 text-sm text-red-500">{errors.image}</p>
//             )}
//           </div>

//           {/* Title */}
//           <div>
//             <label
//               htmlFor="title"
//               className="block text-sm font-medium text-gray-300"
//             >
//               Title
//             </label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               className="mt-1 block w-full bg-gray-900 border focus:outline-none focus:ring-0 focus:border-brand-red border-gray-600 rounded-lg py-2.5 px-3 text-sm"
//               placeholder="Enter Title"
//             />
//             {errors.title && (
//               <p className="mt-1 text-sm text-red-500">{errors.title}</p>
//             )}
//           </div>

//           {/* Page Type */}
//           <div>
//             <div className="relative w-full">
//               <label
//                 htmlFor="pageType"
//                 className="block text-sm font-medium text-gray-300 mb-1"
//               >
//                 Page Type
//               </label>
//               <button
//                 type="button"
//                 className="w-full sm:w-60 bg-gray-900 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all cursor-pointer"
//                 onClick={() => setDropdownOpen((prev) => !prev)}
//               >
//                 <span>{formData.pageType}</span>
//                 <ChevronDown
//                   size={20}
//                   className="text-gray-400 transition-transform"
//                 />
//               </button>
//               {dropdownOpen && (
//                 <ul className="absolute z-50 mt-1 sm:w-60 w-full bg-gray-900 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-hide">
//                   {PAGE_TYPE_OPTIONS.map((opt) => (
//                     <li
//                       key={opt}
//                       className={`px-4 py-2 cursor-pointer text-gray-300 hover:bg-brand-red hover:text-white transition-colors ${
//                         formData.pageType === opt
//                           ? "bg-brand-red text-white"
//                           : ""
//                       }`}
//                       onClick={() => handlePageTypeSelect(opt)}
//                     >
//                       {opt}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             {errors.pageType && (
//               <p className="mt-1 text-sm text-red-500">{errors.pageType}</p>
//             )}
//           </div>

//           {/* Link (Optional) */}
//           <div>
//             <label
//               htmlFor="link"
//               className="block text-sm font-medium text-gray-300"
//             >
//               Link (Optional)
//             </label>
//             <input
//               type="text"
//               id="link"
//               name="link"
//               value={formData.link}
//               onChange={handleInputChange}
//               className="mt-1 block w-full bg-gray-900 border border-gray-600 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg py-2.5 px-3 text-sm"
//               placeholder="https://example.com"
//             />
//           </div>

//           {/* Status Toggle */}
//           <div className="flex items-center justify-between pt-2">
//             <label className="block text-sm font-medium text-gray-300">
//               Status
//             </label>
//             <div className="flex items-center gap-3">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     status: prev.status === "Active" ? "Inactive" : "Active",
//                   }))
//                 }
//                 className={`${
//                   formData.status === "Active"
//                     ? "bg-green-500"
//                     : "bg-gray-600"
//                 } h-6 w-11 rounded-full transition cursor-pointer`}
//                 role="switch"
//                 aria-checked={formData.status === "Active"}
//               >
//                 <span
//                   className={`${
//                     formData.status === "Active"
//                       ? "translate-x-3"
//                       : "-translate-x-3"
//                   } inline-block h-6 w-6 bg-white rounded-full transform transition`}
//                 />
//               </button>
//               <span className="text-sm font-medium text-gray-300 w-14 text-right">
//                 {formData.status}
//               </span>
//             </div>
//           </div>
//         </form>

//         <div className="sticky bottom-0 bg-gray-800 flex justify-end items-center gap-4 p-5 border-t border-gray-700">
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             form="popup-ad-form"
//             disabled={isSubmitting}
//             className="px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark transition-colors text-sm cursor-pointer flex items-center justify-center disabled:bg-brand-dark disabled:cursor-wait"
//           >
//             {isSubmitting ? (
//               <>
//                 <svg
//                   className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : ad ? (
//               "Save Changes"
//             ) : (
//               "Add Popup Ad"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




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

export default function PopupAdFormPopup({
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
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (ad) {
        setFormData({
          title: ad.title || "",
          pageType: ad.pageType || PAGE_TYPE_OPTIONS[0],
          link: ad.link || "",
          status: ad.status || "Active",
        });
        setImagePreview(ad.image || null);
      } else {
        setFormData({
          title: "",
          pageType: PAGE_TYPE_OPTIONS[0],
          link: "",
          status: "Active",
        });
        setImagePreview(null);
      }
      setImageFile(null);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [ad, isOpen]);

  if (!isOpen) return null;

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   if (errors[name]) {
  //     setErrors((prev) => ({ ...prev, [name]: null }));
  //   }
  // };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "link") {
      const thumbnail = getYoutubeThumbnail(value);

      if (thumbnail && !imagePreview) {
        try {
          const res = await fetch(thumbnail);
          const blob = await res.blob();

          const file = new File([blob], "youtube-thumbnail.jpg", {
            type: blob.type,
          });

          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));

          setErrors((prev) => ({ ...prev, image: null }));
        } catch (err) {
          console.error("Thumbnail fetch failed");
        }
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // const compressImage = (file, maxSizeKB = 500) => {
  //   return new Promise((resolve) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = (event) => {
  //       const img = new Image();
  //       img.src = event.target.result;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         const ctx = canvas.getContext("2d");
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //         let quality = 0.9;
  //         let dataUrl = canvas.toDataURL("image/jpeg", quality);
  //         while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
  //           quality -= 0.05;
  //           dataUrl = canvas.toDataURL("image/jpeg", quality);
  //         }
  //         fetch(dataUrl)
  //           .then((res) => res.blob())
  //           .then((blob) => resolve(blob));
  //       };
  //     };
  //   });
  // };

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

          ctx.drawImage(img, 0, 0);

          let quality = 0.9;

          const outputType =
            file.type === "image/png" ? "image/png" : "image/jpeg";

          let dataUrl = canvas.toDataURL(outputType, quality);

          while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL(outputType, quality);
          }

          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => resolve(blob));
        };
      };
    });
  };

  const getYoutubeThumbnail = (url) => {
    if (!url) return null;

    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;

    const match = url.match(regExp);

    if (!match) return null;

    const videoId = match[1];

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBlob = await compressImage(file, 500);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });
      setImageFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // const handlePageTypeSelect = (pageType) => {
  //   setFormData((prev) => ({ ...prev, pageType }));
  //   setDropdownOpen(false);

  //   const adExists = allAds.some(
  //     (existingAd) =>
  //       existingAd.pageType === pageType && existingAd.id !== ad?.id,
  //   );

  //   setErrors((prevErrors) => {
  //     const newErrors = { ...prevErrors };
  //     if (adExists) {
  //       newErrors.pageType = "already one ad uploade in this page";
  //     } else {
  //       delete newErrors.pageType;
  //     }
  //     return newErrors;
  //   });
  // };

  const handlePageTypeSelect = (pageType) => {
  setFormData((prev) => ({ ...prev, pageType }));
  setDropdownOpen(false);

  const adExists = allAds.some(
    (existingAd) =>
      existingAd.pageType === pageType &&
      existingAd.status === "Active" &&
      existingAd.id !== ad?.id
  );

  setErrors((prevErrors) => {
    const newErrors = { ...prevErrors };
    if (adExists) {
      newErrors.pageType = "Already one ACTIVE ad uploaded in this page";
    } else {
      delete newErrors.pageType;
    }
    return newErrors;
  });
};


  // const validate = () => {
  //   const newErrors = {};
  //   if (!formData.title.trim()) newErrors.title = "Title is required.";
  //   if (!imagePreview) newErrors.image = "An image is required.";
  //   const adExists = allAds.some(
  //     (existingAd) =>
  //       existingAd.pageType === formData.pageType && existingAd.id !== ad?.id,
  //   );
  //   if (adExists) newErrors.pageType = "already one ad uploade in this page";
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };


  const validate = () => {
  const newErrors = {};

  if (!formData.title.trim()) newErrors.title = "Title is required.";
  if (!imagePreview) newErrors.image = "An image is required.";

  const adExists = allAds.some(
    (existingAd) =>
      existingAd.pageType === formData.pageType &&
      existingAd.status === "Active" &&
      existingAd.id !== ad?.id
  );

  if (adExists) {
    newErrors.pageType = "Already one ACTIVE ad uploaded in this page";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await onSubmit({ ...formData, imageFile });
      setIsSubmitting(false);
    }
  };

  const formTitle = ad ? "Edit Popup Ad" : "Add Popup Ad";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 w-full max-w-4xl rounded-lg border border-gray-700 shadow-sm text-white max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-gray-800 flex justify-between items-center p-5 border-b border-gray-700 z-10">
          <h2 className="text-xl font-bold">{formTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <form
          id="popup-ad-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ad Image
            </label>
            <label
              htmlFor="file-upload"
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer"
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-40 rounded-md object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="text-sm text-gray-400">Click to upload</p>
                    <p className="text-xs text-gray-500">
                      Recommended: Square/Portrait
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
              onChange={handleImageChange}
              accept="image/*"
            />
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
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-900 border focus:outline-none focus:ring-0 focus:border-brand-red border-gray-600 rounded-lg py-2.5 px-3 text-sm"
              placeholder="Enter Title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

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
          <button
            type="submit"
            form="popup-ad-form"
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
              "Add Popup Ad"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}