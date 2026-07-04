import { X, Facebook, Youtube, Instagram, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function MobileSidebar({ isOpen, onClose, navLinks }) {
  const location = useLocation();
  const pathname = location.pathname;
  const handleLinkClick = () => {
    // Dispatch a custom event to show the global loader
    window.dispatchEvent(new Event("show-loader"));
    onClose();
  };
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } z-40`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          z-50 flex flex-col
        `}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <img
            src="/images/logo/logo1.png"
            alt="Cinema News Agency Logo"
            width={90}
            height={27}
          />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-brand-red font-extrabold hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide uppercase">
          {/* Navigation */}
        <div >
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={`px-4 py-3 text-base font-semibold rounded-md transition-colors ${
                    isActive
                      ? "bg-yellow-100 text-brand-red"
                      : "text-gray-700 hover:bg-gray-100 hover:text-brand-red"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-200 space-y-6">
          <Link
            to="https://www.youtube.com/@ChannelHmediaOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white  py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            onClick={onClose}
          >
            <Youtube size={16} />
            <span className="mt-[2px]">Subscribe on YouTube</span>
          </Link>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
              Follow Us
            </h3>
            <div className="flex items-center justify-center gap-6">
              {/* <Link
                to="https://www.facebook.com/channelhmedia"
                target="_blank"
                aria-label="Facebook"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Facebook size={22} />
              </Link>
              <Link
                to="https://www.instagram.com/channel_hmedia"
                target="_blank"
                aria-label="Instagram"
                className="text-gray-500 hover:text-pink-500 transition-colors"
              >
                <Instagram size={22} />
              </Link> */}

              {/* Instagram */}
              <Link
                to="https://www.instagram.com/channel_hmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-600 w-full flex items-center justify-center gap-2 text-white  py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors text-sm"
              >
                <Instagram size={16} />
                <span className="mt-[2px]">Instagram</span>
              </Link>

              {/* Facebook */}
              <Link
                to="https://www.facebook.com/channelhmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 w-full flex items-center justify-center gap-2 text-white  py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors text-sm"
              >
                <Facebook size={16} />
                <span className="mt-[2px]">Facebook</span>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
