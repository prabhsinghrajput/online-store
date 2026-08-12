import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ShoppingCart, LogOut, ChevronDown, User, Package, Settings, LogIn, Heart, Moon, Sun } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { signOut } from "../../lib/auth";
import api from "../../lib/api";

const Navbar = ({ user }) => {
  const { state, dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce((sum, item) => sum + (item.discounted_price || item.price) * item.quantity, 0);
  const { totalItems: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const updateProfileImage = () => {
      if (user) {
        const storedProfile = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
        setProfileImage(storedProfile.photoURL || user.user_metadata?.avatar_url || null);
      } else {
        setProfileImage(null);
      }
    };

    updateProfileImage();
    window.addEventListener('profile:updated', updateProfileImage);
    window.addEventListener('auth:changed', updateProfileImage);

    return () => {
      window.removeEventListener('profile:updated', updateProfileImage);
      window.removeEventListener('auth:changed', updateProfileImage);
    };
  }, [user]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      try {
        const allProducts = await api.products.getAll();
        const data = allProducts.filter(p => 
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(data || []);
        setShowResults((data || []).length > 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };
    fetchSearchResults();
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) setIsDropdownOpen(false);
      if (!event.target.closest('.search-area')) {
        setShowResults(false);
        if (!searchQuery) setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Thin Promo Bar */}
      <div className="bg-black border-b border-neutral-900/60 dark:border-zinc-900/60 py-2 text-[10px] text-gray-400 font-bold tracking-[0.2em] text-center select-none uppercase">
        Free shipping on orders above ₹2499
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 relative">
        <div className="w-full px-6 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20 relative">
            {/* Navigation Links on Left */}
            <div className="hidden lg:flex items-center gap-6 font-bold text-xs uppercase tracking-wider text-gray-750 dark:text-gray-250">
              {categories.map((cat) => (
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
                  <Link to="/products" className="hover:text-primary transition-colors">New Arrivals</Link>
                  <Link to="/products" className="hover:text-primary transition-colors">Men</Link>
                  <Link to="/products" className="hover:text-primary transition-colors">Women</Link>
                  <Link to="/products" className="hover:text-primary transition-colors">Clothing</Link>
                  <Link to="/products" className="hover:text-primary transition-colors">Accessories</Link>
                </>
              )}
            </div>

            {/* Logo in Center */}
            <div className="absolute left-1/2 -translate-x-1/2 flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src={theme === 'dark' ? 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786183228/ChatGPT_Image_Aug_8_2026_03_30_05_PM_a98rks.png' : 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786181989/cross_logo_xlumhw.webp'} 
                  className="h-40 md:h-40 w-auto object-contain" 
                  alt="Logo" 
                />
              </Link>
            </div>

            {/* Actions / Right Side Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
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

              {/* Wishlist Icon */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white group"
              >
                <Heart size={20} className="group-hover:text-red-500 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950 select-none">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white group"
              >
                <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-950 select-none">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl p-1 pr-2 transition-colors"
                  >
                    <img
                      src={profileImage || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                      alt="Profile"
                      className="w-8 h-8 rounded-xl object-cover border border-gray-200 dark:border-slate-700"
                    />
                    <ChevronDown size={12} className={`text-gray-400 hidden md:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-1 border border-gray-100 z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                      <div className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-800 truncate">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-[11px] text-gray-450 truncate">{user.email}</p>
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-3 transition-colors"
                        >
                          <User size={16} /> Profile
                        </button>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-55 flex items-center gap-3 transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-sm transition-all">
                  <LogIn size={14} /> <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Toggle Overlay / Dropdown (Slide out) */}
          {isSearchOpen && (
            <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 flex items-center px-4 search-area animate-[fadeIn_0.15s_ease-out]">
              <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
                <Search className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm font-semibold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X size={16} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 ml-2"
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute left-0 right-0 top-full bg-white shadow-2xl max-h-[70vh] overflow-y-auto border-t border-gray-100 z-50 search-area">
              <div className="w-full px-6 md:px-12 py-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{searchResults.length} results for "{searchQuery}"</p>
                  <button onClick={() => setShowResults(false)} className="text-xs text-primary font-semibold hover:underline">Close</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {searchResults.map((product) => (
                    <div key={product.id}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => { navigate(`/products/${product.id}`); setShowResults(false); setSearchQuery(''); setIsSearchOpen(false); }}
                    >
                      <div className="bg-gray-50 p-3 h-28 flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">₹{product.discounted_price || product.price}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'ADD_ITEM', payload: product }); }}
                            className="w-7 h-7 bg-primary/10 hover:bg-primary hover:text-inverse text-primary rounded-lg flex items-center justify-center transition-colors"
                          >
                            <ShoppingCart size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </header>
  );
};

export default Navbar;
