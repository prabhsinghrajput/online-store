import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ImageIcon, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { toast, confirm } = useToast();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await api.banners.getAll();
            setBanners(data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
            setError('Failed to load banners: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Delete Banner',
            message: 'Are you sure you want to delete this banner?',
            confirmLabel: 'Delete',
            danger: true
        });
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await api.banners.delete(id);
            setBanners(banners.filter(b => b.id !== id));
            toast('Banner deleted', 'success');
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast('Failed to delete banner', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            await api.banners.update(banner.id, { active: !banner.active });
            setBanners(banners.map(b => b.id === banner.id ? { ...b, active: !b.active } : b));
        } catch (error) {
            console.error('Error toggling banner status:', error);
            toast('Failed to update banner status', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading banners...</p>
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
                    <h2 className="text-2xl font-bold text-gray-800">Home Banners</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{banners.length} total banners</p>
                </div>
                <Link
                    to="/admin/banners/new"
                    className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} />
                    Add Banner
                </Link>
            </div>

            {/* List */}
            {banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <ImageIcon size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No banners found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row ${deletingId === banner.id ? 'opacity-50 scale-95' : ''}`}
                        >
                            <div className="w-full md:w-64 h-32 md:h-auto bg-gray-50 flex items-center justify-center overflow-hidden">
                                {banner.image ? (
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={24} className="text-gray-200" />
                                )}
                            </div>
                            <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-800">{banner.title || 'Untitled Banner'}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-1">{banner.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${banner.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {banner.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(banner)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${banner.active ? 'text-gray-500 hover:bg-gray-100' : 'text-primary hover:bg-primary/10'}`}
                                    >
                                        {banner.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <Link
                                        to={`/admin/banners/${banner.id}/edit`}
                                        className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerList;
