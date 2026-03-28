import React from 'react';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Logo" className="h-8 brightness-200" />
              <span className="text-white font-bold text-lg">Fuel Supplements</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your one-stop destination for premium supplements and exceptional wellness.
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {['About Us', 'Contact', 'FAQs', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {['Shipping Info', 'Returns', 'Order Status', 'Payment Options'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: 'EK ONKAR CITY, KHATAR, DIST. NAGPUR' },
                { icon: Phone, text: '9646878282' },
                { icon: Mail, text: 'fuelsupplement@gmail.com' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <item.icon size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Fuel Supplements. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-white/5 rounded">Visa</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Mastercard</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;