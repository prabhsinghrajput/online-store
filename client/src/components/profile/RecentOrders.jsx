import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const RecentOrders = () => {
  const navigate = useNavigate();

  const recentOrders = [
    { name: 'Signature Hoodie', orderId: '#CR5B952', price: '₹2,599', items: '1 Item', status: 'Delivered', statusBg: 'bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400', date: '08 Aug 2026', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=80&q=80' },
    { name: 'Classic Cap', orderId: '#CR5B9d1', price: '₹799', items: '1 Item', status: 'Shipped', statusBg: 'bg-blue-50 dark:bg-blue-950/25 text-blue-700 dark:text-blue-400', date: '05 Aug 2026', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=80&q=80' },
    { name: 'Utility Cargo', orderId: '#CR5B930', price: '₹2,699', items: '1 Item', status: 'Processing', statusBg: 'bg-orange-50 dark:bg-orange-950/25 text-orange-700 dark:text-orange-400', date: '01 Aug 2026', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=80&q=80' }
  ];

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
        {recentOrders.map((order, idx) => (
          <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-neutral-900/20 transition-colors">
            <img src={order.img} alt={order.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-neutral-900 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{order.name}</h4>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold mt-0.5">Order {order.orderId}</p>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{order.price}</p>
              <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold uppercase">{order.items}</p>
            </div>
            <div className="flex-shrink-0 pl-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${order.statusBg}`}>
                {order.status}
              </span>
            </div>
            <div className="flex-shrink-0 pl-2">
              <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold">{order.date}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 dark:text-neutral-700 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
