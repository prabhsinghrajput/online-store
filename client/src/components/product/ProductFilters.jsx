import React from 'react';

const ProductFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedSize,
  setSelectedSize,
  searchQuery,
  setSearchQuery,
  resetFilters
}) => {
  return (
    <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-neutral-900 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-950 dark:text-white">
          Filters
        </h3>
        <button 
          onClick={resetFilters}
          className="text-[10px] font-black tracking-wider text-gray-400 hover:text-black dark:hover:text-white uppercase transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Search bar inside filters */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-neutral-500 uppercase">
          Search Products
        </h4>
        <input 
          type="text" 
          placeholder="Type keywords..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#fcfcfc] dark:bg-[#050505] border border-gray-200 dark:border-neutral-800 rounded-[6px] text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
        />
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-neutral-500 uppercase">
          Category
        </h4>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-neutral-300 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={selectedCategory === 'all'}
              onChange={() => setSelectedCategory('all')}
              className="w-3.5 h-3.5 border-gray-300 dark:border-neutral-700 rounded text-black focus:ring-0 focus:outline-none"
            />
            All Categories
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-neutral-300 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={String(selectedCategory) === String(cat.id)}
                onChange={() => setSelectedCategory(String(cat.id))}
                className="w-3.5 h-3.5 border-gray-300 dark:border-neutral-700 rounded text-black focus:ring-0 focus:outline-none"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-neutral-500 uppercase">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="₹ Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-[#fcfcfc] dark:bg-[#050505] border border-gray-200 dark:border-neutral-800 rounded-[6px] text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          <span className="text-gray-300 dark:text-neutral-800">—</span>
          <input 
            type="number" 
            placeholder="₹ Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-[#fcfcfc] dark:bg-[#050505] border border-gray-200 dark:border-neutral-800 rounded-[6px] text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-neutral-500 uppercase">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-10 h-10 border text-xs font-bold uppercase transition-all rounded-[4px] ${selectedSize === size ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-transparent border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:border-gray-450 dark:hover:border-neutral-700'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
