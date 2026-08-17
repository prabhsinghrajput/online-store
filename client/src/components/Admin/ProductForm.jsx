import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, ImageIcon, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import CustomDropdown from '../common/CustomDropdown';

const ProductForm = () => {
    const navigate = useNavigate();
    const params = useParams();
    const wildcard = params['*'] || '';
    let id = params.id;
    if (!id && wildcard) {
        const parts = wildcard.split('/');
        if (parts[0] === 'products' && parts[2] === 'edit') {
            id = parts[1];
        }
    }
    const isEditMode = !!id;
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [sizeStocks, setSizeStocks] = useState([
        { size: 'S', stock: 0 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 0 },
        { size: 'XL', stock: 0 }
    ]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discounted_price: '',
        category_id: '',
        stock: 0,
        weight: '',
        brand: 'Cross',
        colors: [],
        key_benefits: '',
        usage_instructions: '',
        image: ''
    });

    const [customColor, setCustomColor] = useState('');
    const AVAILABLE_COLORS = ['Black', 'White', 'Grey', 'Beige', 'Navy', 'Olive', 'Cream', 'Brown'];

    const handleColorToggle = (color) => {
        setFormData(prev => {
            const currentColors = prev.colors || [];
            const newColors = currentColors.includes(color)
                ? currentColors.filter(c => c !== color)
                : [...currentColors, color];
            return { ...prev, colors: newColors };
        });
    };

    const handleAddCustomColor = (e) => {
        e.preventDefault();
        const trimmed = customColor.trim();
        if (trimmed) {
            const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            if (!formData.colors.includes(formatted)) {
                setFormData(prev => ({
                    ...prev,
                    colors: [...prev.colors, formatted]
                }));
            }
            setCustomColor('');
        }
    };

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await api.categories.getAll();
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const data = await api.products.getById(id);
            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    price: data.price,
                    discounted_price: data.discounted_price || '',
                    category_id: data.category_id || '',
                    stock: data.stock || 0,
                    weight: data.weight || '',
                    brand: data.brand || 'Cross',
                    colors: data.colors || [],
                    key_benefits: data.key_benefits || '',
                    usage_instructions: data.usage_instructions || '',
                    image: data.image || ''
                });

                if (data.weight) {
                    try {
                        const parsed = JSON.parse(data.weight);
                        if (parsed && typeof parsed === 'object') {
                            const loadedSizes = Object.entries(parsed).map(([size, stock]) => ({
                                size,
                                stock: Number(stock) || 0
                            }));
                            if (loadedSizes.length > 0) {
                                setSizeStocks(loadedSizes);
                            }
                        }
                    } catch (e) {
                        // Keep default sizes if weight is not JSON
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSizeStockChange = (index, field, value) => {
        setSizeStocks(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: field === 'stock' ? (value === '' ? '' : parseInt(value) || 0) : value
            };
            return updated;
        });
    };

    const addSizeRow = () => {
        setSizeStocks(prev => [...prev, { size: '', stock: 0 }]);
    };

    const removeSizeRow = (index) => {
        setSizeStocks(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const result = await api.upload.file(file, 'products');
            setFormData(prev => ({ ...prev, image: result.url }));
        } catch (error) {
            toast('Error uploading image: ' + error.message, 'error');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.discounted_price && Number(formData.discounted_price) >= Number(formData.price)) {
            toast('Discounted price must be less than regular price', 'error');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const selectedCategoryObj = categories.find(c => String(c.id) === String(formData.category_id));
            const isAccessories = selectedCategoryObj?.name?.toLowerCase() === 'accessories';

            let totalStock = 0;
            let weightVal = '';

            if (isAccessories) {
                totalStock = parseInt(formData.stock) || 0;
                weightVal = '';
            } else {
                const sizeMap = {};
                sizeStocks.forEach(item => {
                    if (item.size.trim()) {
                        sizeMap[item.size.trim().toUpperCase()] = Number(item.stock) || 0;
                    }
                });
                totalStock = Object.values(sizeMap).reduce((sum, s) => sum + s, 0);
                weightVal = JSON.stringify(sizeMap);
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
                stock: totalStock,
                weight: weightVal
            };

            if (isEditMode) {
                await api.products.update(id, productData);
            } else {
                await api.products.create(productData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            toast('Failed to save product: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const selectedCategoryObj = categories.find(c => String(c.id) === String(formData.category_id));
    const isAccessories = selectedCategoryObj?.name?.toLowerCase() === 'accessories';

    const inputClass = "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none focus:bg-white transition-all";

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
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
                            <input required name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Oversized Graphic Tee" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Category *</label>
                            <CustomDropdown
                                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                                value={formData.category_id}
                                onChange={(e) => handleChange({ target: { name: 'category_id', value: e.target.value } })}
                                placeholder="Select Category"
                                className="w-full text-sm font-semibold"
                            />
                        </div>

                        {/* Conditional Sizes & Individual Stock */}
                        {!isAccessories && (
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Sizes & Individual Stock</label>
                                    <button
                                        type="button"
                                        onClick={addSizeRow}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        + Add Size Row
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {sizeStocks.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-200 relative group">
                                            <div className="flex-1 space-y-1">
                                                <input
                                                    required
                                                    type="text"
                                                    value={item.size}
                                                    placeholder="Size (e.g. M)"
                                                    onChange={(e) => handleSizeStockChange(index, 'size', e.target.value)}
                                                    className="w-full bg-transparent text-xs font-bold focus:outline-none uppercase"
                                                />
                                                <input
                                                    required
                                                    type="number"
                                                    min="0"
                                                    value={item.stock}
                                                    placeholder="Stock"
                                                    onChange={(e) => handleSizeStockChange(index, 'stock', e.target.value)}
                                                    className="w-full bg-transparent text-[11px] text-gray-500 focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSizeRow(index)}
                                                className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            <label className="text-xs font-medium text-gray-600">
                                {isAccessories ? 'Total Stock *' : 'Total Stock (Calculated)'}
                            </label>
                            {isAccessories ? (
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="0"
                                />
                            ) : (
                                <input
                                    disabled
                                    type="number"
                                    value={sizeStocks.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)}
                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</h3>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Describe the style, fit, and aesthetic of this garment..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Material & Care</label>
                        <textarea name="key_benefits" rows={3} value={formData.key_benefits} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="e.g. 100% Premium French Terry Cotton, 240 GSM. Machine wash cold, tumble dry low." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Fit & Style Guide</label>
                        <textarea name="usage_instructions" rows={2} value={formData.usage_instructions} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="e.g. Relaxed oversized fit with drop shoulders. Model is 6'1 wearing size L." />
                    </div>

                    {/* Colors Selection Grid */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <label className="text-xs font-semibold text-gray-700 block uppercase tracking-wider">Garment Colors (Select Multiple)</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_COLORS.map(color => {
                                const selected = formData.colors?.includes(color);
                                return (
                                    <button
                                        type="button"
                                        key={color}
                                        onClick={() => handleColorToggle(color)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                            selected
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Color Creator Input */}
                        <div className="flex gap-2 max-w-sm mt-2">
                            <input
                                type="text"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                placeholder="Enter custom color (e.g. Sage)"
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomColor}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl transition-colors"
                            >
                                Add Color
                            </button>
                        </div>

                        {/* Custom Colors Pill Indicators */}
                        {formData.colors?.filter(c => !AVAILABLE_COLORS.includes(c)).length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center mt-2.5">
                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Custom Added:</span>
                                {formData.colors.filter(c => !AVAILABLE_COLORS.includes(c)).map(color => (
                                    <span key={color} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                                        {color}
                                        <button 
                                            type="button" 
                                            onClick={() => handleColorToggle(color)} 
                                            className="text-gray-400 hover:text-red-500 font-extrabold ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
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
                        className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
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
