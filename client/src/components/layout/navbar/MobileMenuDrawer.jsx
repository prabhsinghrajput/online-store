import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";

const FALLBACK_LINKS = [
  { name: "New Arrivals", path: "/new-arrivals" },
  { name: "Men", path: "/men" },
  { name: "Women", path: "/women" },
  { name: "Accessories", path: "/accessories" },
];

const MobileMenuDrawer = ({ categories = [], isOpen, onClose }) => {
  const location = useLocation();

  // Exclude internal categories
  const filteredCategories = categories.filter(
    (cat) => !['clothing', 'collection'].includes(cat.name?.toLowerCase().trim())
  );

  // Preferred order: New Arrivals, Men, Women, Accessories, then any custom categories
  const sortOrder = ['new arrivals', 'men', 'women', 'accessories'];
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const nameA = a.name?.toLowerCase().trim() || '';
    const nameB = b.name?.toLowerCase().trim() || '';
    const indexA = sortOrder.indexOf(nameA);
    const indexB = sortOrder.indexOf(nameB);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return nameA.localeCompare(nameB);
  });

  const linksToRender = sortedCategories.length > 0
    ? sortedCategories.map((cat) => ({
        id: cat.id || cat._id,
        name: cat.name,
        path: `/${cat.name.toLowerCase().trim().replace(/\s+/g, '-')}`,
      }))
    : FALLBACK_LINKS.map((item) => ({
        id: item.name,
        name: item.name,
        path: item.path,
      }));

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

        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-3">
          {linksToRender.map((link) => {
            const isActive = location.pathname.toLowerCase() === link.path.toLowerCase();
            return (
              <Link
                key={link.id || link.name}
                to={link.path}
                onClick={onClose}
                className={`block text-base font-bold uppercase tracking-wide py-2 transition-colors ${
                  isActive
                    ? 'text-primary font-extrabold'
                    : 'text-gray-800 dark:text-gray-200 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMenuDrawer;
