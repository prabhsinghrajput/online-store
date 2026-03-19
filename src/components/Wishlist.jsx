import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { items, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    cartDispatch({ type: 'ADD_ITEM', payload: product });
  };

  const handleRemoveFromWishlist = (productId) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-center max-w-sm mb-8">
              Save items you love to your wishlist to easily find and purchase them later.
            </p>
            <Link 
              to="/products"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Area */}
                <div onClick={() => navigate(`/products/${product.id}`)} className="cursor-pointer relative bg-gray-50/80 p-4 flex items-center justify-center aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{product.weight}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.discounted_price || product.price}
                      </span>
                      {product.discounted_price && product.discounted_price < product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-gray-200"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
