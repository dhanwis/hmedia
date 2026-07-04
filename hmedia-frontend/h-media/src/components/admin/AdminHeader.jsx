import { Menu } from "lucide-react";

export default function AdminHeader({ setIsOpen }) {
  return (
    <header
      className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md 
      border-b border-brand-dark/20 p-4 flex justify-between items-center text-[#141414]"
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden text-brand-dark"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
