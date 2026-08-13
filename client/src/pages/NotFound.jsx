import { Link } from 'react-router-dom';
import { Home, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f9f9fa] dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md animate-[fadeIn_0.25s_ease-out]">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3">Error 404</p>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Page not found</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors text-gray-700 dark:text-neutral-200"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
