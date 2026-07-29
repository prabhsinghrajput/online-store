import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Package, SlidersHorizontal, ChevronDown, Check, X, SortAsc } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, TrendingUp, Sparkles, Filter, ChevronRight, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  // Filter & Sort States
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_low', 'price_high', 'newest'
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleBack = () => {
    sessionStorage.removeItem('lastCategoryRoute');
    navigate('/');
  };


  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [catData, prodData] = await Promise.all([
          api.categories.getById(id),
          api.products.getAll(),
        ]);

        setCategory(catData);
        setProducts(prodData.filter(p => p.category_id === id) || []);

      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Failed to load category products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategoryData();
  }, [id]);

  // Derived Values
  const brands = React.useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ['all', ...Array.from(uniqueBrands)];
  }, [products]);

  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...products];

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
  }, [products, selectedBrand, showInStockOnly, sortBy]);

  const getCartItem = (productId) => state.items.find(item => item.id === productId);
  const isWishlisted = (productId) => wishlistItems.some(item => item.id === productId);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-gray-400 mt-4">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3">
            <AlertCircle size={24} className="text-amber-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">{error}</h3>
          <p className="text-sm text-gray-400 mb-4">Try going back and selecting another category</p>
          <button onClick={handleBack} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-gray-200/50">
            Return Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            style={{ opacity: headerOpacity, scale: headerScale }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16 py-8"
          >
            {/* Left Content */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Premium Collection</span>
              </motion.div>

              <div className="space-y-2">
                <motion.button
                  onClick={handleBack}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4 mx-auto md:mx-0"
                >
                  <ArrowLeft size={14} /> Back to all Categories
                </motion.button>
                <motion.h1
                  className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {category?.name || 'Category'}
                </motion.h1>
                <motion.p
                  className="text-sm md:text-base text-gray-500 max-w-xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {category?.description || `Explore our premium selection of ${category?.name?.toLowerCase() || 'supplements'} crafted to fuel your performance and wellness goals.`}
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {[
                  { icon: Sparkles, text: 'Top Quality', color: 'text-amber-700 bg-amber-100/80' },
                  { icon: TrendingUp, text: 'Best Value', color: 'text-green-700 bg-green-100/80' },
                  { icon: Package, text: 'Safe Packing', color: 'text-blue-700 bg-blue-100/80' }
                ].map((tag, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/50 shadow-sm ${tag.color}`}>
                    <tag.icon size={12} />
                    {tag.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual */}
            <motion.div
              className="w-full md:w-1/3 aspect-square relative"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
              {category?.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/50 backdrop-blur-xl border border-gray-100/50 rounded-full shadow-inner">
                  <ShoppingBag size={80} className="text-gray-200" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-14 space-y-8 pb-20">
        {/* Sticky Filter Bar */}
        <motion.div
          className="sticky top-20 z-30 py-3 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm px-4 flex flex-wrap items-center justify-between gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Filter */}
            <div className="relative">
              <button
                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedBrand !== 'all' ? 'bg-gray-800 text-white border-gray-800 shadow-md shadow-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <Filter size={14} />
                {selectedBrand === 'all' ? 'Brands' : selectedBrand}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 max-h-72 overflow-y-auto"
                    >
                      <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Brand</span>
                        {selectedBrand !== 'all' && (
                          <button onClick={() => setSelectedBrand('all')} className="text-[10px] text-gray-900 font-bold hover:underline">Reset</button>
                        )}
                      </div>
                      {brands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => { setSelectedBrand(brand); setIsFilterOpen(false); }}
                          className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors capitalize font-medium"
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40"
                    >
                      <div className="px-3 py-2 border-b border-gray-50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort Order</span>
                      </div>
                      {[
                        { id: 'default', label: 'Recommended' },
                        { id: 'price_low', label: 'Price: Low to High' },
                        { id: 'price_high', label: 'Price: High to Low' },
                        { id: 'newest', label: 'Newest Arrivals' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setSortBy(option.id); setIsSortOpen(false); }}
                          className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
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

            {/* In Stock Only */}
            <button
              onClick={() => setShowInStockOnly(!showInStockOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${showInStockOnly ? 'bg-gray-800 border-gray-800 text-white shadow-md shadow-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${showInStockOnly ? 'bg-white border-white' : 'border-gray-300'}`}>
                {showInStockOnly && <Check size={10} className="text-gray-900 font-black" />}
              </div>
              In Stock Only
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Results</span>
              <span className="text-sm font-bold text-gray-900">{filteredAndSortedProducts.length} items found</span>
            </div>
            {(selectedBrand !== 'all' || sortBy !== 'default' || showInStockOnly) && (
              <button
                onClick={() => { setSelectedBrand('all'); setSortBy('default'); setShowInStockOnly(false); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-wider transition-colors"
              >
                <X size={12} /> Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
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
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={`/products/${product.id}`}
                    className={`group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-500 block relative h-full flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}
                  >
                    {/* Image Area */}
                    <div className="relative bg-gray-50/80 p-6 flex items-center justify-center h-44 sm:h-52 overflow-hidden">
                      {/* Brand Label Overlay */}
                      {product.brand && (
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-white/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 px-2 py-1 rounded-lg">
                            {product.brand}
                          </span>
                        </div>
                      )}

                      <img
                        src={product.image}
                        alt={product.name}
                        className={`max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out ${isOutOfStock ? 'grayscale' : ''}`}
                      />
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-md transition-colors z-20 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <Heart size={16} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>

                      {/* Overlays */}
                      {hasDiscount && !isOutOfStock && (
                        <div className="absolute top-4 left-4 flex flex-col gap-1">
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg shadow-red-500/30">
                            {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                          </span>
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-xl">Sold Out</span>
                        </div>
                      )}

                      {/* Quick View Hover State */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="w-full py-2 bg-white/90 backdrop-blur-md rounded-xl text-center shadow-lg border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest flex items-center justify-center gap-1">
                            View Details <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {product.flavor && (
                            <span className="text-[8px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{product.flavor}</span>
                          )}
                          {product.weight && (
                            <span className="text-[8px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{product.weight}</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight h-10 group-hover:text-gray-900 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-gray-900">₹{displayPrice}</span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-300 line-through">₹{product.price}</span>
                          )}
                        </div>

                        {isOutOfStock ? (
                          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                            <Package size={18} />
                          </div>
                        ) : cartItem ? (
                          <div className="flex items-center bg-gray-900 rounded-2xl p-1 gap-1" onClick={(e) => e.preventDefault()}>
                            <button
                              onClick={(e) => { e.preventDefault(); dispatch({ type: 'DECREASE_QUANTITY', payload: product.id }); }}
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors font-bold"
                            >−</button>
                            <span className="text-sm font-bold text-white w-4 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={(e) => { e.preventDefault(); dispatch({ type: 'INCREASE_QUANTITY', payload: product.id }); }}
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors font-bold"
                            >+</button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); dispatch({ type: 'ADD_ITEM', payload: product }); }}
                            className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 hover:bg-gray-800 hover:-translate-y-1 transition-all"
                          >
                            <ShoppingBag size={18} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
              <Package size={40} className="text-gray-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-400 text-center max-w-sm mb-8">
              We couldn't find any products matching your current filters. Try adjusting your selection.
            </p>
            <button
              onClick={() => { setSelectedBrand('all'); setSortBy('default'); setShowInStockOnly(false); }}
              className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-primary transition-all active:scale-95"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};


export default CategoryProducts;