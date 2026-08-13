import { Link } from "react-router-dom";
import { X } from "lucide-react";

const FALLBACK_LINKS = ["New Arrivals", "Men", "Women", "Accessories"];

const MobileMenuDrawer = ({ categories, isOpen, onClose }) => {
  const filteredCategories = categories.filter(cat => cat.name?.toLowerCase() !== 'clothing');

  return (
    <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className={`relative w-4/5 max-w-sm bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col z-10 border-r border-gray-100 dark:border-neutral-900 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-900">
          <span className="text-sm font-black tracking-widest text-gray-900 dark:text-white uppercase">Menu</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
          {filteredCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/${cat.name}`}
              onClick={onClose}
              className="block text-base font-bold text-gray-800 dark:text-gray-200 hover:text-primary py-2 uppercase tracking-wide transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <>
              {FALLBACK_LINKS.map((label) => (
                <Link key={label} to="/products" onClick={onClose}
                  className="block text-base font-bold text-gray-800 dark:text-gray-200 hover:text-primary py-2 uppercase tracking-wide transition-colors">
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDrawer;
