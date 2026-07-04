import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import Pagination from "../../components/admin/Pagination";
import DynamicTable from "../../components/admin/DynamicTable";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import AddArticle from "../../components/admin/AddArticle";
import { useApi } from "../../context/ApiContext";
import {
  fetchMoreNews,
  addMoreNews,
  updateMoreNews,
  deleteMoreNews,
  toggleIsSponsoredMoreNews,
  toggleShowViewCountMoreNews,   // 👈 ADD THIS
} from "../../services/moreNewsService";
// import { toggleIsSponsoredMeetThePerson } from "../../services/meetPersonService";

function AdminMoreNewsPage() {
  const { baseURL } = useApi();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("list"); // list | add | edit
  const [editingArticle, setEditingArticle] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 10;

  // --------------------------
  // LOAD DATA
  // --------------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMoreNews(baseURL);
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const formatted = sortedData.map((item) => ({
        ...item,
        imageUrl: item.image
          ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
          : "/placeholder.jpg",
        publishedDate: item.date.split("T")[0],
      }));

      setList(formatted);
    } catch (err) {
      console.error("Error loading More News");
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

  const filteredList = list.filter((item) =>
    [item.title, item.slug].some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
  );

  // --------------------------
  // PAGINATION
  // --------------------------
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => setCurrentPage(page);

  // --------------------------
  // ADD / UPDATE SUBMIT
  // --------------------------
  const handleFormSubmit = async (articleData) => {
    setServerError(null);
    const form = new FormData();
    form.append("title", articleData.title);
    form.append("slug", articleData.slug);
    form.append("content", articleData.content);
    form.append("author", articleData.author);
    form.append("date", articleData.date);

    form.append("trending", articleData.trending);

    form.append("tags", JSON.stringify(articleData.tags || []));
    //old code for image replacement issue
    // if (articleData.imageFile) {
    //   form.append("image", articleData.imageFile);
    // }
    //new code for solved image replacement
    if (articleData.imageFile) {
  const file = articleData.imageFile;
  const ext = file.name.split(".").pop();

  const uniqueName = `more_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

  const renamedFile = new File([file], uniqueName, { type: file.type });

  form.append("image", renamedFile);
}


    try {
      if (view === "add") {
        await addMoreNews(baseURL, form);
      } else {
        await updateMoreNews(baseURL, articleData.id, form);
      }

      await loadData();
      setView("list");
      setEditingArticle(null);
    } catch (err) {
      setServerError(err.message || "An error occurred. Please try again.");
    }
  };

  // --------------------------
  // DELETE
  // --------------------------
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMoreNews(baseURL, itemToDelete.id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (item) => {
    setServerError(null);
    setEditingArticle(item);
    setView("edit");
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

  const handleToggleHome = async (person) => {
    try {
      setList((prev) =>
        prev.map((item) =>
          item.id === person.id
            ? { ...item, add_to_home: !item.add_to_home }
            : item,
        ),
      );

      await toggleAddToHomeMeetThePerson(
        baseURL,
        person.id,
        !person.add_to_home,
      );
    } catch (err) {
      console.error("Failed to toggle add to home for More News");
    }
  };

  const handleToggleSponsored = async (newsItem) => {
    try {
      await toggleIsSponsoredMoreNews(
        baseURL,
        newsItem.id,
        !newsItem.is_sponsored,
      );

      // Optimistic UI update
      setList((prev) =>
        prev.map((item) =>
          item.id === newsItem.id
            ? { ...item, is_sponsored: !item.is_sponsored }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle sponsored More News");
    }
  };


  const handleToggleViewCount = async (newsItem) => {
  try {
    await toggleShowViewCountMoreNews(
      baseURL,
      newsItem.id,
      !newsItem.show_view_count
    );

    // Optimistic update
    setList((prev) =>
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

  // --------------------------
  // TABLE COLUMNS
  // --------------------------
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
      cellClassName: "font-medium text-gray-900 max-w-sm truncate",
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
          {/* ADD TO HOME TOGGLE */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Add to Home</span>

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
          {/* SHOW VIEW COUNT */}
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600">
    Show Views
  </span>
  <input
    type="checkbox"
    checked={row.show_view_count || false}
    onChange={() => handleToggleViewCount(row)}
    className="accent-yellow-500 cursor-pointer"
  />
</div>

          {/* SPONSORED CHECKBOX */}
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={row.is_sponsored || false}
              onChange={() => handleToggleSponsored(row)}
              className="accent-yellow-500 cursor-pointer"
            />
            Sponsored
          </label>
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
        message={`Are you sure you want to delete?`}
        isConfirming={isDeleting}
      />
      {/* LIST VIEW */}
      {view === "list" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Business Stories</h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Manage all Business Stories.
              </p>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg transition-all w-full md:w-auto justify-center cursor-pointer"
            >
              <Plus size={20} />
              Add Business Stories
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
                data={currentItems}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
              />

              {list.length > 0 && (
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

      {/* ADD VIEW */}
      {view === "add" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-brand-red hover:text-white cursor-pointer transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Add Business Stories</h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Add a new article to the Business Stories section.
              </p>
            </div>
          </div>

          <AddArticle
            heading="Create Business Stories"
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            buttonText="Add Business Stories"
            serverError={serverError}
          />
        </div>
      )}

      {/* EDIT VIEW */}
      {view === "edit" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-brand-red hover:text-white cursor-pointer transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Edit Business Stories</h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Edit and update the selected Business Stories article.
              </p>
            </div>
          </div>

          <AddArticle
            heading="Update Business Stories"
            initialData={editingArticle}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            buttonText="Update Business Stories"
            serverError={serverError}
          />
        </div>
      )}
    </div>
  );
}

export default AdminMoreNewsPage;
