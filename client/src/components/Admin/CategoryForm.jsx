import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, ImageIcon } from 'lucide-react';
import api from '../../lib/api';

const CategoryForm = () => {
    const navigate = useNavigate();
    const params = useParams();
    const wildcard = params['*'] || '';
    let id = params.id;
    if (!id && wildcard) {
        const parts = wildcard.split('/');
        if (parts[0] === 'categories' && parts[2] === 'edit') {
            id = parts[1];
        }
    }
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const data = await api.categories.getById(id);
            if (data) {
                setFormData({
                    name: data.name,
                    image: data.image || ''
                });
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const result = await api.upload.file(file, 'categories');
            setFormData(prev => ({ ...prev, image: result.url }));
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const categoryData = { ...formData };

            if (isEditMode) {
                await api.categories.update(id, categoryData);
            } else {
                await api.categories.create(categoryData);
            }
            navigate('/admin/categories');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none focus:bg-white transition-all";

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/admin/categories')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Category' : 'New Category'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{isEditMode ? 'Update category details' : 'Add a new category to your store'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Category Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {formData.image ? (
                            <div className="relative w-full max-w-[150px] mx-auto">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-32 object-contain rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData(prev => ({ ...prev, image: '' }));
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-inverse rounded-lg flex items-center justify-center hover:bg-red-600 z-10 shadow-md"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <ImageIcon size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                    {uploading ? 'Uploading...' : 'Click to upload image'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Category Name *</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Whey Protein" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/categories')}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Save Category'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
