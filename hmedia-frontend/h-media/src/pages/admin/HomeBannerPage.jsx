import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";

import { fetchBanners, deleteBanner } from "../../services/bannerService";
import { useApi } from "../../context/ApiContext";
import BannerFormPopup from "../../components/admin/BannerFormPopup";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";

function HomeBannerPage() {
  const { baseURL } = useApi();

  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setBanners([])
    try {
      const data = (await fetchBanners(baseURL)) || [];

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      //old image code 
      // const mapped = data.map((b) => {
      //   let imageUrl = "/placeholder.jpg";

      //   if (b?.image && typeof b.image === "string" && baseURL) {
      //     imageUrl = `${baseURL}/${b.image.replace(/\\/g, "/")}`;
      //   }

      //   return { ...b, imageUrl };
      // });

      //new image replacement solved code 

      const mapped = data.map((b) => {
  let imageUrl = "/placeholder.jpg";

  if (b?.image && typeof b.image === "string" && baseURL) {
    imageUrl = `${baseURL}/${b.image.replace(/\\/g, "/")}?v=${b.updated_at || b.created_at}`;
  }

  return { ...b, imageUrl };
});


      setBanners(mapped);
    } catch (err) {
      console.error("Load banner error");
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]);

  // Fetch banners on initial load
  useEffect(() => {
    if (!baseURL) return;
    loadBanners();
  }, [baseURL, loadBanners]);

  // Scroll to top when Add/Edit popup opens
  useEffect(() => {
    if (isPopupOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPopupOpen]);

  const BANNERS_PER_PAGE = 9;

  const handleAddNew = () => {
    setEditingBanner(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setIsPopupOpen(true);
  };

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const onKey = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [previewImage]);

  const ImagePreviewPortal = ({ src, onClose }) => {
    if (typeof document === "undefined") return null;

    return createPortal(
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative max-w-[100vw] max-h-[100vh] md:max-w-[92vw] md:max-h-[92vh] rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt="Banner preview"
            className="w-full h-full max-w-[100vw] max-h-[100vh] md:max-w-[92vw] md:max-h-[92vh] rounded-lg shadow-2xl object-contain"
          />

          <button
            aria-label="Close preview"
            className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-lg cursor-pointer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
      </div>,
      document.body,
    );
  };

  // Pagination logic
  const indexOfLastBanner = currentPage * BANNERS_PER_PAGE;
  const indexOfFirstBanner = indexOfLastBanner - BANNERS_PER_PAGE;
  const currentBanners = banners.slice(indexOfFirstBanner, indexOfLastBanner);
  const totalPages = Math.ceil(banners.length / BANNERS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginationItems = () => {
    const pageNeighbours = 1;
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(2, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

    let pages = [1];

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    // This logic handles the case where the ellipsis would represent only one number
    if (pages[1] === "..." && pages[2] === 3) {
      pages[1] = 2;
    }
    if (
      pages[pages.length - 2] === "..." &&
      pages[pages.length - 3] === totalPages - 2
    ) {
      pages[pages.length - 2] = totalPages - 1;
    }

    return pages;
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBanner(baseURL, bannerToDelete.id);
      loadBanners();
    } catch (err) {
      console.error("Failed to delete banner");
    } finally {
      // Close popup and reset state
      setIsConfirmOpen(false);
      setBannerToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold">
            Home Banner Management
          </h1>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Add, edit, or remove banners from your homepage.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all w-full md:w-auto justify-center cursor-pointer"
        >
          <Plus size={20} />
          Add New Banner
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-lg font-medium">Loading Banners...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBanners.map((banner,index) => (
          <div key={banner.id}>
            <div className="group relative overflow-hidden rounded-lg bg-[#0f0f0f] shadow-lg hover:shadow-xl transition-all">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                onClick={() => setPreviewImage(banner.imageUrl)}
                className="w-full h-48 sm:h-56 md:h-60 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-brand-red transition-colors cursor-pointer"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(banner)}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 p-4">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${
                    banner.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {banner.status}
                </span>
              </div>
            </div>

            <h3 className="font-semibold mt-3 text-sm md:text-base truncate">
              {banner.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {getPaginationItems().map((item, index) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={`${item}-${index}`}
                    className="flex items-center justify-center w-9 h-9 text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === item
                      ? "bg-brand-red text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {!isLoading && currentBanners.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold">No Banners Found</h3>
          <p className="text-gray-500 mt-2">
            Try adding a new banner to get started.
          </p>
        </div>
      )}

      <BannerFormPopup
        isOpen={isPopupOpen}
        onClose={(updatedBanner) => {
           setCurrentPage(1); 
          setIsPopupOpen(false);

          if (updatedBanner) {
            loadBanners();
          }
        }}
        banner={editingBanner}
      />

      {previewImage && (
        <ImagePreviewPortal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <ConfirmationPopup
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Banner"
        message={`Are you sure you want to delete the banner?`}
      />
    </div>
  );
}

export default HomeBannerPage;
