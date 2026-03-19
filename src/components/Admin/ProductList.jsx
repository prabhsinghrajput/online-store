import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`*, categories (name)`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setDeletingId(id);
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group ${deletingId === product.id ? 'opacity-50 scale-95' : ''
                                }`}
                        >
                            {/* Image */}
                            <div className="relative h-40 bg-gray-50 flex items-center justify-center p-4">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <Package size={32} className="text-gray-200" />
                                )}
                                {/* Category Badge */}
                                <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-gray-600 rounded-lg border border-gray-200/50 shadow-sm">
                                    {product.categories?.name || 'Uncategorized'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-bold text-gray-900">₹{product.discounted_price || product.price}</span>
                                    {product.discounted_price && product.discounted_price < product.price && (
                                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${product.stock > 10 ? 'bg-green-50 text-green-600' :
                                        product.stock > 0 ? 'bg-amber-50 text-amber-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' :
                                            product.stock > 0 ? 'bg-amber-500' :
                                                'bg-red-500'
                                            }`} />
                                        {product.stock} in stock
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <Link
                                            to={`/admin/products/${product.id}/edit`}
                                            className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={15} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={15} />
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
