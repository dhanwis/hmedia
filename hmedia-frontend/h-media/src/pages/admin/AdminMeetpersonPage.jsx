import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Plus, Edit, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import Pagination from "../../components/admin/Pagination";
import DynamicTable from "../../components/admin/DynamicTable";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import AddArticle from "../../components/admin/AddArticle";

import {
  fetchMeetPersons,
  addMeetPerson,
  updateMeetPerson,
  deleteMeetPerson,
  toggleAddToHomeMeetThePerson,
  toggleIsSponsoredMeetThePerson,
  toggleShowViewCountMeetThePerson, // ✅ ADD THIS
} from "../../services/meetPersonService";
import { useApi } from "../../context/ApiContext";

import { addLatestNews, updateLatestNews } from "../../services/latestNewsService";
import { addCinemaNews, updateCinemaNews } from "../../services/cinemaNewsService";
import { addMoreNews, updateMoreNews } from "../../services/moreNewsService";

function AdminMeetpersonPage() {
  const { baseURL } = useApi();
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("list"); // list | add | edit
  const [editingArticle, setEditingArticle] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 10;

  // ------------------------------------
  // LOAD DATA
  // ------------------------------------
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMeetPersons(baseURL);

      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      const formatted = sortedData.map((item) => ({
        ...item,
        imageUrl: item.image
          ? `${baseURL}/${item.image.replace(/\\/g, "/")}`
          : "/placeholder.jpg",
        publishedDate: item.date.split("T")[0],
        trending: item.trending ?? false,
      }));

      setList(formatted);
    } catch (err) {
      console.error("Error loading Meet The Person");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredList = list.filter((item) =>
    String(item.slug || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentList = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => setCurrentPage(page);

  // ------------------------------------
  // ADD OR UPDATE FORM SUBMIT
  // ------------------------------------

  const handleFormSubmit = async (articleData) => {
    setServerError(null);
    try {
      const form = new FormData();
      form.append("title", articleData.title);
      form.append("slug", articleData.slug);
      form.append("content", articleData.content);
      form.append("author", articleData.author);
      form.append("date", articleData.date);
      form.append("trending", articleData.trending);
      form.append("tags", JSON.stringify(articleData.tags || []));

      // if (articleData.imageFile) {
      //   const file = articleData.imageFile;
      //   const ext = file.name.split(".").pop();
      //   const prefix = articleData.selectedCategory || "meetperson";
      //   const uniqueName = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      //   const renamedFile = new File([file], uniqueName, { type: file.type });
      //   form.append("image", renamedFile);
      // }

      if (articleData.imageFile) {
        form.append("image", articleData.imageFile);
      }


      

      const cat = articleData.selectedCategory || "meetperson";

      if (view === "add") {
        if (cat === "latest") await addLatestNews(baseURL, form);
        else if (cat === "cinema") await addCinemaNews(baseURL, form);
        else if (cat === "more") await addMoreNews(baseURL, form);
        else if (cat === "meetperson") await addMeetPerson(baseURL, form);

        
      } else {
        if (cat === "latest") await updateLatestNews(baseURL, articleData.id, form);
        else if (cat === "cinema") await updateCinemaNews(baseURL, articleData.id, form);
        else if (cat === "more") await updateMoreNews(baseURL, articleData.id, form);
        else if (cat === "meetperson") await updateMeetPerson(baseURL, articleData.id, form);
      }

            // If same category, reload data and go to list view
      // If different category, navigate to that category's page
      if (cat === "meetperson") {
        await loadData();
        setView("list");
        setEditingArticle(null);
      } else {
        const categoryRoutes = {
          latest: "/hmedianews/latestnews",
          cinema: "/hmedianews/cinemanews",
          more: "/hmedianews/more",
        };
        navigate(categoryRoutes[cat]);
      }


    } catch (err) {
      setServerError(err.message || "An error occurred. Please try again.");
    }
  };


  // ------------------------------------
  // DELETE
  // ------------------------------------
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMeetPerson(baseURL, itemToDelete.id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // ------------------------------------
  // EDIT
  // ------------------------------------
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
      console.error("Failed to toggle add to home meet the person");
    }
  };


   const handleToggleSponsored = async (newsItem) => {
    try {
      await toggleIsSponsoredMeetThePerson(
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
      console.error("Failed to toggle sponsored Meet The Person");
    }
  };

  const handleToggleViewCount = async (person) => {
  try {
    await toggleShowViewCountMeetThePerson(
      baseURL,
      person.id,
      !person.show_view_count
    );

    // Optimistic update
    setList((prev) =>
      prev.map((item) =>
        item.id === person.id
          ? {
              ...item,
              show_view_count: !item.show_view_count,
            }
          : item
      )
    );
  } catch (err) {
    console.error("Failed to toggle show view count");
  }
};

  // ------------------------------------
  // TABLE COLUMNS
  // ------------------------------------
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

    // 10/06/26
    {
      header: "Title",
      accessor: "title",
      cellClassName: "font-medium text-gray-900 max-w-xs truncate",
      // cell: (row) => <span dangerouslySetInnerHTML={{ __html: row.title }} />
      // 10/07/26
      cell: (row) => <span dangerouslySetInnerHTML={{ __html: row?.title || "" }} />

    },


    // {
    //   header: "Title",
    //   accessor: "title",
    //   cellClassName: "font-medium text-gray-900 max-w-sm truncate",
    // },

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
              <h1 className="text-2xl md:text-3xl font-bold">
                Meet The Person
              </h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Manage exclusive interviews and profiles.
              </p>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg transition-all w-full md:w-auto justify-center cursor-pointer"
            >
              <Plus size={20} />
              Add Meet The Person
            </button>
          </div>

          {isLoading ? (
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
                data={currentList}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
              />

              {filteredList.length > 0 && (
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
              <h1 className="text-2xl md:text-3xl font-bold">
                Add Meet The Person
              </h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Fill in the details to create a new interview.
              </p>
            </div>
          </div>

          <AddArticle
            heading="Create Meet The Person"
            onSubmit={handleFormSubmit}
            buttonText="Add Person"
            serverError={serverError}
            category="meetperson"
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
              <h1 className="text-2xl md:text-3xl font-bold">
                Edit Meet The Person
              </h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">
                Update the interview details.
              </p>
            </div>
          </div>

          <AddArticle
            heading="Update Meet The Person"
            initialData={editingArticle}
            onSubmit={handleFormSubmit}
            buttonText="Update Person"
            serverError={serverError}
            category="meetperson"
          />
        </div>
      )}
    </div>
  );
}

export default AdminMeetpersonPage;
