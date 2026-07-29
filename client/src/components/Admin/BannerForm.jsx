import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, ImageIcon } from 'lucide-react';
import api from '../../lib/api';

const BannerForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        buttonText: '',
        image: '',
        active: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchBanner();
        }
    }, [id]);

    const fetchBanner = async () => {
        try {
            const banners = await api.banners.getAll();
            const data = banners.find(b => b.id === id);
            if (data) {
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    buttonText: data.buttonText || '',
                    image: data.image || '',
                    active: data.active
                });
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const result = await api.upload.file(file, 'banners');
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
            const bannerData = { ...formData };

            if (isEditMode) {
                await api.banners.update(id, bannerData);
            } else {
                await api.banners.create(bannerData);
            }
            navigate('/admin/banners');
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Failed to save banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none focus:bg-white transition-all";

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/admin/banners')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Banner' : 'New Banner'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">{isEditMode ? 'Update banner details' : 'Add a new hero banner to your store'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Banner Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {formData.image ? (
                            <div className="relative w-full">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData(prev => ({ ...prev, image: '' }));
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 z-10 shadow-md transition-colors"
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
                                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-1">Wide landscape images work best</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner Content</h3>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Banner Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g. Mega Summer Sale" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="e.g. Get up to 50% off on all proteins" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">Button Text</label>
                            <input name="buttonText" value={formData.buttonText} onChange={handleChange} className={inputClass} placeholder="e.g. Shop Now" />
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                            <input
                                type="checkbox"
                                id="active"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">Set as Active</label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/banners')}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-gray-400/20 hover:shadow-xl hover:shadow-gray-400/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : isEditMode ? 'Update Banner' : 'Save Banner'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BannerForm;
