import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, Loader2, Home } from "lucide-react";
import { useApi } from "../../context/ApiContext";
import {
  addLatestNews,
  deleteLatestNews,
  fetchLatestNews,
  toggleAddToHomeLatestNews,
  toggleIsSponsoredLatestNews,
  updateLatestNews,
} from "../../services/latestNewsService";
import Pagination from "../../components/admin/Pagination";
import DynamicTable from "../../components/admin/DynamicTable";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import AddArticle from "../../components/admin/AddArticle";
import { toggleShowViewCountLatestNews } from "../../services/latestNewsService";

function AdminLatestPage() {
  const { baseURL } = useApi();

  const [newsData, setNewsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("list");
  const [editingArticle, setEditingArticle] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  // ---------------- FETCH DATA ----------------
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLatestNews(baseURL);
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const final = sortedData.map((item) => ({
        ...item,
        imageUrl: item.image
          ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
          : "/placeholder.jpg",
        publishedDate:
          item.published_date?.split("T")[0] || item.date?.split("T")[0],
      }));
      setNewsData(final);
    } catch (err) {
      console.error("Error loading latest news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredNews = newsData.filter((item) =>
    String(item.slug || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleToggleHome = async (newsItem) => {
    try {
      await toggleAddToHomeLatestNews(
        baseURL,
        newsItem.id,
        !newsItem.add_to_home,
      );

      // Optimistic UI update
      setNewsData((prev) =>
        prev.map((item) =>
          item.id === newsItem.id
            ? { ...item, add_to_home: !item.add_to_home }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle add to home");
    }
  };

  const handleToggleSponsored = async (newsItem) => {
    try {
      await toggleIsSponsoredLatestNews(
        baseURL,
        newsItem.id,
        !newsItem.is_sponsored,
      );

      // Optimistic UI update
      setNewsData((prev) =>
        prev.map((item) =>
          item.id === newsItem.id
            ? { ...item, is_sponsored: !item.is_sponsored }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle sponsored latest news");
    }
  };
  const handleToggleViewCount = async (newsItem) => {
  try {
    await toggleShowViewCountLatestNews(
      baseURL,
      newsItem.id,
      !newsItem.show_view_count
    );

    setNewsData((prev) =>
      prev.map((item) =>
        item.id === newsItem.id
          ? {
              ...item,
              show_view_count: !item.show_view_count,
            }
          : item
      )
    );
  } catch (err) {
    console.error("Failed to toggle view count");
  }
};
  // ---------------- PAGINATION ----------------
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const handlePageChange = (page) => setCurrentPage(page);

  // ---------------- ADD / EDIT ----------------
  const handleFormSubmit = async (articleData) => {
    setServerError(null);
    try {
      const form = new FormData();
      form.append("title", articleData.title);
      form.append("slug", articleData.slug);
      form.append("author", articleData.author);
      form.append("content", articleData.content);
      form.append("date", articleData.date);

      form.append("trending", articleData.trending);
      form.append("tags", JSON.stringify(articleData.tags || []));
      //old image code 
      // if (articleData.imageFile) {
      //   form.append("image", articleData.imageFile);
      // }

      //new image replacement issue solved code 
      if (articleData.imageFile) {
  const file = articleData.imageFile;
  const ext = file.name.split(".").pop();

  const uniqueName = `latest_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

  const renamedFile = new File([file], uniqueName, { type: file.type });

  form.append("image", renamedFile);
}


      if (view === "add") {
        await addLatestNews(baseURL, form);
      } else {
        await updateLatestNews(baseURL, articleData.id, form);
      }

      await loadData();
      setView("list");
      setEditingArticle(null);
    } catch (err) {
      console.error("Error submitting form");

      setServerError(err.message || "An error occurred. Please try again.");
    }
  };

  const handleEdit = (newsItem) => {
    setServerError(null);
    setEditingArticle(newsItem);
    setView("edit");
  };

  // ---------------- DELETE ----------------
  const handleDeleteClick = (newsItem) => {
    setItemToDelete(newsItem);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLatestNews(baseURL, itemToDelete.id);
      await loadData();
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNew = () => {
    setServerError(null);
    setView("add");
  };
  const handleCancel = () => {
    setServerError(null);
    setView("list");
    setEditingArticle(null);
  };

  // ---------------- TABLE COLUMNS ----------------
  const columns = [
    {
      header: "Sl. No.",
      cell: (_, index) => <span>{indexOfFirstItem + index + 1}</span>,
    },
    {
      header: "Image",
      type: "image",
      accessor: "imageUrl",
      altAccessor: "title",
    },
    {
      header: "Title",
      accessor: "title",
      cellClassName: "font-medium text-gray-900 max-w-xs truncate",
    },
    {
      header: "SLUG",
      accessor: "slug",
      cellClassName: "font-medium text-gray-900 max-w-xs truncate",
    },
    {
      header: "Date",
      accessor: "publishedDate",
    },
    {
  header: "Views",
  cell: (row) => (
    <span className="font-medium text-gray-700">
      {row.view_count ?? 0}
    </span>
  ),
},
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <div className="flex flex-col items-end gap-4">
          {/* ROW 1: ADD TO HOME */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-20 text-right">
              Add to Home
            </span>
            <button
              onClick={() => handleToggleHome(row)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                row.add_to_home ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  row.add_to_home ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>


          {/* ROW 3: SHOW VIEW COUNT */}
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600 w-20 text-right">
    Show Views
  </span>
  <input
    type="checkbox"
    checked={row.show_view_count || false}
    onChange={() => handleToggleViewCount(row)}
   className="accent-yellow-500 cursor-pointer"
  />
</div>

          {/* ROW 2: SPONSORED */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-20 text-right">
              Sponsored
            </span>
            <input
              type="checkbox"
              checked={row.is_sponsored || false}
              onChange={() => handleToggleSponsored(row)}
              className="accent-yellow-500 cursor-pointer"
            />
          </div>

          {/* ROW 3: EDIT / DELETE */}
          <div className="flex items-center gap-3">
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <ConfirmationPopup
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        message={`Are you sure you want to delete?`}
      />

      {view === "list" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Latest News</h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Manage all latest news.
              </p>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              <Plus size={20} /> Add Latest News
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
              <DynamicTable
                columns={columns}
                data={currentNews}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
              />
              {newsData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}

      {(view === "add" || view === "edit") && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-brand-red hover:text-white cursor-pointer transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">
              {view === "add" ? "Add Latest News" : "Edit Latest News"}
            </h1>
          </div>
          <AddArticle
            heading={
              view === "add" ? "Create Latest News" : "Update Latest News"
            }
            initialData={editingArticle}
            onSubmit={handleFormSubmit}
            buttonText={
              view === "add" ? "Add Latest News" : "Update Latest News"
            }
            serverError={serverError}
          />
        </div>
      )}
    </div>
  );
}

export default AdminLatestPage;
