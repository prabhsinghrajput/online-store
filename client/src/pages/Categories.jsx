import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Sparkles, TrendingUp, Heart, Star, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [allProductsList, setAllProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Best Selling');

  useEffect(() => {
    if (location.pathname.includes('/category/')) {
      sessionStorage.setItem('lastCategoryRoute', location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await api.categories.getAll();

        if (categoriesData?.length > 0) setCategories(categoriesData);

        const productsData = await api.products.getAll();

        if (productsData?.length > 0) {
          setAllProductsList(productsData);
          const productsByCategory = {};
          productsData.forEach(product => {
            const categoryId = product.category_id;
            if (!productsByCategory[categoryId]) productsByCategory[categoryId] = [];
            productsByCategory[categoryId].push(product);
          });
          setProducts(productsByCategory);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allProductsList.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, allProductsList]);

  const getCartItem = (productId) => state.items.find(item => item.id === productId);
  const isWishlisted = (productId) => wishlistItems.some(item => item.id === productId);

  // Helper to get products count for a category
  const getCategoryProductCount = (categoryId) => {
    return products[categoryId]?.length || 0;
  };

  // Get first 8 products for "Our Products" section
  const newReleases = allProductsList.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9fa] pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black h-[320px] sm:h-[400px] md:h-[480px] flex items-center">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95" 
            style={{ backgroundImage: `url('/hero_banner.png')` }}
          />
          {/* Left shadow overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Floating '30% OFF' Badge */}
          <div className="absolute top-[15%] right-[25%] sm:right-[35%] md:right-[42%] bg-[#e52e2e] text-white font-extrabold text-xs sm:text-sm md:text-base flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white/20 shadow-lg select-none transform rotate-[-12deg] z-10 animate-bounce">
            <span className="leading-none text-center">30%<br/><span className="text-[9px] sm:text-[10px] uppercase tracking-wider">OFF</span></span>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-12 md:px-16 max-w-xl space-y-4 sm:space-y-6">
            {/* Cyber Monday Badge */}
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-[#e52e2e] px-3 py-1.5 rounded-md shadow-sm">
              Cyber Monday Sale
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              Boost your <br />
              immune system <br />
              today
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium">
              24g of pure protein for enhanced lean muscle.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-[#f8e71c] hover:bg-[#e2d216] text-black font-black text-xs sm:text-sm tracking-wider uppercase px-6 py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
            >
              Shop Now <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="space-y-4">
          <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-4 min-w-max px-1">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/category/${category.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 min-w-[220px]"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl group-hover:scale-105 transition-transform duration-300 p-1">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold mt-0.5">
                      {getCategoryProductCount(category.id)} products
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Our Products Section */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase">
              Shop Our New Releases
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Our Products
            </h2>
          </div>

          {/* Search Bar on Homepage (Only shows if search queries are entered) */}
          {searchQuery && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-950">Search Results for "{searchQuery}"</h3>
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-500">No products found matching your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const cartItem = getCartItem(product.id);
                    const displayPrice = product.discounted_price || product.price;
                    const hasDiscount = product.discounted_price && product.discounted_price < product.price;

                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col justify-between">
                        <Link to={`/products/${product.id}`} className="block relative bg-gray-50 p-4 flex items-center justify-center h-48">
                          <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                          >
                            <Heart size={14} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                          </button>
                        </Link>
                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-2">{product.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold">{product.weight}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-extrabold text-gray-900">₹{displayPrice}</span>
                            <button
                              onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
                              className="px-3 py-1.5 text-[11px] font-bold text-white bg-gray-950 rounded-lg hover:bg-gray-850"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Main New Releases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newReleases.map((product) => {
              const cartItem = getCartItem(product.id);
              const displayPrice = product.discounted_price || product.price;
              const hasDiscount = product.discounted_price && product.discounted_price < product.price;

              // Find category name
              const categoryName = categories.find(c => c.id === product.category_id)?.name || "UNCATEGORIZED";

              return (
                <div 
                  key={product.id}
                  className="group bg-white rounded-3xl border border-gray-150 overflow-hidden hover:shadow-xl hover:border-gray-250 transition-all duration-300 flex flex-col justify-between h-full relative"
                >
                  {/* Image Container */}
                  <div className="relative bg-gray-50/50 p-6 flex items-center justify-center h-56 sm:h-64 w-full">
                    <Link to={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    
                    {hasDiscount && (
                      <span className="absolute top-4 left-4 bg-[#e52e2e] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                      }}
                      className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors z-10"
                    >
                      <Heart size={14} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                    </button>
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex-grow flex flex-col justify-between border-t border-gray-50 bg-white">
                    <div>
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                        {categoryName}
                      </span>
                      <Link to={`/products/${product.id}`} className="block">
                        <h3 className="font-extrabold text-sm text-gray-900 leading-snug line-clamp-2 min-h-[40px] hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-[#8bc34a] text-[#8bc34a]" />
                        ))}
                      </div>
                    </div>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">₹{displayPrice}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through font-semibold">₹{product.price}</span>
                        )}
                      </div>

                      {cartItem ? (
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-8">
                          <button
                            onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: product.id })}
                            className="w-7 h-full flex items-center justify-center text-gray-650 hover:bg-gray-100 font-bold text-xs"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2 text-xs font-black text-gray-900 bg-white h-full flex items-center justify-center min-w-[24px]">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: product.id })}
                            className="w-7 h-full flex items-center justify-center text-gray-650 hover:bg-gray-100 font-bold text-xs"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
                          className="bg-gray-100 text-gray-900 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-gray-950 active:scale-95 transition-all"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Products button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/products')}
              className="border-2 border-gray-950 text-gray-950 text-xs font-black tracking-widest uppercase py-3.5 px-8 hover:bg-gray-950 hover:text-white transition-all duration-300 rounded-lg flex items-center gap-2 shadow-sm"
            >
              View All Products <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Promo Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Left Large Card: Pre-workout Banner */}
          <div 
            className="relative rounded-3xl overflow-hidden shadow-lg h-[400px] md:h-[440px] flex items-end p-8 bg-cover bg-center text-white"
            style={{ backgroundImage: `url('/preworkout_promo.png')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="relative z-10 space-y-3 max-w-sm">
              <span className="bg-[#e52e2e] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                In Store Now
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                Gold Standard <br />Pre-workout
              </h3>
              <p className="text-sm font-semibold text-gray-200">
                Starting at ₹1,399.00
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-white/10 hover:bg-white/20 text-white font-black text-xs tracking-wider uppercase px-5 py-3 rounded-lg border border-white/20 backdrop-blur-sm transition-all"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Column Banners */}
          <div className="flex flex-col gap-6">
            {/* Top Banner: Member Discount */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-lg h-[190px] md:h-[208px] flex items-center p-8 bg-cover bg-center text-white"
              style={{ backgroundImage: `url('/members_promo.png')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 space-y-2 max-w-xs">
                <span className="text-xs text-gray-300 font-extrabold uppercase tracking-widest block">
                  Exclusive Items
                </span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">
                  Members <br />Save 10% More
                </h3>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-white hover:underline pt-2 uppercase tracking-wider"
                >
                  Join Us <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Bottom Banner: Premium Lux Pack */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-lg h-[190px] md:h-[208px] flex items-center p-8 bg-cover bg-center text-white"
              style={{ backgroundImage: `url('/lux_pack_promo.png')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 space-y-2 max-w-xs">
                <span className="text-xs text-gray-300 font-extrabold uppercase tracking-widest block">
                  New Product
                </span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">
                  Premium Lux Pack
                </h3>
                <p className="text-sm font-extrabold text-blue-400">
                  ₹15,900.00
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-white/10 hover:bg-white/20 text-white font-black text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg border border-white/20 backdrop-blur-sm transition-all"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tabs Section */}
        <div className="border-t border-gray-200 pt-10 flex flex-col items-center gap-6">
          <div className="flex gap-8 border-b border-gray-200 pb-2 w-full justify-center">
            {['Best Selling', 'Latest Deals', 'Recommended'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-black uppercase tracking-wider pb-2 relative transition-colors ${
                  activeTab === tab ? 'text-gray-950' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-950" />
                )}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Products Content */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
            {allProductsList
              .filter((_, idx) => {
                if (activeTab === 'Best Selling') return idx % 3 === 0;
                if (activeTab === 'Latest Deals') return idx % 2 === 0;
                return idx % 4 === 0;
              })
              .slice(0, 6)
              .map((product) => {
                const cartItem = getCartItem(product.id);
                return (
                  <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
                    <Link to={`/products/${product.id}`} className="bg-gray-50 p-2 rounded-xl flex items-center justify-center h-28">
                      <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                    </Link>
                    <div className="mt-2 space-y-1">
                      <h4 className="text-xs font-extrabold text-gray-900 line-clamp-1">{product.name}</h4>
                      <p className="text-[9px] text-gray-400 font-semibold">{product.weight}</p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-black text-gray-950">₹{product.discounted_price || product.price}</span>
                        <button
                          onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
                          className="w-6 h-6 bg-gray-950 text-white rounded-md flex items-center justify-center hover:bg-gray-850 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categories;