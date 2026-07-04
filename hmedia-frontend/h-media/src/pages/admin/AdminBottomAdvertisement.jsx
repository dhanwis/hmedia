import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import DynamicTable from "../../components/admin/DynamicTable";
import Pagination from "../../components/admin/Pagination";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import BottomAdFormPopup from "../../components/admin/BottomAdFormPopup";
import { useApi } from "../../context/ApiContext";
import { AddBottomAdBanner, deleteBottomBannerAd, fetchBottomAdBanner, updateBottomAdBanner } from "../../services/bottomAdService";


function AdminBottomAdvertisement() {
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

  const ITEMS_PER_PAGE = 10;

  const loadAds = async () => {
    try {
      const data = await fetchBottomAdBanner(baseURL);
      const formattedAds = data.map((ad) => ({
        ...ad,
        //old code for image replacement issue
        // image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
        // new code to solved image replacement
        image: `${baseURL}/${ad.image.replace(/\\/g, "/")}?v=${ad.id}-${ad.order}`,

        pageType: ad.page_type,
        status: ad.status ? "Active" : "Inactive",
      }));
      setAds(formattedAds.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to load ads");
    }
  };

  useEffect(() => {
    loadAds();
  }, [baseURL]);

  const handleAddNew = () => {
    setEditingAd(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setIsPopupOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("page_type", formData.pageType);
      data.append("link", formData.link);
      data.append("status", formData.status === "Active" ? "true" : "false");
      data.append("order", formData.order);

      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }

      if (editingAd) {
        await updateBottomAdBanner(baseURL, editingAd.id, data);
      } else {
        await AddBottomAdBanner(baseURL, data);
      }

      setIsPopupOpen(false);
      setEditingAd(null);
      loadAds();
    } catch (error) {
      console.error("Failed to save ad");
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
      await deleteBottomBannerAd(baseURL, adToDelete.id);
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
      header: "Ad Image",
      accessor: "image",
      type: "image",
    },
    {
      header: "Ad Title",
      accessor: "title",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Page Type",
      accessor: "pageType",
    },
    {
      header: "Order",
      accessor: "order",
      cellClassName: "text-center",
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
            Bottom Advertisement
          </h1>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Manage bottom sticky advertisements.
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
            Create Bottom Ad
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

      <BottomAdFormPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleFormSubmit}
        ad={editingAd}
        allAds={ads}
      />

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

export default AdminBottomAdvertisement;