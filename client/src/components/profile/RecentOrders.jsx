import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import api from '../../lib/api';

const STATUS_STYLES = {
  delivered: 'bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400',
  shipped: 'bg-blue-50 dark:bg-blue-950/25 text-blue-700 dark:text-blue-400',
  processing: 'bg-orange-50 dark:bg-orange-950/25 text-orange-700 dark:text-orange-400',
  pending: 'bg-yellow-50 dark:bg-yellow-950/25 text-yellow-700 dark:text-yellow-400',
  cancelled: 'bg-red-50 dark:bg-red-950/25 text-red-700 dark:text-red-400',
};

const RecentOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getAll();
        if (!controller.signal.aborted) {
          setOrders((data || []).slice(0, 3));
        }
      } catch {
        // silently fail — component just shows nothing
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchOrders();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl shadow-sm dark:shadow-none p-6 flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
          Recent Orders
        </h3>
        <button
          onClick={() => navigate('/orders')}
          className="text-[10px] font-black tracking-widest uppercase text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5"
        >
          View All Orders →
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-neutral-900">
        {orders.map((order) => {
          const firstItem = order.items?.[0];
          const itemDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="p-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-neutral-900/20 transition-colors cursor-pointer"
            >
              <img
                src={firstItem?.product_image || ''}
                alt={firstItem?.product_name || 'Product'}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-neutral-900 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{firstItem?.product_name || 'Order'}</h4>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold mt-0.5">Order #{order.id?.slice(0, 8)}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold uppercase">{order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-shrink-0 pl-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex-shrink-0 pl-2">
                <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold">{itemDate}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 dark:text-neutral-700 ml-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrders;
