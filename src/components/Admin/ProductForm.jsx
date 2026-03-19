import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, ImageIcon, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discounted_price: '',
        category_id: '',
        stock: '',
        weight: '',
        brand: '',
        key_benefits: '',
        usage_instructions: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    price: data.price,
                    discounted_price: data.discounted_price || '',
                    category_id: data.category_id || '',
                    stock: data.stock || 0,
                    weight: data.weight || '',
                    brand: data.brand || '',
                    key_benefits: data.key_benefits || '',
                    usage_instructions: data.usage_instructions || '',
                    image: data.image || ''
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
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
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image: data.publicUrl }));
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
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
                stock: parseInt(formData.stock),
            };

            let error;
            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productData]);
                error = insertError;
            }

            if (error) throw error;
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none focus:bg-white transition-all";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Product' : 'New Product'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{isEditMode ? 'Update product details' : 'Add a new product to your store'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Product Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {formData.image ? (
                            <div className="relative w-full max-w-xs mx-auto">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-48 object-contain rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData(prev => ({ ...prev, image: '' }));
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 z-10 shadow-md"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-4">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                    {uploading ? (
                                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <ImageIcon size={22} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {uploading ? 'Uploading...' : 'Click to upload image'}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Product Name *</label>
                            <input required name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Whey Protein" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Category *</label>
                            <div className="relative">
                                <select required name="category_id" value={formData.category_id} onChange={handleChange} className={`${inputClass} appearance-none pr-10`}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Brand</label>
                            <input name="brand" value={formData.brand} onChange={handleChange} className={inputClass} placeholder="e.g. MuscleBlaze" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Weight / Size</label>
                            <input name="weight" value={formData.weight} onChange={handleChange} className={inputClass} placeholder="e.g. 1kg, 500g" />
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing & Stock</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Price (₹) *</label>
                            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0.00" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Discounted Price (₹)</label>
                            <input type="number" step="0.01" name="discounted_price" value={formData.discounted_price} onChange={handleChange} className={inputClass} placeholder="Optional" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Stock *</label>
                            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h3>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Describe this product..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Key Benefits</label>
                        <textarea name="key_benefits" rows={3} value={formData.key_benefits} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="List key benefits..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Usage Instructions</label>
                        <textarea name="usage_instructions" rows={2} value={formData.usage_instructions} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="How to use..." />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 pb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-gray-400/20 hover:shadow-xl hover:shadow-gray-400/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
