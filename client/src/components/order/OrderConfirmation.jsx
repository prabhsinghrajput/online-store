import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, MapPin, Clock, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  if (!state) { navigate('/'); return null; }

  const { orderId, address, items, totalAmount, orderDate } = state;
  const confirmedDate = orderDate ? new Date(orderDate) : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-gray-50/50 dark:from-zinc-950 dark:to-black py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Success */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-zinc-955 rounded-3xl p-8 text-center shadow-xl border border-gray-100 dark:border-neutral-900"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Order Confirmed!</h1>
          <p className="text-sm text-gray-400 dark:text-neutral-500">
            Order #{orderId.slice(-8)} • {confirmedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-955 rounded-2xl border border-gray-100 dark:border-neutral-900 shadow-sm overflow-hidden"
        >
          {/* Address */}
          <div className="p-4 flex items-start gap-3 border-b border-gray-100 dark:border-neutral-900/50">
            <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</p>
              <p className="text-sm text-gray-705 dark:text-neutral-350 mt-1">
                {address.name}<br />
                {address.flatNo}, {address.society}
                {address.landmark && `, ${address.landmark}`}<br />
                {address.area}
              </p>
            </div>
          </div>

          {/* Expected Time */}
          <div className="p-4 flex items-start gap-3 border-b border-gray-100 dark:border-neutral-900/50">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-amber-605" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</p>
              <p className="text-sm font-medium text-gray-700 dark:text-neutral-300 mt-1">
                {new Date(new Date().getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Items ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-900/50 rounded-xl p-2.5">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white dark:bg-zinc-950 rounded-lg p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.weight} • Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-white">₹{(item.discounted_price || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-neutral-800 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>₹{totalAmount - 9}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Platform Fee</span>
                <span>₹9</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-neutral-800 mt-2">
                <span>Total Paid</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/')}
          className="w-full bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black py-3.5 rounded-2xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </motion.button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
