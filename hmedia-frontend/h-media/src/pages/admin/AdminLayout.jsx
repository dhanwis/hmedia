import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 text-[#141414] flex ">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <AdminHeader setIsOpen={setSidebarOpen} />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}

export default AdminLayout;
