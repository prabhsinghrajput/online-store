import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const LookbookSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.getAll();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products for lookbook:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const lookbookItems = useMemo(() => {
    if (products.length >= 3) {
      return products.slice(0, 3).map(p => ({
        id: p.id || p._id,
        name: p.name,
        image: p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop"
      }));
    }
    // Fallback static if not enough items
    return [
      { id: '', name: 'Model 1', image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop" },
      { id: '', name: 'Model 2', image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop" },
      { id: '', name: 'Model 3', image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop" }
    ];
  }, [products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-transparent text-gray-900 dark:text-white py-8 my-8">
      {/* Left Content Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-550 dark:text-neutral-400 uppercase pb-1 border-b border-gray-200 dark:border-neutral-850 inline-block">
            Lookbook &apos;24
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
          <span className="text-gray-900 dark:text-white block">Timeless</span>
          <span className="text-gray-900 dark:text-white block">Pieces.</span>
          <span className="text-gray-450 dark:text-neutral-500 block">Limitless</span>
          <span className="text-gray-455 dark:text-neutral-500 block">Vibes.</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-550 dark:text-neutral-400 font-medium leading-relaxed">
          Designed for the streets.<br />
          Made for the misfits.
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition-all duration-300 rounded-[6px] shadow-sm"
        >
          Explore Lookbook &rarr;
        </button>
      </div>

      {/* Right Images Column */}
      <div className="lg:col-span-8 grid grid-cols-3 gap-3 md:gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-200 dark:bg-zinc-800 rounded-[6px] animate-pulse" />
          ))
        ) : (
          lookbookItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => item.id ? navigate(`/products/${item.id}`) : navigate('/products')}
              className="aspect-[2/3] overflow-hidden rounded-[6px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-neutral-850 cursor-pointer group relative"
            >
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                loading="lazy"
              />
              {/* Product Hover Overlay with Title */}
              {item.id && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-[10px] sm:text-xs font-bold text-white tracking-wide truncate w-full uppercase">
                    {item.name}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LookbookSection;
