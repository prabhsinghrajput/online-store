import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft, Truck, ShieldCheck, RotateCcw, Heart, ChevronDown } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import api from "../../lib/api";
import { motion } from "framer-motion";
import Reviews from "./Reviews";
import Recommended from "./Recommended";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch: cartDispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.products.getById(id);
        if (data && data.category_id) {
          try {
            const cat = await api.categories.getById(data.category_id);
            data.categories = cat;
          } catch (e) {
            console.error("Error fetching product category:", e);
          }
        }
        if (data && data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Parse weight/sizes
  let parsedSizes = null;
  if (product && product.weight) {
    try {
      const obj = JSON.parse(product.weight);
      if (obj && typeof obj === 'object') {
        parsedSizes = obj;
      }
    } catch (e) {}
  }

  useEffect(() => {
    if (parsedSizes) {
      const available = Object.entries(parsedSizes).find(([_, stock]) => Number(stock) > 0);
      if (available) {
        setSelectedSize(available[0]);
      }
    }
  }, [product]);

  const getSelectedSizeStock = () => {
    if (parsedSizes && selectedSize) {
      return Number(parsedSizes[selectedSize]) || 0;
    }
    return product ? product.stock : 0;
  };

  const selectedSizeStock = getSelectedSizeStock();

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedSizeStock || 1)) setQuantity(newQuantity);
  };

  const addToCart = () => {
    if (product) {
      let cartProduct = { ...product };
      if (selectedSize) {
        cartProduct.id = `${product.id}-${selectedSize}`;
        cartProduct.weight = selectedSize;
        cartProduct.stock = selectedSizeStock; // override stock limit for this size
      }
      for (let i = 0; i < quantity; i++) cartDispatch({ type: 'ADD_ITEM', payload: cartProduct });
    }
  };

  const isWishlisted = product ? wishlistItems.some(item => item.id === product.id) : false;

  const toggleWishlist = () => {
    if (product) {
      wishlistDispatch({ type: 'TOGGLE_ITEM', payload: product });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-gray-400 mt-4">Loading product...</p>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3">
        <ShoppingCart size={24} className="text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{error || "Product Not Found"}</h2>
      <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline font-medium">Return Home</button>
    </div>
  );

  const displayPrice = product.discounted_price || product.price;
  const hasDiscount = product.discounted_price && product.discounted_price < product.price;

  const formatPrice = (value) => Number(value || 0).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-50 dark:bg-neutral-950 rounded-3xl overflow-hidden aspect-[3/4] flex items-center justify-center border border-gray-100 dark:border-neutral-900 shadow-sm relative"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col space-y-6"
          >
            <div>
              {/* Brand & Category */}
              <div className="flex items-center gap-2 mb-2">
                {product.brand && (
                  <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest bg-gray-100 dark:bg-neutral-900 px-2 py-0.5 rounded">
                    {product.brand}
                  </span>
                )}
                {product.categories?.name && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.categories.name}</span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">{product.name}</h1>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex items-center justify-between border-y border-gray-100 dark:border-neutral-900 py-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 dark:text-white">Rs. {formatPrice(displayPrice)}.00 INR</span>
                {hasDiscount && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">Rs. {formatPrice(product.price)}.00 INR</span>
                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${selectedSizeStock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedSizeStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                {selectedSizeStock > 0 ? `In Stock (${selectedSizeStock})` : 'Out of Stock'}
              </span>
            </div>

            {/* Sizes Select */}
            {parsedSizes ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block">Select Size</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(parsedSizes).map(([size, stock]) => {
                    const isAvailable = Number(stock) > 0;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`w-11 h-11 rounded-full text-xs font-bold uppercase transition-all flex items-center justify-center border ${
                          isSelected
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md scale-105'
                            : isAvailable
                              ? 'bg-white dark:bg-zinc-955 text-gray-800 dark:text-white border-gray-200 dark:border-neutral-850 hover:border-gray-400'
                              : 'bg-gray-50/50 dark:bg-neutral-900/50 text-gray-300 dark:text-neutral-700 border-transparent cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : product.weight ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block">Size</label>
                <span className="w-11 h-11 rounded-full border border-gray-200 dark:border-neutral-850 flex items-center justify-center text-xs font-bold text-gray-800 dark:text-white bg-white dark:bg-zinc-955">
                  {product.weight}
                </span>
              </div>
            ) : null}

            {/* Colors Selector */}
            {product && product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block">Select Color</label>
                  {selectedColor && (
                    <span className="text-[10px] font-bold text-gray-550 dark:text-neutral-400 uppercase tracking-wider">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                          isSelected
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                            : 'bg-white dark:bg-zinc-950 text-gray-805 dark:text-neutral-300 border-gray-200 dark:border-neutral-850 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Cart Controls */}
            <div className="flex items-center gap-3 pt-2">
              {/* Quantity */}
              <div className="flex items-center bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-850 rounded-full h-12 overflow-hidden shrink-0">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                  className="px-3.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 disabled:opacity-30 h-full flex items-center justify-center">
                  <Minus size={13} />
                </button>
                <span className="px-2 font-bold text-gray-900 dark:text-white min-w-[1.75rem] text-center text-xs">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= selectedSizeStock}
                  className="px-3.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 disabled:opacity-30 h-full flex items-center justify-center">
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                disabled={selectedSizeStock <= 0}
                className="flex-grow bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black h-12 rounded-full font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingCart size={14} />
                {selectedSizeStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center border transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-250 text-red-500 hover:bg-red-105' 
                    : 'bg-white dark:bg-zinc-955 border-gray-200 dark:border-neutral-850 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>

            {/* Accordion Collapse Blocks */}
            <div className="border-t border-gray-100 dark:border-neutral-900 pt-3">
              {/* Description & Fit Accordion */}
              <div className="border-b border-gray-100 dark:border-neutral-900 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-800 dark:text-neutral-250 text-left"
                >
                  <span>Description & Fit</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-300 ${openAccordion === 'description' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'description' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 text-xs text-gray-550 dark:text-neutral-400 leading-relaxed whitespace-pre-line font-medium"
                  >
                    {product.description || "No description available."}
                  </motion.div>
                )}
              </div>

              {/* Material & Care Accordion */}
              <div className="border-b border-gray-100 dark:border-neutral-900 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'benefits' ? '' : 'benefits')}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-800 dark:text-neutral-250 text-left"
                >
                  <span>Material & Care</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-300 ${openAccordion === 'benefits' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'benefits' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 text-xs text-gray-550 dark:text-neutral-400 leading-relaxed font-medium"
                  >
                    {product.key_benefits ? (
                      <ul className="space-y-2">
                        {product.key_benefits.split('\n').map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white flex-shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p>No material & care instructions listed.</p>}
                  </motion.div>
                )}
              </div>

              {/* Style Guide Accordion */}
              <div className="border-b border-gray-100 dark:border-neutral-900 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'usage' ? '' : 'usage')}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-800 dark:text-neutral-250 text-left"
                >
                  <span>Fit & Style Guide</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-300 ${openAccordion === 'usage' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'usage' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 text-xs text-gray-550 dark:text-neutral-400 leading-relaxed whitespace-pre-line font-medium"
                  >
                    {product.usage_instructions || "No style guide instructions available."}
                  </motion.div>
                )}
              </div>

              {/* Shipping Accordion */}
              <div className="border-b border-gray-100 dark:border-neutral-900 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-800 dark:text-neutral-250 text-left"
                >
                  <span>Shipping & Returns</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'shipping' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 text-xs text-gray-550 dark:text-neutral-400 leading-relaxed space-y-2 font-medium"
                  >
                    <p>• Standard Shipping: 3 - 5 business days delivery time.</p>
                    <p>• Returns: Easy 7-day hassle-free return or exchange window from date of delivery.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        {product && <Reviews productId={product.id} product={product} />}

        {/* Recommended Section */}
        {product && (
          <Recommended categoryId={product.category_id} currentProductId={product.id} />
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
