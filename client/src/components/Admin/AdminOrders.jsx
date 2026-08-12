import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Package, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await api.orders.getAll();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.orders.updateStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const statusConfig = {
        pending: { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock, dot: 'bg-amber-500' },
        shipped: { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Truck, dot: 'bg-blue-500' },
        delivered: { color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
        cancelled: { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, dot: 'bg-red-500' },
    };

    const getStatusConfig = (status) => statusConfig[status] || statusConfig.pending;

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading orders...</p>
        </div>
    );

    // Stats
    const stats = [
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-400' },
        { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400' },
        { label: 'Shipped Orders', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400' },
        { label: 'Delivered Orders', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manage and track customer orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard 
                        key={stat.label}
                        title={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const config = getStatusConfig(order.status);
                        const StatusIcon = config.icon;
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div
                                key={order.id}
                                className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-primary/20 shadow-md' : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {/* Order Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Package size={18} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                                                Order #{order.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-xs text-gray-400 truncate">
                                                {order.user_email || 'Guest'} • {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-sm font-bold text-gray-800">₹{order.total_amount}</span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border capitalize ${config.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                            {order.status}
                                        </span>
                                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</h4>
                                                <div className="space-y-2">
                                                    {order.order_items?.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-100">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center text-[10px] font-bold text-primary">
                                                                    {item.quantity}x
                                                                </span>
                                                                <span className="text-sm text-gray-700">{item.product_name}</span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping & Status */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                                                    <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                                                        {typeof order.shipping_address === 'string'
                                                            ? order.shipping_address
                                                            : JSON.stringify(order.shipping_address, null, 2)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(statusConfig).map(([status, cfg]) => {
                                                            const Icon = cfg.icon;
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateStatus(order.id, status);
                                                                    }}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${order.status === status
                                                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                                                                            : 'bg-white dark:bg-zinc-950 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:border-gray-350 dark:hover:border-neutral-700 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <Icon size={12} />
                                                                    {status}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-zinc-955 p-6 rounded-3xl border border-gray-100 dark:border-neutral-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-305 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${color} shadow-sm`}>
        <Icon size={22} className="stroke-[2]" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

export default AdminOrders;
