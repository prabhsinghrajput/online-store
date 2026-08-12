import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';

const Wishlist = () => {
  const { items, dispatch: wishlistDispatch } = useWishlist();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = (productId) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  return (
    <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-sm text-gray-555 dark:text-neutral-400 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-955 rounded-3xl border border-gray-100 dark:border-neutral-900 shadow-sm">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-red-300 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-neutral-450 text-center max-w-sm mb-8">
              Save items you love to your wishlist to easily find and purchase them later.
            </p>
            <Link
              to="/products"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl font-semibold transition-colors"
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
              >
                <ProductCard product={product} variant="wishlist" onRemove={handleRemoveFromWishlist} />
              </motion.div>
            ))}
          </div>
        )}

    </div>
  );
};

export default Wishlist;
