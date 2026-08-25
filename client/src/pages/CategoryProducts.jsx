import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Package,
  ChevronDown,
  Check,
  X,
  Search,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import CustomDropdown from '../components/common/CustomDropdown';
import api from '../lib/api';

const sortOptions = [
  { value: 'default', label: 'Sort by: Featured' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' }
];

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort States
  const [sortBy, setSortBy] = useState('default');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSortBy('default');
    setShowInStockOnly(false);
    setPriceMin('');
    setPriceMax('');
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [prodData, allCats] = await Promise.all([
          api.products.getAll({ signal: controller.signal }),
          api.categories.getAll({ signal: controller.signal }),
        ]);

        const catsList = allCats || [];
        setAllCategories(catsList);

        const cleanId = decodeURIComponent(id || '').toLowerCase().trim();
        const slugId = cleanId.replace(/\s+/g, '-');

        if (!id || cleanId === 'products') {
          setCategory({ name: 'All Products', description: 'Browse our complete catalog of products' });
          setProducts(prodData || []);
        } else {
          // Find the category by ID, name, or slug
          let matchedCat = catsList.find(
            (c) =>
              String(c.id) === String(id) ||
              String(c._id) === String(id) ||
              c.name?.toLowerCase().trim() === cleanId ||
              c.name?.toLowerCase().trim().replace(/\s+/g, '-') === slugId
          );

          if (!matchedCat) {
            try {
              matchedCat = await api.categories.getById(id, { signal: controller.signal });
            } catch (e) {
              // ignore fallback error
            }
          }

          // Handle New Arrivals specifically
          if (
            slugId === 'new-arrivals' ||
            cleanId === 'new arrivals' ||
            matchedCat?.name?.toLowerCase().trim() === 'new arrivals'
          ) {
            const catObj = matchedCat || { name: 'New Arrivals' };
            setCategory(catObj);

            // If products explicitly tagged with New Arrivals category exist, show them;
            // otherwise show all products sorted by newest first
            const explicitNewArrivals = (prodData || []).filter(
              (p) =>
                (matchedCat &&
                  String(p.category_id) === String(matchedCat.id || matchedCat._id)) ||
                p.is_new_arrival
            );

            if (explicitNewArrivals.length > 0) {
              setProducts(explicitNewArrivals);
            } else {
              const newestProducts = [...(prodData || [])].sort(
                (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
              );
              setProducts(newestProducts);
            }
          } else if (matchedCat) {
            setCategory(matchedCat);
            setProducts(
              (prodData || []).filter(
                (p) => String(p.category_id) === String(matchedCat.id || matchedCat._id)
              )
            );
          } else {
            // Known fallback mapping if categories API is still loading or category wasn't found directly
            const knownFallbacks = {
              men: { name: 'Men' },
              women: { name: 'Women' },
              accessories: { name: 'Accessories' },
            };

            if (knownFallbacks[slugId]) {
              const fallbackCat = knownFallbacks[slugId];
              const fallbackMatchedCat = catsList.find((c) =>
                c.name?.toLowerCase().includes(slugId)
              );
              setCategory(fallbackCat);
              if (fallbackMatchedCat) {
                setProducts(
                  (prodData || []).filter(
                    (p) =>
                      String(p.category_id) ===
                      String(fallbackMatchedCat.id || fallbackMatchedCat._id)
                  )
                );
              } else {
                setProducts(prodData || []);
              }
            } else {
              setError('Category not found');
              setProducts([]);
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching category products:', err);
        setError('Failed to load category products');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();

    return () => controller.abort();
  }, [id]);

  // Derived Values
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map((p) => p.brand).filter(Boolean));
    return ['all', ...Array.from(uniqueBrands)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q)
      );
    }

    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    if (showInStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (priceMin !== '') {
      result = result.filter((p) => (p.discounted_price || p.price) >= Number(priceMin));
    }

    if (priceMax !== '') {
      result = result.filter((p) => (p.discounted_price || p.price) <= Number(priceMax));
    }

    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
        break;
      case 'price_high':
        result.sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedBrand, showInStockOnly, priceMin, priceMax, sortBy]);

  const hasActiveFilters = selectedBrand !== 'all' || sortBy !== 'default' || showInStockOnly || searchQuery || priceMin !== '' || priceMax !== '';

  const resetFilters = () => {
    setSelectedBrand('all');
    setSortBy('default');
    setShowInStockOnly(false);
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-64 bg-white h-96 rounded-3xl border border-gray-100 animate-pulse hidden lg:block" />
          <div className="flex-1 space-y-6">
            <div className="h-20 bg-gray-100 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-44 sm:h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
                    <div className="h-2.5 w-3/4 bg-gray-100 rounded" />
                    <div className="h-5 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-amber-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{error}</h3>
            <p className="text-sm text-gray-400 mb-4">Try going back and selecting another category</p>
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-gray-200/50"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Right Main Content */}
          <main className="flex-1 space-y-6">
            {/* Header / Info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{category?.name || 'Collections'}</h1>
                <p className="text-xs text-gray-400 font-semibold mt-1">{filteredAndSortedProducts.length} items found</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all font-semibold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort By Select */}
                <CustomDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-[160px]"
                />
              </div>
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-gray-100">
                <Package size={40} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-400 mb-6">Try clearing your filters or checking a different keyword</p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} variant="default" />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
