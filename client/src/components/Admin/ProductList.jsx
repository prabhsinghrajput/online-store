import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Search, Package, AlertCircle, Plus, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import CustomDropdown from '../common/CustomDropdown';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { toast, confirm } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                api.products.getAll(),
                api.categories.getAll()
            ]);
            setCategories(categoriesData || []);
            const mapped = (productsData || []).map(p => {
                const cat = (categoriesData || []).find(c => String(c.id) === String(p.category_id));
                return {
                    ...p,
                    categoryName: cat ? cat.name : 'Uncategorized'
                };
            });
            setProducts(mapped);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            confirmLabel: 'Delete',
            danger: true
        });
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await api.products.delete(id);
            setProducts(products.filter(p => p.id !== id));
            toast('Product deleted', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast('Failed to delete product', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || String(product.category_id) === String(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading products...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{products.length} total products</p>
                </div>
                
                {/* Search and Category Filter shifted inline */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:max-w-xs w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>

                    <CustomDropdown
                        options={[{ value: 'all', label: 'All Categories' }, ...categories.map(cat => ({ value: cat.id, label: cat.name }))]}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        placeholder="All Categories"
                        className="w-full sm:w-44 shrink-0 text-sm font-semibold"
                    />
                </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Package size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`group block relative bg-transparent transition-all duration-300 flex flex-col justify-between ${
                                deletingId === product.id ? 'opacity-50 scale-95' : ''
                            }`}
                        >
                            {/* Image Frame */}
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-950 flex items-center justify-center border border-gray-100 dark:border-neutral-900">
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <Package size={24} className="text-gray-300" />
                                )}
                                
                                {/* Category Badge */}
                                <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/95 text-[9px] font-black uppercase tracking-wider text-gray-800 rounded shadow-sm border border-gray-100/50 z-10">
                                    {product.categoryName || 'Uncategorized'}
                                </span>
                            </div>

                            {/* Info Block */}
                            <div className="pt-3 pb-1 space-y-1">
                                <h3 className="font-bold text-gray-900 dark:text-neutral-200 text-sm line-clamp-1 leading-normal tracking-wide group-hover:text-gray-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-extrabold text-gray-900 dark:text-white">Rs. {Number(product.discounted_price || product.price).toLocaleString('en-IN')} INR</span>
                                    {product.discounted_price && product.discounted_price < product.price && (
                                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 line-through">Rs. {Number(product.price).toLocaleString('en-IN')} INR</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-100/60 dark:border-neutral-800/70">
                                    {/* Minimal Stock Indicator */}
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-neutral-500">
                                        <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/admin/products/${product.id}/edit`}
                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-neutral-900 flex items-center justify-center transition-all"
                                            title="Edit Product"
                                        >
                                            <Edit size={13} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 flex items-center justify-center transition-all"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
