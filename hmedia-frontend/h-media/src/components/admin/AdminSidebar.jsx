import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  X,
  Newspaper,
  Film,
  Users,
  Clapperboard,
  MoreHorizontal,
  GalleryHorizontal,
  Zap,
  Megaphone,
  TrendingUp,
  Trash,
} from "lucide-react";
import { logoutUser } from "../../services/authService";
import ConfirmationPopup from "./ConfirmationPopup";
import { useApi } from "../../context/ApiContext";
import { useAuth } from "../../context/AuthContext";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/hmedianews", icon: LayoutDashboard },
  {
    name: "Home Banner",
    href: "/hmedianews/homebanner",
    icon: GalleryHorizontal,
  },
  { name: "Flash News", href: "/hmedianews/flashnews", icon: Zap },
  { name: "Trending News", href: "/hmedianews/trendingnews", icon: TrendingUp },
  { name: "Latest News", href: "/hmedianews/latestnews", icon: Newspaper },
  { name: "Cinema News", href: "/hmedianews/cinemanews", icon: Film },
  { name: "Business Stories", href: "/hmedianews/more", icon: MoreHorizontal },
  { name: "Meet The Person", href: "/hmedianews/meettheperson", icon: Users },
  {
    name: "Teaser And Promo",
    href: "/hmedianews/teaserandpromo",
    icon: Clapperboard,
  },

  { name: "Advertisement", href: "/hmedianews/advertisement", icon: Megaphone },
  {
    name: "Bottom AD Banner",
    href: "/hmedianews/bottomadvertisement",
    icon: Megaphone,
  },
  { name: "Full Screen AD", href: "/hmedianews/fullscreenad", icon: Megaphone },
  { name: "Popup AD", href: "/hmedianews/popupad", icon: Megaphone },
  // { name: "Recycle Bin", href: "/hmedianews/recyclebin", icon: Trash },
  


];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { baseURL } = useApi();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser(baseURL);
      logout();
      navigate("/hmedianews/login", { replace: true });
    } catch (err) {
      console.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-900 text-gray-300
        border-r border-gray-800 
        transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex justify-between lg:justify-center items-center p-4 border-b border-gray-800">
          <Link to="/hmedianews" className="flex items-center gap-2">
            <img
              src="/images/logo/hmedia-white.png"
              alt="Logo"
              width={70}
              height={30}
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-brand-red font-extrabold hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${
                    isActive
                      ? "bg-brand-red text-white shadow-lg"
                      : "hover:bg-gray-800 hover:text-white"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 font-medium
            text-gray-400 hover:bg-red-500/10 hover:text-red-400
            rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <ConfirmationPopup
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Logout"
        isConfirming={isLoggingOut}
      />
    </>
  );
}
