import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, LayoutGrid, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await api.categories.getAll();
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
            try {
                setDeletingId(id);
                await api.categories.delete(id);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading categories...</p>
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
                    <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{categories.length} total categories</p>
                </div>
                <Link
                    to="/admin/categories/new"
                    className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} />
                    Add Category
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            {/* Grid */}
            {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <LayoutGrid size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No categories found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group p-4 flex flex-col items-center text-center relative ${deletingId === category.id ? 'opacity-50 scale-95' : ''
                                }`}
                        >
                            <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                ) : (
                                    <LayoutGrid size={24} className="text-gray-200" />
                                )}
                            </div>
                            <h3 className="font-semibold text-gray-800 text-xs line-clamp-1">{category.name}</h3>
                            
                            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    to={`/admin/categories/${category.id}/edit`}
                                    className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit size={14} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryList;
