import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';

const ProductGrid = ({
  filteredProducts,
  sortBy,
  setSortBy,
  resetFilters
}) => {
  const navigate = useNavigate();
  const [isSortOpen, setIsSortOpen] = useState(false);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'price_low': return 'Price: Low to High';
      case 'price_high': return 'Price: High to Low';
      case 'newest': return 'Newest';
      default: return 'Featured';
    }
  };

  return (
    <div className="lg:col-span-9 space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-950 dark:text-white">
          Collections
        </h2>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white"
          >
            Sort By: {getSortLabel()}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-md border border-gray-200 dark:border-neutral-800 shadow-lg py-1.5 z-40">
                {[
                  { value: 'featured', label: 'Featured' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    {option.label}
                    {sortBy === option.value && <Check size={12} className="text-black dark:text-white" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <p className="text-sm font-semibold text-gray-400 dark:text-neutral-500">No items found matching your filters.</p>
          <button onClick={resetFilters} className="text-[10px] font-black tracking-widest uppercase text-black dark:text-white underline">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isBestseller = product.rating >= 4.8;
            const displayPrice = product.discounted_price || product.price;

            return (
              <div 
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#fafafa] dark:bg-[#080808] rounded-md relative border border-gray-100 dark:border-neutral-900">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale brightness-95 dark:brightness-75 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                  />
                  {/* Bestseller Badge */}
                  {isBestseller && (
                    <span className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-[3px] select-none z-10 shadow-sm">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-neutral-500 font-bold">
                    ₹{displayPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-neutral-900">
          <button className="border border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-gray-900 dark:text-white text-[10px] font-black tracking-widest uppercase py-3.5 px-10 transition-colors rounded-[6px] bg-transparent">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGrid);
