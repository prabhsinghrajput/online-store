import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck, RotateCcw, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch: cartDispatch } = useCart();
  const { items: wishlistItems, dispatch: wishlistDispatch } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`*, categories (name)`)
          .eq('id', id)
          .single();

        if (error) throw error;
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

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) setQuantity(newQuantity);
  };

  const addToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) cartDispatch({ type: 'ADD_ITEM', payload: product });
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center justify-center aspect-square"
          >
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain mix-blend-multiply"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Brand & Category */}
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md">{product.brand}</span>
              )}
              {product.categories?.name && (
                <span className="text-[11px] font-medium text-gray-400">{product.categories.name}</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
              {hasDiscount && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base text-gray-400 line-through">₹{product.price}</span>
                  <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                    {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
              {product.weight && (
                <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {product.weight}
                </span>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl w-fit">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                  className="p-3 hover:bg-gray-100 rounded-l-xl transition-colors text-gray-600 disabled:opacity-30">
                  <Minus size={16} />
                </button>
                <span className="px-5 py-2 font-bold text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}
                  className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors text-gray-600 disabled:opacity-30">
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-bold text-sm shadow-lg shadow-gray-400/20 hover:shadow-xl hover:shadow-gray-400/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={toggleWishlist}
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, text: 'Free Delivery' },
                { icon: ShieldCheck, text: '100% Genuine' },
                { icon: RotateCcw, text: 'Easy Returns' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <badge.icon size={16} className="text-primary" />
                  <span className="text-[10px] font-semibold text-gray-500">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                {['Description', 'Key Benefits', 'Usage'].map((tab) => {
                  const tabKey = tab === 'Key Benefits' ? 'benefits' : tab.toLowerCase();
                  const isActive = selectedTab === tabKey;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tabKey)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${isActive ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[120px] text-sm text-gray-600 leading-relaxed">
                {selectedTab === 'description' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-line">
                    {product.description || "No description available."}
                  </motion.p>
                )}
                {selectedTab === 'benefits' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {product.key_benefits ? (
                      <ul className="space-y-2">
                        {product.key_benefits.split('\n').map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p>No key benefits listed.</p>}
                  </motion.div>
                )}
                {selectedTab === 'usage' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-xs mb-2">Recommended Usage</h4>
                    <p className="whitespace-pre-line text-xs">{product.usage_instructions || "No instructions available."}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
