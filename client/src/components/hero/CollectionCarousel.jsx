import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ShoppingBag } from 'lucide-react';

const CollectionCarousel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products for carousel:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-900 dark:text-white uppercase select-none">
          Shop The Collection
        </h2>
        <Link 
          to="/products" 
          className="text-[10px] font-bold tracking-wider text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white uppercase flex items-center gap-1 transition-colors border-b border-gray-300 dark:border-gray-700 pb-0.5"
        >
          View All Products &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[220px] sm:w-[280px] md:w-[320px] flex flex-col gap-3.5 animate-pulse">
              <div className="aspect-[3/4] w-full bg-neutral-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-zinc-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            {products.map((product) => {
              const prodId = product.id || product._id;
              // Format price properly
              const formattedPrice = `₹${product.price}`;

              return (
                <div 
                  key={prodId}
                  onClick={() => navigate(`/products/${prodId}`)}
                  className="w-[220px] sm:w-[280px] md:w-[320px] cursor-pointer group flex flex-col gap-3.5"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-gray-150 dark:bg-zinc-900 rounded-md relative border border-gray-100 dark:border-neutral-900">
                    {product.image || (product.images && product.images[0]) ? (
                      <img 
                        src={product.image || product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-zinc-900 text-neutral-400">
                        <ShoppingBag size={36} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-gray-550 dark:text-gray-400 font-bold">
                      {formattedPrice}
                    </p>
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {product.colors.map((color, idx) => (
                          <span 
                            key={idx}
                            className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border border-gray-300 dark:border-neutral-700 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-neutral-50 dark:bg-zinc-900/10 rounded-2xl border border-dashed border-neutral-200 dark:border-zinc-800">
          <p className="text-xs text-neutral-500 font-bold">No products found in database</p>
        </div>
      )}
    </div>
  );
};

export default CollectionCarousel;
