import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, ArrowRight, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function Footer() {
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';
  const isProfileOrAdmin = location.pathname.startsWith('/profile') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/orders') || location.pathname.startsWith('/wishlist') || location.pathname.startsWith('/settings');

  return (
    <footer className={`bg-[#f6f6f6] dark:bg-black border-t border-gray-200 dark:border-neutral-900 text-gray-500 dark:text-neutral-500 font-sans w-full mt-0 transition-colors duration-300 ${isProfileOrAdmin ? 'lg:pl-[250px]' : ''}`}>

      {/* Main Footer Links Block */}
      <div className="w-full px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 items-start">
          {/* Logo & Socials Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <img 
                src={isDark ? "https://res.cloudinary.com/dwfalgx6c/image/upload/v1786183228/ChatGPT_Image_Aug_8_2026_03_30_05_PM_a98rks.png" : "https://res.cloudinary.com/dwfalgx6c/image/upload/v1786181989/cross_logo_xlumhw.webp"} 
                alt="Cross Logo" 
                className="h-10 w-auto object-contain brightness-95 -mt-4" 
              />
              <p className="text-[9px] font-black tracking-[0.2em] text-gray-500 dark:text-neutral-500 uppercase pl-1">
                Move Different.
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-4 items-center">
              {/* Instagram */}
              <a href="#" className="text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.47-.94-.76-1.62-1.83-2-3.01v8.83c.03 2.13-.88 4.36-2.67 5.56-1.84 1.25-4.39 1.49-6.43.59-2.07-.91-3.6-2.98-3.92-5.22-.38-2.6.76-5.42 2.98-6.79 1.66-1.02 3.73-1.25 5.59-.62v4.19c-1.16-.48-2.54-.34-3.56.45-.98.76-1.39 2.14-1 3.32.37 1.13 1.54 1.95 2.74 1.89 1.43-.07 2.53-1.35 2.45-2.78V.02h.02z" />
                </svg>
              </a>
              {/* X */}
              <a href="#" className="text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="X">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* SHOP Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-gray-900 dark:text-white uppercase">
              Shop
            </h4>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><Link to="/products" className="hover:text-gray-900 dark:hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/men" className="hover:text-gray-900 dark:hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/women" className="hover:text-gray-900 dark:hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/accessories" className="hover:text-gray-900 dark:hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* COLLECTIONS Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-gray-900 dark:text-white uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><Link to="/new-arrivals" className="hover:text-gray-900 dark:hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/men" className="hover:text-gray-900 dark:hover:text-white transition-colors">Hoodies & Tops</Link></li>
              <li><Link to="/women" className="hover:text-gray-900 dark:hover:text-white transition-colors">Bottoms & Crops</Link></li>
              <li><Link to="/accessories" className="hover:text-gray-900 dark:hover:text-white transition-colors">Caps & Bags</Link></li>
            </ul>
          </div>

          {/* COMPANY Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-gray-900 dark:text-white uppercase">
              Company
            </h4>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><Link to="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/lookbook" className="hover:text-gray-900 dark:hover:text-white transition-colors">Lookbook</Link></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* HELP Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-gray-900 dark:text-white uppercase">
              Help
            </h4>
            <ul className="space-y-2 text-[11px] font-semibold">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Custom Globe Banner Box on Right */}
          <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[220px] text-center select-none bg-transparent pt-0 px-4 pb-6">
            <Globe className="w-10 h-10 text-gray-400 dark:text-neutral-500 animate-[spin_40s_linear_infinite] stroke-[1.25]" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-black tracking-[0.25em] text-gray-900 dark:text-white uppercase">
                Be Different
              </p>
              <p className="text-[10px] font-black tracking-[0.25em] text-gray-500 dark:text-neutral-500 uppercase">
                Be Cross
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright line */}
      <div className="w-full px-6 md:px-12 py-6 border-t border-gray-200 dark:border-neutral-900 bg-[#f0f0f0] dark:bg-[#050505] transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-gray-400 dark:text-neutral-500">
          <p>© {new Date().getFullYear()} CROSS. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
