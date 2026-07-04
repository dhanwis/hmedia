import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

import DynamicTable from "../../components/admin/DynamicTable";
import Pagination from "../../components/admin/Pagination";
import FlashNewsFormPopup from "../../components/admin/FlashNewsFormPopup";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";

import { useApi } from "../../context/ApiContext";

import {
  fetchFlashNews,
  addFlashNews,
  updateFlashNews,
  deleteFlashNews,
} from "../../services/flashNewsService";

function AdminFlashNewsPage() {
  const { baseURL } = useApi();

  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadFlashNews = async () => {
    try {
      setLoading(true);
      const data = await fetchFlashNews(baseURL);
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNews(sortedData);
    } catch (err) {
      console.log("Failed to load Flash News");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashNews();
  }, [baseURL]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (row) => {
    setEditingItem(row);
    setIsPopupOpen(true);
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setIsConfirmPopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFlashNews(baseURL,itemToDelete.id);
      loadFlashNews();
      setIsConfirmPopupOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.log("Failed to delete Flash News");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePopupSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateFlashNews(baseURL,editingItem.id, data);
      } else {
        await addFlashNews(baseURL,data);
      }

      setIsPopupOpen(false);
      setEditingItem(null);
      loadFlashNews();
    } catch (err) {
      console.log("Failed to save Flash News");
    }
  };

  const columns = [
    {
      header: "Sl. No.",
      cell: (_, index) => <span>{indexOfFirstItem + index + 1}</span>,
    },
    {
      header: "Title",
      accessor: "title",
      cellClassName: "font-medium text-gray-900 max-w-xs truncate",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
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
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <FlashNewsFormPopup
        newsItem={editingItem}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handlePopupSubmit}
      />

      <ConfirmationPopup
        isOpen={isConfirmPopupOpen}
        onClose={() => setIsConfirmPopupOpen(false)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this flash news? This action cannot be undone.`}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Flash News</h1>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Manage breaking news and quick updates.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
        >
          <Plus size={20} />
          Add Flash News
        </button>
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
          <DynamicTable columns={columns} data={currentNews} search={false} />
          {news.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default AdminFlashNewsPage;
