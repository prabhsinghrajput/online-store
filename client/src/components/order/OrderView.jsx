import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Package, 
  Download, 
  MessageSquare, 
  Phone, 
  Star, 
  ChevronRight, 
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  CreditCard,
  X
} from 'lucide-react';
import api from '../../lib/api';

const OrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // Dynamic rating storage by product_id
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.orders.getById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-10 h-10 border-3 border-neutral-200 dark:border-zinc-800 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 dark:text-zinc-555 font-bold uppercase tracking-wider mt-4">Loading order details...</p>
    </div>
  );

  if (!order) return (
    <div className="text-center py-16 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-neutral-200/60 dark:border-zinc-800/40 p-8 shadow-sm">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-150 dark:border-zinc-800">
        <Package size={24} className="text-neutral-400" />
      </div>
      <p className="text-sm font-bold text-neutral-500 mb-6">Order not found</p>
      <button 
        onClick={() => navigate('/orders')} 
        className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all shadow-md"
      >
        Back to Orders
      </button>
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'shipped': return Truck;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const handleStarClick = (productId, starIdx) => {
    setRatings(prev => ({
      ...prev,
      [productId]: starIdx
    }));
  };

  return (
    <div className="w-full space-y-6 animate-[fadeIn_0.25s_ease-out]">
      {/* Header with Back button */}
      <div className="flex justify-start pb-4 border-b border-neutral-100 dark:border-zinc-800/50">
        <button 
          onClick={() => navigate('/orders')} 
          className="flex items-center gap-2 text-xs font-extrabold text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition-all hover:-translate-x-0.5 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>BACK TO ORDERS</span>
        </button>
      </div>

      {/* Main Flipkart-Style Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Product Info & Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {order.items?.map((item, idx) => {
            const currentRating = ratings[item.product_id] || 0;
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short' 
            });

            return (
              <div key={idx} className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-neutral-200/60 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-xl shadow-neutral-100/30 dark:shadow-none divide-y divide-neutral-100 dark:divide-zinc-800/40 mb-6">
                
                {/* Section 1: Product info */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/products/${item.product_id}`)}>
                      {item.product_name}
                    </h4>
                    <p className="text-[10px] text-neutral-450 dark:text-zinc-500 font-medium">Seller: CROSS</p>
                    <div className="font-black text-sm text-neutral-900 dark:text-white pt-1">₹{item.price * item.quantity}</div>
                  </div>
                  <div className="w-18 h-18 bg-white dark:bg-zinc-850 rounded-2xl p-2 border border-neutral-150 dark:border-zinc-800 shrink-0 flex items-center justify-center">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Package className="w-full h-full text-neutral-300 p-2" />
                    )}
                  </div>
                </div>

                {/* Section 2: Vertical timeline */}
                <div className="p-6">
                  {/* Vertical Timeline */}
                  <div className="relative pl-6 space-y-4">
                    {/* Line */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-zinc-800"></div>

                    {/* Step 1: Placed */}
                    <div className="relative flex items-center gap-3">
                      <div className="absolute left-[-21px] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-zinc-200">Order Confirmed, {formattedDate}</span>
                    </div>

                    {/* Step 2: Shipped (if status is shipped or delivered) */}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <div className="relative flex items-center gap-3">
                        <div className="absolute left-[-21px] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-zinc-200">Shipped, {formattedDate}</span>
                      </div>
                    )}

                    {/* Step 3: Delivered (if status is delivered) */}
                    {order.status === 'delivered' && (
                      <div className="relative flex items-center gap-3">
                        <div className="absolute left-[-21px] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-zinc-200">Delivered, {formattedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* See all updates link */}
                  <div 
                    onClick={() => setShowUpdatesModal(true)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-85 cursor-pointer"
                  >
                    <span>See All Updates</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                {/* Section 3: Star Rating */}
                <div className="p-6 flex items-center justify-between">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-widest">Rate the product</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => handleStarClick(item.product_id, star)}
                        className="transition-all hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star 
                          size={18} 
                          className={`stroke-[2px] transition-colors ${
                            star <= currentRating 
                              ? 'fill-amber-400 stroke-amber-400' 
                              : 'stroke-neutral-300 dark:stroke-zinc-700 hover:stroke-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Chat with us */}
                <div className="py-4 flex justify-center items-center gap-2 border-t border-neutral-100 dark:border-zinc-800/40 hover:bg-neutral-50/30 dark:hover:bg-zinc-900/10 cursor-pointer transition-colors group/chat">
                  <MessageSquare size={16} className="text-neutral-500 dark:text-zinc-400" />
                  <span className="text-xs font-extrabold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider group-hover/chat:text-primary transition-colors">Chat with us</span>
                </div>

              </div>
            );
          })}

        </div>

        {/* Right Column: Address Details & Price breakdown */}
        <div className="space-y-6">
          
          {/* Delivery Address Card */}
          <div className="bg-white dark:bg-zinc-900/50 border border-neutral-200/60 dark:border-zinc-800/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-widest border-b border-neutral-100 dark:border-zinc-800/40 pb-3.5 mb-5">Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800/40 flex items-center justify-center shrink-0 text-neutral-500 dark:text-zinc-400 border border-neutral-150 dark:border-zinc-750">
                  <MapPin size={13} />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-neutral-900 dark:text-zinc-150">{order.customer_name || 'N/A'}</p>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-semibold mt-1.5">{order.shipping_address || 'No address provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800/40 flex items-center justify-center shrink-0 text-neutral-500 dark:text-zinc-400 border border-neutral-150 dark:border-zinc-750">
                  <Phone size={13} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-450 dark:text-zinc-500 uppercase tracking-widest">Phone Number</p>
                  <p className="text-xs text-neutral-800 dark:text-zinc-300 font-extrabold mt-0.5">{order.customer_phone || order.user_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white dark:bg-zinc-900/50 border border-neutral-200/60 dark:border-zinc-800/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-widest border-b border-neutral-100 dark:border-zinc-800/40 pb-3.5 mb-5">Price Details</h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-neutral-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>List Price</span>
                <span className="line-through text-neutral-400 dark:text-zinc-650">₹{Math.round(order.total_amount * 1.2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Selling Price</span>
                <span className="text-neutral-900 dark:text-zinc-150 font-extrabold">₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-extrabold">-₹{Math.round(order.total_amount * 0.2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase">Free</span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-200 dark:border-zinc-800/60 mt-4.5 pt-4.5 flex justify-between items-center">
              <span className="text-xs font-black text-neutral-900 dark:text-zinc-100 uppercase tracking-widest">Total Amount</span>
              <span className="font-black text-xl text-neutral-900 dark:text-white">₹{order.total_amount}</span>
            </div>

            {/* Payment Method Badge */}
            <div className="mt-5 pt-4.5 border-t border-neutral-100 dark:border-zinc-800/40">
              <div className="flex items-center justify-between text-[9px] font-black bg-neutral-50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-neutral-150 dark:border-zinc-800/60">
                <span className="text-neutral-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard size={12} />
                  Payment Method
                </span>
                <span className="uppercase text-neutral-800 dark:text-zinc-200 tracking-widest px-2.5 py-0.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg font-extrabold">
                  UPI / COD
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Download Action Card */}
          <div className="bg-white dark:bg-zinc-900/50 border border-neutral-200/60 dark:border-zinc-800/30 rounded-3xl p-4 shadow-sm">
            <button className="w-full flex items-center justify-center gap-2 py-3.5 border border-neutral-900 dark:border-zinc-700 bg-transparent text-neutral-900 dark:text-zinc-200 hover:bg-neutral-50 dark:hover:bg-zinc-800/30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]">
              <Download size={14} />
              Download Invoice
            </button>
          </div>

        </div>

      </div>
      {/* Updates Modal Overlay */}
      {showUpdatesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-neutral-200/50 dark:border-zinc-800/60 animate-[scaleUp_0.18s_ease-out]">
            
            {/* Close button positioned to the right of the card overlay just like Flipkart reference */}
            <button 
              onClick={() => setShowUpdatesModal(false)} 
              className="absolute top-4 right-[-45px] hidden md:block text-white hover:opacity-80 transition-opacity"
              aria-label="Close updates"
            >
              <X size={28} />
            </button>
            <button 
              onClick={() => setShowUpdatesModal(false)} 
              className="absolute top-4 right-4 md:hidden text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Close updates mobile"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-zinc-800 pb-3">
              Order Timeline Logs
            </h3>

            {/* Vertical timeline inside modal */}
            <div className="relative pl-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              {/* Line */}
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-emerald-500/20 dark:bg-zinc-800"></div>

              {/* Step 1: Placed details */}
              <div className="relative space-y-2">
                <div className="absolute left-[-21px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-850 dark:text-zinc-150">Order Confirmed</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-bold">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="pl-2 border-l border-neutral-100 dark:border-zinc-800/80 text-[10px] text-neutral-500 dark:text-zinc-400 font-semibold space-y-1">
                  <p>Your Order has been placed successfully.</p>
                  <p>Seller has processed your order.</p>
                  <p>Your item has been picked up by delivery partner.</p>
                </div>
              </div>

              {/* Step 2: Shipped details */}
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="relative space-y-2">
                  <div className="absolute left-[-21px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-850 dark:text-zinc-150">Shipped</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} - Shipped out
                    </p>
                  </div>
                  <div className="pl-2 border-l border-neutral-100 dark:border-zinc-800/80 text-[10px] text-neutral-500 dark:text-zinc-400 font-semibold space-y-1">
                    <p>Ekart Logistics - FMPP4140111842</p>
                    <p>Your item has been shipped from warehouse hub.</p>
                    <p>Your item has been received in the hub nearest to you.</p>
                  </div>
                </div>
              )}

              {/* Step 3: Out for delivery details */}
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="relative space-y-2">
                  <div className="absolute left-[-21px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-850 dark:text-zinc-150">Out For Delivery</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} - In Transit
                    </p>
                  </div>
                  <div className="pl-2 border-l border-neutral-100 dark:border-zinc-800/80 text-[10px] text-neutral-500 dark:text-zinc-400 font-semibold">
                    <p>Your item is out for delivery with executive.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Delivered details */}
              {order.status === 'delivered' && (
                <div className="relative space-y-2">
                  <div className="absolute left-[-21px] top-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-850 dark:text-zinc-150">Delivered</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-zinc-500 font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} - Complete
                    </p>
                  </div>
                  <div className="pl-2 border-l border-neutral-100 dark:border-zinc-800/80 text-[10px] text-neutral-500 dark:text-zinc-400 font-semibold">
                    <p>Your item has been delivered successfully.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderView;
