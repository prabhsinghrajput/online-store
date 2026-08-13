import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, Moon, Sun, LogIn } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useTheme } from "../../../context/ThemeContext";
import UserMenu from "./UserMenu";

const Badge = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950 select-none">
      {count}
    </span>
  );
};

const NavActions = ({ user, profileImage, onLogout, onSearchToggle }) => {
  const navigate = useNavigate();
  const { state } = useCart();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const { totalItems: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Search Toggle Icon (Desktop only) */}
      <button
        onClick={onSearchToggle}
        className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
        aria-label="Toggle Search"
      >
        <Search size={20} />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Wishlist Icon (Desktop only) */}
      <button
        onClick={() => navigate('/wishlist')}
        className="hidden lg:block relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white group"
      >
        <Heart size={20} className="group-hover:text-red-500 transition-colors" />
        <Badge count={wishlistCount} />
      </button>

      {/* Cart Icon */}
      <button
        onClick={() => navigate('/cart')}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white group"
      >
        <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
        <Badge count={totalItems} />
      </button>

      {/* User Menu */}
      {user ? (
        <UserMenu user={user} profileImage={profileImage} onLogout={onLogout} />
      ) : (
        <Link to="/login" className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-sm transition-all">
          <LogIn size={14} /> <span className="hidden sm:inline">Sign In</span>
        </Link>
      )}
    </div>
  );
};

export default NavActions;
