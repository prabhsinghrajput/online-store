import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ShoppingCart, LogOut, ChevronDown, User, Package, Settings, LogIn, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabase";

const Navbar = ({ user }) => {
  const { state, dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce((sum, item) => sum + (item.discounted_price || item.price) * item.quantity, 0);
  const { totalItems: wishlistCount } = useWishlist();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${searchQuery}%`);
        if (error) { console.error("Supabase search error:", error); return; }
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
      if (!event.target.closest('.search-area')) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
            <span className="font-bold text-lg tracking-tight text-gray-900 hidden sm:block">Fuel Supplements</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 search-area">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search for supplements..."
                className="w-full bg-gray-100/80 rounded-xl pl-10 pr-10 py-2.5 text-sm border border-transparent focus:border-primary/30 focus:bg-white focus:shadow-md outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="relative">
                <Heart size={20} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch({ type: "OPEN_CART" })}
              className="relative flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="relative">
                <ShoppingCart size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[10px] text-gray-400 font-medium">Cart</span>
                <span className="text-xs font-bold text-gray-700">₹{totalAmount}</span>
              </div>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-1.5 pr-3 transition-colors"
                >
                  <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                    alt="Profile"
                    className="w-8 h-8 rounded-xl object-cover border border-gray-200"
                  />
                  <ChevronDown size={12} className={`text-gray-400 hidden md:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-1 border border-gray-100 z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { icon: User, label: 'Profile', path: '/profile' },
                        { icon: Package, label: 'My Orders', path: '/orders' },
                        { icon: Settings, label: 'Settings', path: '/settings' },
                      ].map((item) => (
                        <button key={item.path} onClick={() => { navigate(item.path); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-3 transition-colors"
                        >
                          <item.icon size={16} /> {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all">
                <LogIn size={16} /> <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3 search-area">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100/80 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full bg-white shadow-2xl max-h-[70vh] overflow-y-auto border-t border-gray-100 z-50 search-area">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{searchResults.length} results for "{searchQuery}"</p>
                <button onClick={() => setShowResults(false)} className="text-xs text-primary font-semibold hover:underline">Close</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.map((product) => (
                  <div key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => { navigate(`/products/${product.id}`); setShowResults(false); setSearchQuery(''); }}
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
                          className="w-7 h-7 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg flex items-center justify-center transition-colors"
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </nav>
  );
};

export default Navbar;
