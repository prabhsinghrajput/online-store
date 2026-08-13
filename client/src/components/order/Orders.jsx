import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  ShoppingBag, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Star
} from 'lucide-react';
import { getStoredUser } from '../../lib/auth';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let currentUserEmail = null;
        const currentUser = getStoredUser();
        if (currentUser?.email) {
          currentUserEmail = currentUser.email;
        } else {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (localUser.email) {
            currentUserEmail = localUser.email;
          }
        }

        if (!currentUserEmail) {
          setLoading(false);
          return;
        }

        const data = await api.orders.getAll();
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Flatten orders to individual items
  const flattenedItems = useMemo(() => {
    const items = [];
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          items.push({
            ...item,
            orderId: order.id,
            status: order.status,
            created_at: order.created_at,
            shipping_address: order.shipping_address,
            total_amount: order.total_amount
          });
        });
      }
    });
    return items;
  }, [orders]);

  // Apply Search
  const filteredItems = useMemo(() => {
    return flattenedItems.filter(item => {
      return (
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [flattenedItems, searchQuery]);

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]';
      case 'shipped': return 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]';
      case 'cancelled': return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
      default: return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    }
  };

  if (error) return (
    <div className="w-full text-center py-16 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl p-8">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
        <Package size={24} className="text-red-500" />
      </div>
      <h3 className="font-extrabold text-lg text-gray-800 dark:text-white mb-2">Error Loading Orders</h3>
      <p className="text-sm text-neutral-400 dark:text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all shadow-md"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">My Orders</h1>
        <p className="text-xs font-bold text-neutral-400 dark:text-zinc-500 mt-1">{orders.length} orders placed in total</p>
      </div>

      <div className="w-full space-y-4">
        
        {/* Search Box */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search your orders by product name or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-neutral-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all placeholder-neutral-400 dark:placeholder-zinc-600"
          />
        </div>

        {/* Orders Item List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-neutral-200 dark:border-zinc-800 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-4">Loading orders...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-neutral-200/60 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-xl shadow-neutral-100/30 dark:shadow-none divide-y divide-neutral-100 dark:divide-zinc-800/30">
            {filteredItems.map((item, idx) => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              });

              return (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/orders/${item.orderId}`)}
                  className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-neutral-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300 cursor-pointer relative group"
                >
                  
                  {/* Item Image */}
                  <div className="md:col-span-2 flex justify-start">
                    <div className="w-18 h-18 bg-white dark:bg-zinc-800 rounded-2xl p-2 border border-neutral-200 dark:border-zinc-800 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <ShoppingBag size={18} className="text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="md:col-span-5 space-y-1">
                    <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 pr-4">
                      {item.product_name}
                    </h3>
                    <p className="text-[9px] font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">
                      Order #{item.orderId.slice(0, 8).toUpperCase()} • {formattedDate}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <span className="text-sm font-black text-neutral-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  {/* Status Tracker & Review */}
                  <div className="md:col-span-3 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(item.status)}`} />
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider">
                        {item.status === 'delivered' ? 'Delivered' :
                         item.status === 'shipped' ? 'Shipped' :
                         item.status === 'cancelled' ? 'Cancelled' : 'Ordered'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-semibold">
                      {item.status === 'delivered' ? `Delivered on ${formattedDate}` :
                       item.status === 'cancelled' ? 'Your item was cancelled' : 'Your item is being processed'}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-primary hover:opacity-80 transition-opacity">
                      <Star size={11} className="fill-current" />
                      <span>Rate & Review Product</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/30 rounded-3xl p-10 shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-neutral-200 dark:border-zinc-800">
              <ShoppingBag size={30} className="text-neutral-400 dark:text-zinc-500" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">No matching orders found</h3>
            <p className="text-xs text-neutral-400 dark:text-zinc-500 mb-8 font-semibold">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
