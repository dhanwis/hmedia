// import React from 'react'
// import DynamicTable from '../../components/admin/DynamicTable'

// function AdminRecycleBinPage() {
//   return (
//     <div>
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
//                   <div>
//                     <h1 className="text-2xl md:text-3xl font-bold">Recycle Bin</h1>
//                     <p className="text-gray-700 mt-1 text-sm md:text-base">
//                       Manage and view Recycle Bin
//                     </p>
//                   </div>
        
                  
//                 </div>
//         <div>
//             {/* <DynamicTable/> */}
            
            
//         </div>
//     </div>
//   )
// }

// export default AdminRecycleBinPage


import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import DynamicTable from "../../components/admin/DynamicTable";
import Pagination from "../../components/admin/Pagination";
import ConfirmationPopup from "../../components/admin/ConfirmationPopup";
import { useApi } from "../../context/ApiContext";

// import {
//   fetchRecycleBinAds,
//   deleteSelectedRecycleAds,
//   deleteAllRecycleAds,
// } from "../../services/recycleBinService";

function AdminRecycleBinPage() {
  const { baseURL } = useApi();

  const [deletedAds, setDeletedAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRows, setSelectedRows] = useState([]);

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(""); // "selected" or "all"
  const [isDeleting, setIsDeleting] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadRecycleBinAds = async () => {
    try {
      const data = await fetchRecycleBinAds(baseURL);

      const formatted = data.map((ad) => ({
        ...ad,
        image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
        pageType: ad.page_type,
        deletedAt: ad.deleted_at,
      }));

      setDeletedAds(formatted);
    } catch (error) {
      console.log("Failed to load recycle bin ads", error);
    }
  };

  useEffect(() => {
    loadRecycleBinAds();
  }, [baseURL]);

  // Delete selected confirm popup
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setDeleteType("selected");
    setIsDeletePopupOpen(true);
  };

  // Delete all confirm popup
  const handleDeleteAll = () => {
    setDeleteType("all");
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (deleteType === "selected") {
        await deleteSelectedRecycleAds(baseURL, selectedRows);
      } else if (deleteType === "all") {
        await deleteAllRecycleAds(baseURL);
      }

      setSelectedRows([]);
      setIsDeletePopupOpen(false);
      loadRecycleBinAds();
    } catch (error) {
      console.log("Delete failed", error);
    } finally {
      setIsDeleting(false);
    }
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
      header: "Deleted At",
      accessor: "deletedAt",
    },
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentDeletedAds = deletedAds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(deletedAds.length / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recycle Bin</h1>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Manage deleted advertisements.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
  {/* <button
  className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center"
>
  <Trash2 size={20} />
  Delete Selected
</button> */}

<button
  className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center"
>
  <Trash2 size={20} />
  Delete All
</button>




  {/* <button
    onClick={handleDeleteAll}
    disabled={deletedAds.length === 0}
    className="flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all cursor-pointer w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Trash2 size={20} />
    Delete All
  </button> */}
</div>
</div>

      {/* Table */}
      <DynamicTable
        columns={columns}
        data={currentDeletedAds}
        search={false}
        enableSelect={true}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        uniqueKeyAccessor="id"
      />

      {/* Pagination */}
      {deletedAds.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Permanently"
        message={
          deleteType === "all"
            ? "Are you sure you want to delete all items permanently?"
            : "Are you sure you want to delete selected items permanently?"
        }
        isConfirming={isDeleting}
      />
    </div>
  );
}

export default AdminRecycleBinPage;
