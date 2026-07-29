import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle, Clock, Package, Download, ChevronRight, MessageSquare, Phone } from 'lucide-react';
import api from '../lib/api';

const OrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 font-medium">Order not found</p>
        <button onClick={() => navigate('/orders')} className="mt-4 text-primary hover:underline">Back to Orders</button>
    </div>
  );

  // Status Step Logic
  const steps = ['placed', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
  
  // Helper for status date - In a real app, you'd store timestamps for each status change
  const getStatusDate = (status) => {
      if (status === 'placed') return new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      // For shipped/delivered, we might not have the date if not stored separately
      return order.status === status || steps.indexOf(order.status) > steps.indexOf(status) ? 'Completed' : ''; 
  };

  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Breadcrumb / Back -- REMOVED as we now have global breadcrumbs */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Product & Tracker */}
            <div className="lg:col-span-2 space-y-4">
                
                {/* Order Items & Status */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        {order.order_items.map((item, idx) => (
                             <div key={idx} className="flex gap-4 mb-6 last:mb-0">
                                <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 shrink-0 border border-gray-100">
                                    {item.product_image ? (
                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <Package className="w-full h-full text-gray-300 p-2" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug">{item.product_name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Seller: Fuel Supplements</p>
                                    <div className="mt-2 font-bold text-gray-900">₹{item.price}</div>
                                </div>
                             </div>
                        ))}
                    </div>

                    {/* Status Tracker */}
                    <div className="p-6 bg-gray-50/30">
                        <div className="relative">
                            {/* Line */}
                            <div className="absolute top-2.5 left-2.5 bottom-2.5 w-0.5 bg-gray-200" style={{ height: 'calc(100% - 20px)' }}></div>
                            
                            {/* Steps */}
                            <div className="space-y-8 relative">
                                <div className="flex gap-4 items-start">
                                    <div className="relative z-10 w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-sm shrink-0 mt-0.5 flex items-center justify-center">
                                       <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Order Confirmed</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                {/* Dynamic Steps based on status */}
                                {['shipped', 'delivered'].map((step, i) => {
                                    const active = currentStepIndex > i; // i=0 is shipped (steps[1]), i=1 is delivered (steps[2])
                                    const current = order.status === step;
                                    const isDone = active || current;
                                    
                                    // Mapping generic steps to UI
                                    const label = step === 'shipped' ? 'Shipped' : 'Delivered';
                                    
                                    return (
                                        <div key={step} className="flex gap-4 items-start">
                                            <div className={`relative z-10 w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0 mt-0.5 flex items-center justify-center ${isDone ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                 {isDone && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                                                {isDone && <p className="text-xs text-gray-500 mt-0.5">Your item has been {step}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100">
                             <button className="text-primary text-sm font-semibold hover:underline">See All Updates</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                     <span className="text-sm font-medium text-gray-600">Need help?</span>
                     <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <MessageSquare size={16} />
                        Chat with us
                     </div>
                </div>

            </div>

            {/* Right Column - Details */}
            <div className="space-y-4">
                
                {/* Delivery Details */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-serif text-base font-bold text-gray-800 border-b border-gray-100 pb-3 mb-3">Delivery details</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                <MapPin size={14} className="text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-900 mb-1">Shipping Address</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{order.shipping_address || 'No address provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                <Phone size={14} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900 mb-1">Phone number</p>
                                <p className="text-xs text-gray-500">{order.user_email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price Details */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-serif text-base font-bold text-gray-800 border-b border-gray-100 pb-3 mb-3">Price details</h3>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>List Price</span>
                            <span className="line-through text-gray-400">₹{Math.round(order.total_amount * 1.2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Selling Price</span>
                            <span>₹{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{Math.round(order.total_amount * 0.2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="text-green-600">Free</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="font-bold text-lg text-gray-900">₹{order.total_amount}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                         <div className="flex items-center justify-between text-xs font-medium bg-gray-50 p-2 rounded-lg">
                            <span className="text-gray-500">Payment method</span>
                            <span className="uppercase text-gray-900">COD</span>
                         </div>
                    </div>
                </div>

                {/* Invoice */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                     <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        Download Invoice
                     </button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default OrderView;