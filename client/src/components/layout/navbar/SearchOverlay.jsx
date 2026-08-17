import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ShoppingCart } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import api from "../../../lib/api";

const SearchOverlay = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const allProducts = await api.products.getAll();
        if (controller.signal.aborted) return;
        const data = allProducts.filter(p =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(data || []);
        setShowResults((data || []).length > 0);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching search results:", error);
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-area')) {
        setShowResults(false);
        if (!searchQuery) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, onClose]);

  const handleClose = () => {
    setSearchQuery("");
    setShowResults(false);
    onClose();
  };

  const handleSelectProduct = (productId) => {
    navigate(`/products/${productId}`);
    handleClose();
  };

  return (
    <>
      {isOpen && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 flex items-center px-4 search-area animate-[fadeIn_0.15s_ease-out]">
          <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="search-input-field w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm font-semibold border-none"
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
              onClick={handleClose}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 ml-2"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-[#121214] shadow-2xl max-h-[70vh] overflow-y-auto border-t border-gray-100 dark:border-zinc-800 z-50 search-area">
          <div className="w-full px-6 md:px-12 py-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{searchResults.length} results for "{searchQuery}"</p>
              <button onClick={() => setShowResults(false)} className="text-xs text-primary font-semibold hover:underline">Close</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {searchResults.map((product) => (
                <div key={product.id}
                  className="group bg-zinc-50/80 dark:bg-[#0c0c0e] rounded-3xl border border-gray-100/70 dark:border-neutral-900 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer"
                  onClick={() => handleSelectProduct(product.id)}
                >
                  <div className="bg-gray-100/40 dark:bg-zinc-900/30 p-4 h-36 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 truncate mb-1.5 group-hover:text-primary transition-colors">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gray-900 dark:text-white">₹{product.discounted_price || product.price}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'ADD_ITEM', payload: product }); }}
                        className="w-8 h-8 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90"
                      >
                        <ShoppingCart size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchOverlay;
