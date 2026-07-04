// import { useState, useEffect } from "react";
// import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
// import DynamicTable from "../../components/admin/DynamicTable";
// import Pagination from "../../components/admin/Pagination";
// import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
// import FullScreenAdFormPopup from "../../components/admin/FullScreenAdFormPopup";
// import { useApi } from "../../context/ApiContext";
// import {
//   addFullScreenAd,
//   deleteFullScreenAd,
//   fetchFullScreenAds,
//   updateFullScreenAd,
// } from "../../services/fullScreenAdService";
// import AdvertisementTypePopup from "../../components/admin/AdvertisementTypePopup";

// function AdminFullScreenAd() {
//   const { baseURL } = useApi();
//   const [ads, setAds] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
//   const [adToDelete, setAdToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [filterPageType, setFilterPageType] = useState("All");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   // const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  
//   // Popup states
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [editingAd, setEditingAd] = useState(null);

//   const ITEMS_PER_PAGE = 10;

//   const loadAds = async () => {
//     try {
//       const data = await fetchFullScreenAds(baseURL);
//       const formattedAds = data.map((ad) => ({
//         ...ad,
//         //old image code 
//         // image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//         //new image replacement code
//         image: `${baseURL}/${ad.image.replace(/\\/g, "/")}?v=${ad.id}`,

//         pageType: ad.page_type,
//         status: ad.status ? "Active" : "Inactive",
//       }));
//       setAds(formattedAds);
//     } catch (error) {
//       console.error("Failed to load fullscreen ads", error);
//     }
//   };

//   useEffect(() => {
//     loadAds();
//   }, [baseURL]);

//   const handleAddNew = () => {
//     setEditingAd(null);
//     setIsPopupOpen(true);
//   };

//   const handleEdit = (ad) => {
//     setEditingAd(ad);
//     setIsPopupOpen(true);
//   };

//   const handleFormSubmit = async (formData) => {
//     try {
//       const data = new FormData();
//       data.append("title", formData.title);
//       data.append("page_type", formData.pageType);
//       data.append("link", formData.link);
//       data.append("status", formData.status === "Active" ? "true" : "false");

//       if (formData.imageFile) {
//         data.append("image", formData.imageFile);
//       }

//       if (editingAd) {
//         await updateFullScreenAd(baseURL, editingAd.id, data);
//       } else {
//         await addFullScreenAd(baseURL, data);
//       }
//       setIsPopupOpen(false);
//       setEditingAd(null);
//       loadAds();
//     } catch (error) {
//       console.error("Failed to save ad", error);
//     }
//   };

//   const handleDelete = (ad) => {
//     setAdToDelete(ad);
//     setIsDeletePopupOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!adToDelete) return;
//     setIsDeleting(true);
//     try {
//       await deleteFullScreenAd(baseURL, adToDelete.id);
//       loadAds();
//       setIsDeletePopupOpen(false);
//       setAdToDelete(null);
//     } catch (error) {
//       console.error("Failed to delete ad");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const pageTypes = ["All", ...new Set(ads.map((ad) => ad.pageType))];

//   const filteredAds = ads.filter(
//     (ad) => filterPageType === "All" || ad.pageType === filterPageType
//   );

//   const handleFilterChange = (type) => {
//     setFilterPageType(type);
//     setCurrentPage(1);
//     setIsDropdownOpen(false);
//   };

//   const columns = [
//     {
//       header: "Sl. No.",
//       cell: (_, index) => (
//         <span>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
//       ),
//     },
//     {
//       header: "Title",
//       accessor: "title",
//       cellClassName: "font-medium text-gray-900",
//     },
//     {
//       header: "Image",
//       accessor: "image",
//       type: "image",
//     },
//     {
//       header: "Page Type",
//       accessor: "pageType",
//     },
//     {
//       header: "Status",
//       accessor: "status",
//       cell: (row) => (
//         <span
//           className={`px-2 py-1 text-xs font-semibold rounded-full ${
//             row.status === "Active"
//               ? "bg-green-100 text-green-800"
//               : "bg-gray-100 text-gray-800"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: "Actions",
//       cell: (row) => (
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handleEdit(row)}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
//             title="Edit"
//           >
//             <Edit size={18} />
//           </button>
//           <button
//             onClick={() => handleDelete(row)}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
//             title="Delete"
//           >
//             <Trash2 size={18} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // Pagination logic
//   const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
//   const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
//   const currentAds = filteredAds.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredAds.length / ITEMS_PER_PAGE);

//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold">
//             Full Screen Advertisement
//           </h1>
//           <p className="text-gray-700 mt-1 text-sm md:text-base">
//             Manage full screen advertisements.
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
//           <div className="w-full sm:w-auto relative">
//             <button
//               type="button"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               className="w-full sm:w-60 bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all cursor-pointer"
//             >
//               <span>{filterPageType}</span>
//               <ChevronDown
//                 size={20}
//                 className="text-gray-400 transition-transform"
//               />
//             </button>

//             {isDropdownOpen && (
//               <ul className="absolute z-50 mt-1 sm:w-60 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
//                 {pageTypes.map((type) => (
//                   <li
//                     key={type}
//                     onClick={() => handleFilterChange(type)}
//                     className="cursor-pointer px-4 py-2 hover:bg-brand-red hover:text-white transition-colors"
//                   >
//                     {type}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <button
//             onClick={handleAddNew}
//             className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center"
//           >
//             <Plus size={20} />
//             Add Full Screen Ad
//           </button>
//         </div>
//       </div>

//       <DynamicTable columns={columns} data={currentAds} search={false} />

//       {filteredAds.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       )}

//       <FullScreenAdFormPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         onSubmit={handleFormSubmit}
//         ad={editingAd}
//         allAds={ads}
//       />
      
//       {/* <AdvertisementTypePopup
//        isOpen={isPopupOpen}
//        onClose={() => setIsPopupOpen(false)}
//        onSubmit={handleFormSubmit}
//       /> */}

//       <ConfirmationPopup
//         isOpen={isDeletePopupOpen}
//         onClose={() => setIsDeletePopupOpen(false)}
//         onConfirm={confirmDelete}
//         title="Delete Advertisement"
//         message="Are you sure you want to delete this ad?"
//         isConfirming={isDeleting}
//       />
//     </div>
//   );
// }

// export default AdminFullScreenAd;




// import { useState, useEffect } from "react";
// import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
// import DynamicTable from "../../components/admin/DynamicTable";
// import Pagination from "../../components/admin/Pagination";
// import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
// import FullScreenAdFormPopup from "../../components/admin/FullScreenAdFormPopup";
// import { useApi } from "../../context/ApiContext";
// import {
//   addFullScreenAd,
//   deleteFullScreenAd,
//   fetchFullScreenAds,
//   updateFullScreenAd,
// } from "../../services/fullScreenAdService";

// function AdminFullScreenAd() {
//   const { baseURL } = useApi();
//   const [ads, setAds] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
//   const [adToDelete, setAdToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [filterPageType, setFilterPageType] = useState("All");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Popup states
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [editingAd, setEditingAd] = useState(null);

//   const ITEMS_PER_PAGE = 10;

//   // ✅ YouTube Thumbnail Extractor
//   const getYoutubeThumbnail = (url) => {
//     if (!url) return null;

//     const regExp =
//       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;

//     const match = url.match(regExp);

//     if (!match) return null;

//     const videoId = match[1];

//     return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
//   };

//   const loadAds = async () => {
//     try {
//       const data = await fetchFullScreenAds(baseURL);

//       const formattedAds = data.map((ad) => {
//         const youtubeThumb = getYoutubeThumbnail(ad.link);

//         return {
//           ...ad,
//           image: youtubeThumb
//             ? youtubeThumb
//             : `${baseURL}/${ad.image.replace(/\\/g, "/")}?v=${ad.id}`,
//           pageType: ad.page_type,
//           status: ad.status ? "Active" : "Inactive",
//         };
//       });

//       setAds(formattedAds);
//     } catch (error) {
//       console.error("Failed to load fullscreen ads", error);
//     }
//   };

//   useEffect(() => {
//     loadAds();
//   }, [baseURL]);

//   const handleAddNew = () => {
//     setEditingAd(null);
//     setIsPopupOpen(true);
//   };

//   const handleEdit = (ad) => {
//     setEditingAd(ad);
//     setIsPopupOpen(true);
//   };

//   const handleFormSubmit = async (formData) => {
//     try {
//       const data = new FormData();
//       data.append("title", formData.title);
//       data.append("page_type", formData.pageType);
//       data.append("link", formData.link);
//       data.append("status", formData.status === "Active" ? "true" : "false");

//       if (formData.imageFile) {
//         data.append("image", formData.imageFile);
//       }

//       if (editingAd) {
//         await updateFullScreenAd(baseURL, editingAd.id, data);
//       } else {
//         await addFullScreenAd(baseURL, data);
//       }

//       setIsPopupOpen(false);
//       setEditingAd(null);
//       loadAds();
//     } catch (error) {
//       console.error("Failed to save ad", error);
//     }
//   };

//   const handleDelete = (ad) => {
//     setAdToDelete(ad);
//     setIsDeletePopupOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!adToDelete) return;

//     setIsDeleting(true);

//     try {
//       await deleteFullScreenAd(baseURL, adToDelete.id);
//       loadAds();
//       setIsDeletePopupOpen(false);
//       setAdToDelete(null);
//     } catch (error) {
//       console.error("Failed to delete ad");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const pageTypes = ["All", ...new Set(ads.map((ad) => ad.pageType))];

//   const filteredAds = ads.filter(
//     (ad) => filterPageType === "All" || ad.pageType === filterPageType
//   );

//   const handleFilterChange = (type) => {
//     setFilterPageType(type);
//     setCurrentPage(1);
//     setIsDropdownOpen(false);
//   };

//   const columns = [
//     {
//       header: "Sl. No.",
//       cell: (_, index) => (
//         <span>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
//       ),
//     },
//     {
//       header: "Title",
//       accessor: "title",
//       cellClassName: "font-medium text-gray-900",
//     },
//     {
//       header: "Image",
//       accessor: "image",
//       type: "image",
//     },
//     {
//       header: "Page Type",
//       accessor: "pageType",
//     },
//     {
//       header: "Status",
//       accessor: "status",
//       cell: (row) => (
//         <span
//           className={`px-2 py-1 text-xs font-semibold rounded-full ${
//             row.status === "Active"
//               ? "bg-green-100 text-green-800"
//               : "bg-gray-100 text-gray-800"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//     },
//     {
//       header: "Actions",
//       cell: (row) => (
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handleEdit(row)}
//             className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
//             title="Edit"
//           >
//             <Edit size={18} />
//           </button>

//           <button
//             onClick={() => handleDelete(row)}
//             className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
//             title="Delete"
//           >
//             <Trash2 size={18} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // Pagination logic
//   const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
//   const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
//   const currentAds = filteredAds.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredAds.length / ITEMS_PER_PAGE);

//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold">
//             Full Screen Advertisement
//           </h1>
//           <p className="text-gray-700 mt-1 text-sm md:text-base">
//             Manage full screen advertisements.
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
//           <div className="w-full sm:w-auto relative">
//             <button
//               type="button"
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               className="w-full sm:w-60 bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all cursor-pointer"
//             >
//               <span>{filterPageType}</span>
//               <ChevronDown
//                 size={20}
//                 className="text-gray-400 transition-transform"
//               />
//             </button>

//             {isDropdownOpen && (
//               <ul className="absolute z-50 mt-1 sm:w-60 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
//                 {pageTypes.map((type) => (
//                   <li
//                     key={type}
//                     onClick={() => handleFilterChange(type)}
//                     className="cursor-pointer px-4 py-2 hover:bg-brand-red hover:text-white transition-colors"
//                   >
//                     {type}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <button
//             onClick={handleAddNew}
//             className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center"
//           >
//             <Plus size={20} />
//             Add Full Screen Ad
//           </button>
//         </div>
//       </div>

//       <DynamicTable columns={columns} data={currentAds} search={false} />

//       {filteredAds.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       )}

//       <FullScreenAdFormPopup
//         isOpen={isPopupOpen}
//         onClose={() => setIsPopupOpen(false)}
//         onSubmit={handleFormSubmit}
//         ad={editingAd}
//         allAds={ads}
//       />

//       <ConfirmationPopup
//         isOpen={isDeletePopupOpen}
//         onClose={() => setIsDeletePopupOpen(false)}
//         onConfirm={confirmDelete}
//         title="Delete Advertisement"
//         message="Are you sure you want to delete this ad?"
//         isConfirming={isDeleting}
//       />
//     </div>
//   );
// }

// export default AdminFullScreenAd;


import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import DynamicTable from "../../components/admin/DynamicTable";
import Pagination from "../../components/admin/Pagination";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import FullScreenAdFormPopup from "../../components/admin/FullScreenAdFormPopup";
import { useApi } from "../../context/ApiContext";
import FullScreenAdTypePopup from "../../components/admin/FullScreenAdTypePopup";
import FullScreenVideoAdFormPopup from "../../components/admin/FullScreenVideoAdFormPopup";
import {
  addFullScreenAd,
  deleteFullScreenAd,
  fetchFullScreenAds,
  updateFullScreenAd,
} from "../../services/fullScreenAdService";

function AdminFullScreenAd() {
  const { baseURL } = useApi();
  const [ads, setAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterPageType, setFilterPageType] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  

  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const [isTypePopupOpen, setIsTypePopupOpen] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // ✅ YouTube Thumbnail Extractor
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;

    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;

    const match = url.match(regExp);

    if (!match) return null;

    const videoId = match[1];

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const loadAds = async () => {
    try {
      const data = await fetchFullScreenAds(baseURL);

    console.log("Backend Response:", data);  // 👈 ADD THIS

      // const formattedAds = data.map((ad) => {
      //   const youtubeThumb = getYoutubeThumbnail(ad.link);

      //   return {
      //     ...ad,
      //     ad_type: ad.ad_type,   // 👈 ADD THIS
      //     image: youtubeThumb
      //       ? youtubeThumb
      //       : `${baseURL}/${ad.image.replace(/\\/g, "/")}?v=${ad.id}`,
      //     pageType: ad.page_type,
      //     status: ad.status ? "Active" : "Inactive",
      //   };
      // });

      const formattedAds = data.map((ad) => {
  const youtubeThumb = getYoutubeThumbnail(ad.link);

  // 🔥 Detect video from file extension
  const isVideo =
    ad.image?.endsWith(".mp4") ||
    ad.image?.endsWith(".mov") ||
    ad.image?.endsWith(".webm");

  return {
    ...ad,
    ad_type: isVideo ? "video" : "image",  // 👈 THIS FIXES EDIT
    image: youtubeThumb
      ? youtubeThumb
      : `${baseURL}/${ad.image.replace(/\\/g, "/")}?v=${ad.id}`,
    pageType: ad.page_type,
    status: ad.status ? "Active" : "Inactive",
  };
});

      setAds(formattedAds);
    } catch (error) {
      console.error("Failed to load fullscreen ads", error);
    }
  };

  useEffect(() => {
    loadAds();
  }, [baseURL]);

  // const handleAddNew = () => {
  //   setEditingAd(null);
  //   setIsPopupOpen(true);
  // };

  const handleAddNew = () => {
  setEditingAd(null);
  setIsTypePopupOpen(true); // open type selection first
};


const handleTypeSelect = (type) => {
  setSelectedAdType(type);
  setIsTypePopupOpen(false);
  setIsPopupOpen(true); // then open form
};

  // const handleEdit = (ad) => {
  //   setEditingAd(ad);
  //   setIsPopupOpen(true);
  // };

  const handleEdit = (ad) => {
  setEditingAd(ad);
  setSelectedAdType(ad.ad_type); // load existing type
  setIsPopupOpen(true);
};

  // const handleFormSubmit = async (formData) => {
  //   try {
  //     const data = new FormData();
  //     data.append("title", formData.title);
  //     data.append("page_type", formData.pageType);
  //     data.append("link", formData.link);
  //     data.append("status", formData.status === "Active" ? "true" : "false");

  //     data.append("ad_type", selectedAdType);

  //     // if (formData.imageFile) {
  //     //   data.append("image", formData.imageFile);
  //     // }

  //     if (formData.imageFile) {
  //       data.append("image", formData.imageFile);
  //     }

  //     if (formData.videoFile) {
  //       data.append("video", formData.videoFile);
  //     }

  //     if (editingAd) {
  //       await updateFullScreenAd(baseURL, editingAd.id, data);
  //     } else {
  //       await addFullScreenAd(baseURL, data);
  //     }

  //     setIsPopupOpen(false);
  //     setEditingAd(null);
  //     loadAds();
  //   } catch (error) {
  //     console.error("Failed to save ad", error);
  //   }
  // };


  const handleFormSubmit = async (formData) => {
  try {
    const data = new FormData();

    data.append("title", formData.title);
    data.append("page_type", formData.page_type || formData.pageType);
    data.append("link", formData.link || "");
    // data.append(
    //   "status",
    //   formData.status === "Active" ? "true" : "false"
    // );
    data.append(
  "status",
  formData.status === true || formData.status === "Active"
    ? "true"
    : "false"
);
    data.append("ad_type", selectedAdType); // 🔥 ADD THIS BACK


    // 🔥 IMPORTANT FIX
    if (selectedAdType === "image" && formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    if (selectedAdType === "video" && formData.videoFile) {
      data.append("image", formData.videoFile); // 👈 send as image
    }

    if (editingAd) {
      await updateFullScreenAd(baseURL, editingAd.id, data);
    } else {
      await addFullScreenAd(baseURL, data);
    }

    setIsPopupOpen(false);
    setEditingAd(null);
    setSelectedAdType(null);
    loadAds();
  } catch (error) {
    console.error("Failed to save ad", error);
  }
};

  const handleDelete = (ad) => {
    setAdToDelete(ad);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!adToDelete) return;

    setIsDeleting(true);

    try {
      await deleteFullScreenAd(baseURL, adToDelete.id);
      loadAds();
      setIsDeletePopupOpen(false);
      setAdToDelete(null);
    } catch (error) {
      console.error("Failed to delete ad");
    } finally {
      setIsDeleting(false);
    }
  };

  const pageTypes = ["All", ...new Set(ads.map((ad) => ad.pageType))];

  const filteredAds = ads.filter(
    (ad) => filterPageType === "All" || ad.pageType === filterPageType
  );

  const handleFilterChange = (type) => {
    setFilterPageType(type);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const columns = [
    {
      header: "Sl. No.",
      cell: (_, index) => (
        <span>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
      ),
    },
    {
      header: "Title",
      accessor: "title",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Image",
      accessor: "image",
      type: "image",
    },
    {
      header: "Page Type",
      accessor: "pageType",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit size={18} />
          </button>

          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentAds = filteredAds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAds.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Full Screen Advertisement
          </h1>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Manage full screen advertisements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-60 bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all cursor-pointer"
            >
              <span>{filterPageType}</span>
              <ChevronDown
                size={20}
                className="text-gray-400 transition-transform"
              />
            </button>

            {isDropdownOpen && (
              <ul className="absolute z-50 mt-1 sm:w-60 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {pageTypes.map((type) => (
                  <li
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className="cursor-pointer px-4 py-2 hover:bg-brand-red hover:text-white transition-colors"
                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center"
          >
            <Plus size={20} />
            Add Full Screen Ad
          </button>
        </div>
      </div>

      <DynamicTable columns={columns} data={currentAds} search={false} />

      {filteredAds.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <FullScreenAdTypePopup
  isOpen={isTypePopupOpen}
  onClose={() => setIsTypePopupOpen(false)}
  onSelect={handleTypeSelect}
/>

      {/* <FullScreenAdFormPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleFormSubmit}
        ad={editingAd}
        allAds={ads}
      /> */}

      {/* <FullScreenAdFormPopup
  isOpen={isPopupOpen}
  onClose={() => setIsPopupOpen(false)}
  onSubmit={handleFormSubmit}
  ad={editingAd}
  allAds={ads}
  adType={selectedAdType}   // 🔥 added

/> */}

{selectedAdType === "image" && (
  <FullScreenAdFormPopup
    isOpen={isPopupOpen}
    onClose={() => setIsPopupOpen(false)}
    onSubmit={handleFormSubmit}
    ad={editingAd}
    allAds={ads}
  />
)}

{selectedAdType === "video" && (
  <FullScreenVideoAdFormPopup
    isOpen={isPopupOpen}
    onClose={() => setIsPopupOpen(false)}
    onSubmit={handleFormSubmit}
    ad={editingAd}
    allAds={ads}
  />
)}

      <ConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Advertisement"
        message="Are you sure you want to delete this ad?"
        isConfirming={isDeleting}
      />
    </div>
  );
}

export default AdminFullScreenAd;
