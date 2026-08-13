import { Link } from "react-router-dom";

const FALLBACK_LINKS = ["New Arrivals", "Men", "Women", "Accessories"];

const DesktopNavLinks = ({ categories }) => {
  const filteredCategories = categories.filter(cat => cat.name?.toLowerCase() !== 'clothing');

  return (
    <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
      {filteredCategories.map((cat) => (
        <Link
          key={cat.id}
          to={`/${cat.name}`}
          className="hover:text-primary transition-colors"
        >
          {cat.name}
        </Link>
      ))}
      {categories.length === 0 && (
        <>
          {FALLBACK_LINKS.map((label) => (
            <Link key={label} to="/products" className="hover:text-primary transition-colors">
              {label}
            </Link>
          ))}
        </>
      )}
    </div>
  );
};

export default DesktopNavLinks;
