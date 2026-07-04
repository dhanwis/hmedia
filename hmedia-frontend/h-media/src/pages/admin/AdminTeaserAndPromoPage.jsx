import { useState, useReducer, useEffect } from "react";
import DatePicker from "react-datepicker";

import { Plus, X, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { useApi } from "../../context/ApiContext";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import VideoPlayerModal from "../../components/user/VideoPlayerModal";
import VideoCard from "../../components/user/VideoCard";
import {
  addTeaser,
  deleteTeaser,
  fetchTeasers,
  updateTeaser,
} from "../../services/teaserPromoService";

function AdminTeaserAndPromoPage() {
  const { baseURL } = useApi();
  const [teasers, setTeasers] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 9;

  const [formState, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "SET_FIELD":
          return {
            ...state,
            values: { ...state.values, [action.field]: action.value },
            errors: { ...state.errors, [action.field]: null },
          };
        case "SET_ERRORS":
          return { ...state, errors: action.errors };
        case "RESET":
          return {
            values: {
              title: "",
              youtubeUrl: "",
              status: "Active",
              publishedDate: new Date(),
            },
            errors: {},
          };
        default:
          return state;
      }
    },
    {
      values: {
        title: "",
        youtubeUrl: "",
        status: "Active",
        publishedDate: new Date(),
      },
      errors: {},
    }
  );

  const getYouTubeId = (url) => {
    if (!url) return null;

    const match = url.match(
      /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    return match ? match[1] : null;
  };

  const loadTeasers = async () => {
    const data = await fetchTeasers(baseURL);

    const sortedData = data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const formatted = sortedData.map((item) => {
      const videoId = getYouTubeId(item.video_url);

      return {
        id: item.id,
        title: item.video_title,
        youtubeId: videoId,
        thumbnail: videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : "",
        status: item.active_inactive ? "Active" : "Inactive",

        date: item.published_date.split("T")[0],
        duration: "0:00",
        movie: "N/A",
      };
    });

    setTeasers(formatted);
  };

  useEffect(() => {
    loadTeasers();
  }, []);

  const handleOpenFormModal = (video = null) => {
    setEditingVideo(video);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVideo(null);
    setIsSubmitting(false);
    dispatch({ type: "RESET" });
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { title, youtubeUrl, status, publishedDate } = formState.values;
    const newErrors = {};
    const videoId = extractYouTubeId(youtubeUrl);

    if (!title.trim()) newErrors.title = "Title is required.";
    if (!youtubeUrl.trim()) newErrors.youtubeUrl = "YouTube URL is required.";
    else if (!videoId)
      newErrors.youtubeUrl = "Please enter a valid YouTube URL.";
    if (!publishedDate) newErrors.publishedDate = "Published date is required.";

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      return;
    }

    setIsSubmitting(true);

    if (editingVideo) {
      try {
        const payload = {
          title,
          youtubeUrl,
          status,
          publishedDate,
        };

        const updated = await updateTeaser(baseURL, editingVideo.id, payload);

        const updatedVideo = {
          ...editingVideo,
          title: updated.video_title,
          youtubeId: videoId,
          status: updated.status === "active" ? "Active" : "Inactive",
          date: updated.published_date.split("T")[0],
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };

        setTeasers(
          teasers.map((t) => (t.id === editingVideo.id ? updatedVideo : t))
        );
        loadTeasers();
      } catch (err) {
        console.log("Failed to update video");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const payload = {
          title,
          youtubeUrl,
          status,
          publishedDate,
        };

        await addTeaser(baseURL, payload);

        // Reload from backend (source of truth)
        await loadTeasers();
      } catch (err) {
        console.log("Failed to add teaser");
        setIsSubmitting(false);
        return;
      }
    }

    handleCloseFormModal();
    setIsSubmitting(false);
  };

  const handleEdit = (video) => {
    handleOpenFormModal(video);
    dispatch({ type: "SET_FIELD", field: "title", value: video.title });
    dispatch({
      type: "SET_FIELD",
      field: "youtubeUrl",
      value: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    });
    dispatch({
      type: "SET_FIELD",
      field: "status",
      value: video.status || "Active",
    });
    dispatch({
      type: "SET_FIELD",
      field: "publishedDate",
      value: new Date(video.date),
    });
  };

  const handleDelete = (video) => {
    setVideoToDelete(video);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeaser(baseURL, videoToDelete.id);
      setTeasers((prev) => prev.filter((t) => t.id !== videoToDelete.id));
    } catch (err) {
      console.log("Failed to delete teaser");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setVideoToDelete(null);
    }
  };

  const formTitle = editingVideo ? "Edit Teaser/Promo" : "Add New Teaser/Promo";
  const buttonText = editingVideo ? "Save Changes" : "Add Video";

  const handleInputChange = (e) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name,
      value: e.target.value,
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTeasers = teasers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(teasers.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getPaginationItems = () => {
    const pageNeighbours = 1;
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    const getPaginationItems = () => {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    };

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

    if (pages[1] === "..." && pages[2] === 3) pages[1] = 2;
    if (
      pages[pages.length - 2] === "..." &&
      pages[pages.length - 3] === totalPages - 2
    ) {
      pages[pages.length - 2] = totalPages - 1;
    }

    return pages;
  };

  return (
    <main className="min-h-screen bg-gray-50 text-[#141414] pb-48">
      <div className="container">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Teasers & Promos</h1>
            <p className="text-gray-700 mt-1 text-sm md:text-base">
              Manage and view video teasers and promotional content.
            </p>
          </div>

          <button
            onClick={() => handleOpenFormModal()}
            className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg transition-all w-full md:w-auto justify-center cursor-pointer"
          >
            <Plus size={20} />
            Add Teaser/Promo
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTeasers.map((video) => {
            const statusColor =
              video.status === "Active"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400";

            return (
              <div key={video.id} className="flex flex-col">
                <div className="relative group">
                  <VideoCard
                    thumbnail={video.thumbnail}
                    title={video.title}
                    date={video.date}
                    onClick={() => setPlayingVideoId(video.youtubeId)}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${statusColor}`}
                    >
                      {video.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-8">
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
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        youtubeId={playingVideoId}
        onClose={() => setPlayingVideoId(null)}
      />

      {/* Add/Edit Video Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleCloseFormModal}
        >
          <div
            className="bg-gray-800 w-full max-w-lg rounded-lg border border-gray-700 shadow-2xl text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold">{formTitle}</h2>
              <button
                onClick={handleCloseFormModal}
                className="p-1 rounded-full hover:bg-gray-700 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <form
              id="add-video-form"
              onSubmit={handleFormSubmit}
              className="p-4 sm:p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Video Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formState.values.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-red focus:border-brand-red text-sm sm:text-base"
                  placeholder="e.g., Official Trailer"
                />
                {formState.errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {formState.errors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  YouTube URL
                </label>
                <input
                  type="text"
                  name="youtubeUrl"
                  value={formState.values.youtubeUrl}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-red focus:border-brand-red text-sm sm:text-base"
                  placeholder="e.g., https://www.youtube.com/watch?v=eHp3MbsCbMg"
                />
                {formState.errors.youtubeUrl && (
                  <p className="mt-1 text-sm text-red-500">
                    {formState.errors.youtubeUrl}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "status",
                          value:
                            formState.values.status === "Active"
                              ? "Inactive"
                              : "Active",
                        })
                      }
                      className={`${
                        formState.values.status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-600"
                      } h-6 w-11 rounded-full transition cursor-pointer`}
                      role="switch"
                      aria-checked={formState.values.status === "Active"}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          formState.values.status === "Active"
                            ? "translate-x-3"
                            : "-translate-x-3"
                        } inline-block h-6 w-6 bg-white rounded-full transform transition`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-300">
                      {formState.values.status}
                    </span>
                  </div>
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Published Date
                  </label>
                  <DatePicker
                    selected={formState.values.publishedDate}
                    onChange={(date) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "publishedDate",
                        value: date,
                      })
                    }
                    className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-red focus:border-brand-red text-sm sm:text-base"
                    wrapperClassName="w-full"
                  />
                  {formState.errors.publishedDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {formState.errors.publishedDate}
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 p-4 sm:p-5 border-t border-gray-700">
              <button
                onClick={handleCloseFormModal}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm sm:text-base cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-video-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-brand-red text-white font-semibold hover:bg-brand-dark transition-colors text-sm sm:text-base cursor-pointer disabled:bg-brand-dark disabled:cursor-wait flex items-center justify-center"
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
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationPopup
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teaser"
        message={`Are you sure you want to delete?`}
        isConfirming={isDeleting}
      />
    </main>
  );
}

export default AdminTeaserAndPromoPage;
