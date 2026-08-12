import React from 'react';
import OrderView from '../components/order/OrderView';

const OrderDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100/50 to-neutral-50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 text-neutral-800 dark:text-zinc-100 py-12 px-4 md:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <OrderView />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
