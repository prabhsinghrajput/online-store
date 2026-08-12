import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, CreditCard } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: ShoppingBag, label: 'My Orders', desc: 'View your orders', action: () => navigate('/orders'), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { icon: Heart, label: 'Wishlist', desc: 'Saved items', action: () => navigate('/wishlist'), color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
    { icon: MapPin, label: 'Addresses', desc: 'Manage addresses', action: () => {}, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Manage payments', action: () => {}, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  ];

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-955 border border-gray-150 dark:border-neutral-900 rounded-2xl text-center hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <item.icon size={18} className={item.color} />
            </div>
            <h4 className="text-xs font-bold text-gray-955 dark:text-white mb-0.5">{item.label}</h4>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
