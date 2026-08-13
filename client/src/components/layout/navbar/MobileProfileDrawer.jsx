import { Link } from "react-router-dom";
import { X, User, Shield, Package, MapPin, Heart, CreditCard, Settings, LogOut } from "lucide-react";

const PROFILE_LINKS = [
  { to: "/orders", label: "My Orders", icon: Package },
  { to: "/profile/addresses", label: "My Addresses", icon: MapPin },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/profile/payments", label: "Payment Methods", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MobileProfileDrawer = ({ user, isOpen, onClose, onLogout }) => {
  return (
    <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className={`relative w-4/5 max-w-sm bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col z-10 border-r border-gray-100 dark:border-neutral-900 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-900">
          <span className="text-sm font-black tracking-widest text-gray-400 uppercase">My Account</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-2">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded-2xl transition-colors"
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          {(user?.user_metadata?.role === 'admin' || user?.user_metadata?.isAdmin === true) && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded-2xl transition-colors"
            >
              <Shield size={18} />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {PROFILE_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded-2xl transition-colors"
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileDrawer;
