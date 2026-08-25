import { Link, useLocation } from "react-router-dom";

const FALLBACK_LINKS = [
  { name: "New Arrivals", path: "/new-arrivals" },
  { name: "Men", path: "/men" },
  { name: "Women", path: "/women" },
  { name: "Accessories", path: "/accessories" },
];

const DesktopNavLinks = ({ categories = [] }) => {
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
    <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
      {linksToRender.map((link) => {
        const isActive = location.pathname.toLowerCase() === link.path.toLowerCase();
        return (
          <Link
            key={link.id || link.name}
            to={link.path}
            className={`transition-colors hover:text-black dark:hover:text-white ${
              isActive
                ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-0.5'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
};

export default DesktopNavLinks;
