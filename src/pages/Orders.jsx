import React, { useState, useEffect } from 'react';
import { Package, Search, ShoppingBag, Clock, CheckCircle, Truck, XCircle, Star, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
        
        // 1. Try to get user from Supabase Session
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          currentUserEmail = user.email;
        } else {
          // 2. Fallback to localStorage (for development or legacy auth)
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (localUser.email) {
            currentUserEmail = localUser.email;
          }
        }

        if (!currentUserEmail) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_email', currentUserEmail)
          .order('created_at', { ascending: false });

        if (error) throw error;
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

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered': return { color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle, dot: 'bg-green-500' };
      case 'shipped': return { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Truck, dot: 'bg-blue-500' };
      case 'cancelled': return { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, dot: 'bg-red-500' };
      default: return { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, dot: 'bg-amber-500' };
    }
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Package size={24} className="text-red-400" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">Error Loading Orders</h3>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-gray-400/20">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">{orders.length} orders placed</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const config = getStatusConfig(order.status);
              const StatusIcon = config.icon;

              return (
                <div 
                  key={order.id} 
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group/card"
                >
                  {/* Order Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border capitalize ${config.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-4 pb-3 space-y-3">
                    {order.order_items?.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-4 p-2 -mx-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                      >
                        {item.product_image && (
                          <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-2 flex-shrink-0">
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start gap-2">
                             <div>
                                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                                    {item.product_name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Qty: {item.quantity} {item.weight && `• ${item.weight}`}
                                </p>
                             </div>
                             <span className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Delivery</p>
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{order.shipping_address || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
                      <p className="text-sm font-bold text-gray-800">₹{order.total_amount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <ShoppingBag size={24} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">No Orders Yet</h3>
            <p className="text-sm text-gray-400">Start shopping to see your orders here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;