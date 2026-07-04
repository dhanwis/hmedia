import { useState, useEffect } from "react";
import { Trash2, Eye, Loader2 } from "lucide-react";

import DynamicTable from "../../components/admin/DynamicTable";
import Pagination from "../../components/admin/Pagination";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import ImagePopup from "../../components/admin/ImagePopup";

import {
  fetchTrendingNews,
  removeTrendingNews,
} from "../../services/trendingNewsService";

import { useApi } from "../../context/ApiContext";

function AdminTrendingNewsPage() {
  const { baseURL } = useApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Popups
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  

  const loadData = async () => {
    if (!baseURL) return;
    setLoading(true);
    try {
      const res = await fetchTrendingNews(baseURL);
      // Sort by date descending
      const sorted = res.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Format image URLs
      const formatted = sorted.map((item) => ({
        ...item,
        image: item.image
          ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
          : null,
      }));

      setData(formatted);
    } catch (error) {
      console.error("Failed to fetch trending news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [baseURL]);

  const filteredData = data.filter((item) =>
  String(item.slug || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

  // Pagination Logic
const totalPages = Math.ceil(filteredData.length / itemsPerPage);

const currentData = filteredData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await removeTrendingNews(baseURL,selectedItem.id);
      await loadData();
      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to remove trending news");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Image",
      accessor: "image",
      type: "image",
      altAccessor: "title",
    },
    {
      header: "Title",
      accessor: "title",
      cell: (row) => (
        <div className="max-w-md">
          <p
            className="font-medium text-gray-900 line-clamp-2"
            title={row.title}
          >
            {row.title}
          </p>
        </div>
      ),
    },
    {
      header: "SLUG",
      accessor: "slug",
      cellClassName: "font-medium text-gray-900 max-w-xs truncate",
    },
    {
      header: "Date",
      accessor: "date",
      cell: (row) => (
        <span className="text-gray-500 whitespace-nowrap">
          {row.date ? new Date(row.date).toLocaleDateString("en-CA") : "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewImage(row.image)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
            title="View Image"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            title="Remove from Trending"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Trending News</h1>
        <span className="text-sm text-gray-500">Total: {data.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-lg font-medium">Loading News...</span>
          </div>
        </div>
      ) : (
        <>
         <DynamicTable
  columns={columns}
  data={currentData}
  searchTerm={searchTerm}
  onSearch={setSearchTerm}
/>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmationPopup
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove from Trending"
        message={`Are you sure you want to remove`}
        confirmText="Remove"
        isConfirming={isDeleting}
      />

      <ImagePopup src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}

export default AdminTrendingNewsPage;
