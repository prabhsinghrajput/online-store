import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Package, ShoppingBag, ChevronRight } from 'lucide-react';

const AdminDashboardCard = ({ isAdmin }) => {
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/5 dark:to-orange-950/5 border border-amber-100 dark:border-amber-900/10 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 flex-shrink-0">
          <Shield size={22} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Admin Dashboard</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-500">Manage products & orders</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 hover:bg-amber-50/20 dark:hover:bg-amber-950/5 border border-gray-200 dark:border-neutral-900 rounded-2xl transition-all duration-300 hover:shadow-sm group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/10 rounded-xl flex items-center justify-center">
              <Package size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200">Products</span>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 hover:bg-amber-50/20 dark:hover:bg-amber-950/5 border border-gray-200 dark:border-neutral-900 rounded-2xl transition-all duration-300 hover:shadow-sm group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200">Orders</span>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardCard;
