import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// No default categories to avoid ID mismatch with Supabase UUIDs
const defaultBanners = [
  { id: 1, image: 'banner_supplements_1.png', title: 'Premium Supplements', description: 'Fuel your fitness journey with top-tier nutrition', buttonText: 'Shop Now' },
  { id: 2, image: 'banner_supplements_2.png', title: 'Fuel Your Gains', description: 'Exclusive deals on mass gainers and proteins', buttonText: 'View Offers' },
  { id: 3, image: 'banner_supplements_3.png', title: 'Health & Wellness', description: 'Vitamins, Fish Oils, and Green Superfoods', buttonText: 'Explore' }
];

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const { state, dispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();

  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState(defaultBanners);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (location.pathname.includes('/category/')) {
      sessionStorage.setItem('lastCategoryRoute', location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (categoriesData?.length > 0) setCategories(categoriesData);

        const { data: bannersData } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (bannersData?.length > 0) setBanners(bannersData);

        const { data: productsData } = await supabase
          .from('products')
          .select('*');

        if (productsData?.length > 0) {
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
      const allProducts = Object.values(products).flat();
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const getCartItem = (productId) => state.items.find(item => item.id === productId);
  const isWishlisted = (productId) => wishlistItems.some(item => item.id === productId);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-8">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gray-900 h-[220px] sm:h-[280px] md:h-[360px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentBanner}
              src={banners[currentBanner]?.image}
              alt={banners[currentBanner]?.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end pb-10 sm:pb-12">
            <div className="px-6 sm:px-10 md:px-14 max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                    <Sparkles size={12} />
                    Featured
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                    {banners[currentBanner]?.title}
                  </h2>
                  <p className="text-sm sm:text-base text-white/70 mb-4 line-clamp-2">
                    {banners[currentBanner]?.description}
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-lg"
                  >
                    {banners[currentBanner]?.buttonText || 'Shop Now'}
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentBanner ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-gray-800">Shop by Category</h2>
            </div>
            <Link to="/products" className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-0.5">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="group flex flex-col items-center"
                >
                  <div className="w-full aspect-square max-w-[110px] bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-gray-900 group-hover:-translate-y-1 transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-600 group-hover:text-primary text-center mt-2 transition-colors line-clamp-2">
                    {category.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Product Sections by Category */}
        <div className="space-y-8">
          {categories.map((category) => {
            const sectionProducts = products[category.id]?.slice(0, 6) || [];
            if (sectionProducts.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">{category.name}</h2>
                  </div>
                  <Link
                    to={`/category/${category.id}`}
                    className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-0.5"
                  >
                    See All <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {sectionProducts.map((product) => {
                    const cartItem = getCartItem(product.id);
                    const displayPrice = product.discounted_price || product.price;
                    const hasDiscount = product.discounted_price && product.discounted_price < product.price;

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative bg-gray-50/80 p-3 flex items-center justify-center h-32 sm:h-36">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          {hasDiscount && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                          >
                            <Heart size={14} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-3 space-y-1.5">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                          <p className="text-[10px] text-gray-400">{product.weight}</p>
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <span className="text-sm font-bold text-gray-900">₹{displayPrice}</span>
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-400 line-through ml-1">₹{product.price}</span>
                              )}
                            </div>
                            {cartItem ? (
                              <div
                                className="flex items-center bg-primary/5 border border-primary/20 rounded-lg overflow-hidden"
                                onClick={(e) => e.preventDefault()}
                              >
                                <button
                                  onClick={(e) => { e.preventDefault(); dispatch({ type: 'DECREASE_QUANTITY', payload: product.id }); }}
                                  className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 font-bold text-sm"
                                >
                                  −
                                </button>
                                <span className="w-6 h-7 flex items-center justify-center text-xs font-bold text-primary bg-white border-x border-primary/10">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={(e) => { e.preventDefault(); dispatch({ type: 'INCREASE_QUANTITY', payload: product.id }); }}
                                  className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 font-bold text-sm"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.preventDefault(); dispatch({ type: 'ADD_ITEM', payload: product }); }}
                                className="px-3 py-1.5 text-[11px] font-bold text-white bg-gray-900 rounded-lg shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
                              >
                                ADD
                              </button>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Results */}
        {searchQuery && filteredProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative bg-gray-50 p-3 flex items-center justify-center h-32">
                    <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                    >
                      <Heart size={14} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                    <p className="text-[10px] text-gray-400">{product.weight}</p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold text-gray-900">₹{product.discounted_price || product.price}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch({ type: 'ADD_ITEM', payload: product });
                        }}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-gray-900 rounded-lg shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;