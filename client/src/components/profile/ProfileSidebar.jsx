import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, ShoppingBag, MapPin, Heart, 
  CreditCard, Bell, Settings, LogOut 
} from 'lucide-react';

const ProfileSidebar = ({ isAdmin, handleLogout, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const sidebarLinks = [
    { id: 'profile', icon: User, label: 'Profile', action: () => setActiveTab('profile') },
    ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin Dashboard', action: () => setActiveTab('admin') }] : []),
    { id: 'orders', icon: ShoppingBag, label: 'My Orders', action: () => navigate('/orders') },
    { id: 'addresses', icon: MapPin, label: 'My Addresses', action: () => setActiveTab('addresses') },
    { id: 'wishlist', icon: Heart, label: 'Wishlist', action: () => navigate('/wishlist') },
    { id: 'payments', icon: CreditCard, label: 'Payment Methods', action: () => setActiveTab('payments') },
    { id: 'settings', icon: Settings, label: 'Settings', action: () => navigate('/settings') },
    { id: 'logout', icon: LogOut, label: 'Logout', action: handleLogout, danger: true }
  ];

  return (
    <div className="w-full lg:w-[250px] bg-white dark:bg-zinc-955 border-r border-gray-200 dark:border-neutral-900 p-6 pt-10 md:px-8 md:pb-8 md:pt-14 lg:pt-16 flex-shrink-0 lg:fixed lg:top-20 lg:bottom-0 lg:left-0 overflow-y-auto z-30 flex flex-col justify-between space-y-8 animate-[fadeIn_0.2s_ease-out]">
      <div>
        <h2 className="text-[10px] font-black tracking-[0.25em] text-gray-400 dark:text-neutral-500 uppercase px-3 mb-4">
          My Account
        </h2>
        <nav className="space-y-1">
          {sidebarLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={link.action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wider transition-all duration-200 ${
                activeTab === link.id 
                  ? 'bg-gray-100 dark:bg-neutral-900 text-black dark:text-white' 
                  : 'text-gray-500 dark:text-neutral-450 hover:bg-gray-50 dark:hover:bg-neutral-900/50 hover:text-black dark:hover:text-white'
              }`}
            >
              <link.icon size={16} className={link.danger ? 'text-red-500' : ''} />
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
