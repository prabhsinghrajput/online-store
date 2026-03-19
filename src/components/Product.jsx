import React, { useState, useEffect } from 'react';
import { Search, Package, SlidersHorizontal, ChevronDown, Check, X, SortAsc, Filter, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();
  const navigate = useNavigate();

  // Filter & Sort States
  const [sortBy, setSortBy] = useState('default');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: catData } = await supabase.from('categories').select('*').order('name');
        setCategories(catData || []);
        const { data: prodData } = await supabase.from('products').select('*, categories(name)');
        setProducts(prodData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived Values
  const brands = React.useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ['all', ...Array.from(uniqueBrands)];
  }, [products]);

  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => String(p.category_id) === String(selectedCategory));
    }

    // Filter by Brand
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Filter by Stock
    if (showInStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
        break;
      case 'price_high':
        result.sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, showInStockOnly, sortBy]);

  const getCartItem = (productId) => state.items.find(item => item.id === productId);
  const isWishlisted = (productId) => wishlistItems.some(item => item.id === productId);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-gray-400 mt-4">Loading products...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">{filteredAndSortedProducts.length} products found</p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {/* Brand Filter */}
          <div className="relative">
            <button
              onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedBrand !== 'all' ? 'bg-gray-800 text-white border-gray-800 shadow-md shadow-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <SlidersHorizontal size={14} />
              {selectedBrand === 'all' ? 'Brands' : selectedBrand}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 max-h-64 overflow-y-auto"
                  >
                    {brands.map(brand => (
                      <button
                        key={brand}
                        onClick={() => { setSelectedBrand(brand); setIsFilterOpen(false); }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 capitalize"
                      >
                        {brand === 'all' ? 'All Brands' : brand}
                        {selectedBrand === brand && <Check size={14} className="text-gray-900" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${sortBy !== 'default' ? 'bg-gray-800 text-white border-gray-800 shadow-md shadow-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <SortAsc size={14} />
              {sortBy === 'default' ? 'Sort By' : sortBy === 'price_low' ? 'Low to High' : sortBy === 'price_high' ? 'High to Low' : 'Newest'}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40"
                  >
                    {[
                      { id: 'default', label: 'Default' },
                      { id: 'price_low', label: 'Price: Low to High' },
                      { id: 'price_high', label: 'Price: High to Low' },
                      { id: 'newest', label: 'Newest Arrivals' }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id); setIsSortOpen(false); }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {option.label}
                        {sortBy === option.id && <Check size={14} className="text-gray-900" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setShowInStockOnly(!showInStockOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${showInStockOnly ? 'bg-gray-800 border-gray-800 text-white shadow-md shadow-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${showInStockOnly ? 'bg-white border-white' : 'border-gray-300'}`}>
              {showInStockOnly && <Check size={10} className="text-gray-900 font-black" />}
            </div>
            In Stock Only
          </button>

          {/* Active Filters Clear */}
          {(selectedBrand !== 'all' || sortBy !== 'default' || showInStockOnly || searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSortBy('default');
                setShowInStockOnly(false);
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-gray-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === 'all'
              ? 'bg-gray-800 text-white shadow-lg shadow-gray-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === category.id
                ? 'bg-gray-800 text-white shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.map((product, i) => {
              const cartItem = getCartItem(product.id);
              const displayPrice = product.discounted_price || product.price;
              const hasDiscount = product.discounted_price && product.discounted_price < product.price;
              const isOutOfStock = product.stock <= 0;

              return (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 cursor-pointer transition-all duration-300 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* Image */}
                  <div className="relative bg-gray-50/80 p-4 flex items-center justify-center h-36 sm:h-40">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors z-10 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Heart size={14} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                    </button>
                    {hasDiscount && !isOutOfStock && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                      </span>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight h-8 sm:h-10">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      {product.weight && <p className="text-[10px] text-gray-400">{product.weight}</p>}
                      {product.brand && <p className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{product.brand}</p>}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-sm font-bold text-gray-900">₹{displayPrice}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through ml-1">₹{product.price}</span>
                        )}
                      </div>
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-3 py-1.5 text-[11px] font-bold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                        >
                          SOLD
                        </button>
                      ) : cartItem ? (
                        <div
                          className="flex items-center bg-primary/5 border border-primary/20 rounded-lg overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: product.id })}
                            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 font-bold text-sm"
                          >−</button>
                          <span className="w-6 h-7 flex items-center justify-center text-xs font-bold text-primary bg-white border-x border-primary/10">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: product.id })}
                            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 font-bold text-sm"
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'ADD_ITEM', payload: product }); }}
                          className="px-3 py-1.5 text-[11px] font-bold text-white bg-gray-900 rounded-lg shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <SlidersHorizontal size={24} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-800">No products match filters</h3>
            <p className="text-sm text-gray-400 mt-1">Try changing your filters, category, or search query</p>
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSortBy('default');
                setShowInStockOnly(false);
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;