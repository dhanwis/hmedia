import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  Facebook,
  Youtube,
  Search,
  Twitter,
  Instagram,
} from "lucide-react";
import MobileSidebar from "./MobileSidebar";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Latest News", href: "/latestnews" },
  { name: "Cinema News", href: "/cinemanews" },
  { name: "Business Stories", href: "/more" },
  { name: "Meet The Person", href: "/meettheperson" },
  { name: "Trailers And Previews", href: "/teaserandpromo" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const handleLinkClick = () => {
    // Dispatch a custom event to show the global loader
    window.dispatchEvent(new Event("show-loader"));
  };

  return (
    <header className="w-full bg-white">
      <div className="container mx-auto px-4 py-2 flex items-start gap-6">
        {/* LOGO */}
        <div className="w-16 lg:w-40 flex justify-start items-center shrink-0">
          <Link to="/" onClick={handleLinkClick}>
            <img
              src="/images/logo/logo1.png"
              alt="Logo"
              width={120}
              height={80}
              className="w-24 h-auto"
            />
          </Link>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex flex-col w-full gap-4 ">
          {/* TOP BAR */}
          <div className="hidden lg:block text-xs text-gray-700 border-gray-400 border-b py-2">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
              <span className="font-medium">{currentDate}</span>

              <div className="flex items-center gap-4 text-gray-700">
                <Link
                  to="https://www.youtube.com/@ChannelHmediaOfficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Youtube size={16} />
                  <span>Subscribe on YouTube</span>
                </Link>

                <span className="hidden sm:block w-px h-4 bg-gray-300"></span>

                <div className="flex items-center gap-2 text-white">
                  {/* <Link
                    to="https://www.facebook.com/channelhmedia"
                    target="_blank"
                    aria-label="Facebook"
                    className="p-2 rounded-full bg-brand-dark hover:text-blue-600 transition-colors"
                    title="Facebook"
                  >
                    <Facebook size={14} />
                  </Link> */}

                  {/* <Link
                    to="https://www.instagram.com/channel_hmedia"
                    target="_blank"
                    aria-label="Instagram"
                    className="p-2 rounded-full bg-brand-dark hover:text-pink-500 transition-colors"
                    title="Instagram"
                  >
                    <Instagram size={14} />
                  </Link> */}

                  {/* Instagram */}
                  <Link
                    to="https://www.instagram.com/channel_hmedia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-pink-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center gap-2"
                  >
                    <Instagram size={16} />
                    <span className="mt-[2px]">Instagram</span>
                  </Link>

                  {/* Facebook */}
                  <Link
                    to="https://www.facebook.com/channelhmedia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Facebook size={16} />
                    <span className="mt-[2px]">Facebook</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN NAV AREA */}
          <div className="flex justify-end lg:justify-between items-center mt-[24px] lg:mt-[14px]">
            {/* NAVIGATION */}
            <nav className="hidden lg:flex gap-8 xl:gap-14 font-semibold text-sm uppercase">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handleLinkClick}
                    className={`relative group transition-colors ${
                      isActive ? "text-brand-red" : "hover:text-brand-red"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] bg-brand-red transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                );
              })}
            </nav>

            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden p-2 text-brand-dark"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={34} className="font" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navLinks={navLinks}
      />
    </header>
  );
}
