import { Link } from "react-router-dom";
import { Home, Search, Heart, Package, User } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";

const MobileBottomNav = ({ user, profileImage, onSearchOpen, onProfileMenuOpen }) => {
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-zinc-800/80 py-3 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Home Link */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Home size={20} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Home</span>
        </Link>

        {/* Search Button */}
        <button
          onClick={() => {
            onSearchOpen();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Search size={20} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Search</span>
        </button>

        {/* Wishlist Link with Badge */}
        <Link
          to="/wishlist"
          className="relative flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <div className="relative">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950 select-none">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase">Wishlist</span>
        </Link>

        {/* Orders Link */}
        <Link
          to="/orders"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Package size={20} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Orders</span>
        </Link>

        {/* Profile / Account Link */}
        {user ? (
          <button
            onClick={onProfileMenuOpen}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <img
              src={profileImage || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
              alt="Profile"
              className="w-5 h-5 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
            />
            <span className="text-[10px] font-bold tracking-wider uppercase">Profile</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <User size={20} />
            <span className="text-[10px] font-bold tracking-wider uppercase">Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileBottomNav;
