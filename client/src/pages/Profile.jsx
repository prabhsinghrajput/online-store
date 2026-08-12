import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, MapPin, CreditCard, BarChart2, Package, 
  Plus, LayoutGrid, ImageIcon, ShoppingBag, ArrowLeft, Shield 
} from 'lucide-react';
import { signOut, getStoredUser } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

// Import subcomponents
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInformation from '../components/profile/PersonalInformation';
import AddressManager from '../components/profile/AddressManager';

// Import Admin subcomponents
import AnalyticsDashboard from '../components/Admin/AnalyticsDashboard';
import ProductList from '../components/Admin/ProductList';
import ProductForm from '../components/Admin/ProductForm';
import CategoryList from '../components/Admin/CategoryList';
import CategoryForm from '../components/Admin/CategoryForm';
import BannerList from '../components/Admin/BannerList';
import BannerForm from '../components/Admin/BannerForm';
import AdminOrders from '../components/Admin/AdminOrders';

// Import Order subcomponents
import Orders from '../components/order/Orders';
import OrderView from '../components/order/OrderView';
import Wishlist from '../components/profile/Wishlist';
import Settings from '../components/profile/Settings';

const Profile = ({ user: propUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = propUser || getStoredUser();
  const isLoading = false;
  const isAdminUser = (u) => u?.user_metadata?.role === 'admin' || u?.user_metadata?.isAdmin === true;
  const isAdmin = isAdminUser(user);

  // Sync activeTab with URL path
  let activeTab = 'profile';
  if (location.pathname.startsWith('/admin')) {
    activeTab = 'admin';
  } else if (location.pathname.startsWith('/orders')) {
    activeTab = 'orders';
  } else if (location.pathname.startsWith('/wishlist')) {
    activeTab = 'wishlist';
  } else if (location.pathname.startsWith('/settings')) {
    activeTab = 'settings';
  } else if (location.pathname === '/profile/addresses') {
    activeTab = 'addresses';
  } else if (location.pathname === '/profile/payments') {
    activeTab = 'payments';
  }

  // Sync adminSubTab with URL path
  let adminSubTab = 'dashboard';
  if (location.pathname === '/admin/products') {
    adminSubTab = 'products';
  } else if (location.pathname === '/admin/products/new' || (location.pathname.startsWith('/admin/products/') && location.pathname.endsWith('/edit'))) {
    adminSubTab = 'new-product';
  } else if (location.pathname === '/admin/categories') {
    adminSubTab = 'categories';
  } else if (location.pathname === '/admin/categories/new' || (location.pathname.startsWith('/admin/categories/') && location.pathname.endsWith('/edit'))) {
    adminSubTab = 'new-category';
  } else if (location.pathname === '/admin/banners') {
    adminSubTab = 'banners';
  } else if (location.pathname === '/admin/banners/new' || (location.pathname.startsWith('/admin/banners/') && location.pathname.endsWith('/edit'))) {
    adminSubTab = 'new-banner';
  } else if (location.pathname === '/admin/orders') {
    adminSubTab = 'orders';
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'profile') navigate('/profile');
    else if (tabId === 'admin') navigate('/admin');
    else if (tabId === 'orders') navigate('/orders');
    else if (tabId === 'wishlist') navigate('/wishlist');
    else if (tabId === 'settings') navigate('/settings');
    else if (tabId === 'addresses') navigate('/profile/addresses');
    else if (tabId === 'payments') navigate('/profile/payments');
  };

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form States
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    photoURL: ''
  });

  // Load profile data from localStorage or auth profile
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`profile_${user.id}`);
      if (savedData) {
        setFormData(JSON.parse(savedData));
      } else {
        setFormData({
          displayName: user.user_metadata?.displayName || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || '',
          photoURL: user.user_metadata?.avatar_url || ''
        });
      }
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedData = { ...formData, photoURL: base64String };
        setFormData(updatedData);
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedData));
        window.dispatchEvent(new Event('profile:updated'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem(`profile_${user?.id}`);
      localStorage.removeItem('userAddresses');
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(formData));
    window.dispatchEvent(new Event('profile:updated'));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-3 border-gray-250 dark:border-neutral-800 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Check if viewing detailed order route (e.g. /orders/:id)
  const isSingleOrderView = location.pathname.startsWith('/orders/') && location.pathname !== '/orders';

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 flex flex-col lg:flex-row">
      
      {/* Left Sidebar Column (Unified Panel) */}
      <ProfileSidebar 
        isAdmin={isAdmin} 
        handleLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />

      {/* Right Main Content Column */}
      <div className="flex-1 pt-8 pb-12 px-6 md:px-12 space-y-6 lg:ml-[250px]">
        
        {activeTab === 'profile' && (
          <>
            {/* User Info Header Card */}
            <ProfileHeader 
              formData={formData} 
              user={user} 
              isAdmin={isAdmin} 
              uploading={uploading} 
              handleImageUpload={handleImageUpload} 
            />

            {/* Success Toast */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-900/30 rounded-2xl"
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-955/30 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-800 dark:text-green-400 text-xs font-semibold">Profile updated successfully!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Personal Information Card */}
            <PersonalInformation 
              formData={formData} 
              setFormData={setFormData} 
              isEditing={isEditing} 
              setIsEditing={setIsEditing} 
              handleSubmit={handleSubmit} 
            />
          </>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Horizontal Sub-Navigation */}
            <div className="flex justify-start items-center">
              <nav className="flex flex-wrap items-center gap-1 bg-white dark:bg-zinc-955 border border-gray-200 dark:border-neutral-900 rounded-2xl p-1.5 shadow-sm dark:shadow-none">
                {[
                  { id: 'dashboard', path: '/admin', icon: BarChart2, label: 'Dashboard' },
                  { id: 'products', path: '/admin/products', icon: Package, label: 'Products' },
                  { id: 'new-product', path: '/admin/products/new', icon: Plus, label: 'Add Product' },
                  { id: 'categories', path: '/admin/categories', icon: LayoutGrid, label: 'Categories' },
                  { id: 'banners', path: '/admin/banners', icon: ImageIcon, label: 'Banners' },
                  { id: 'orders', path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-550 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sub-tab content rendering */}
            <div className="bg-transparent">
              {adminSubTab === 'dashboard' && <AnalyticsDashboard />}
              {adminSubTab === 'products' && <ProductList />}
              {adminSubTab === 'new-product' && <ProductForm />}
              {adminSubTab === 'categories' && <CategoryList />}
              {adminSubTab === 'new-category' && <CategoryForm />}
              {adminSubTab === 'banners' && <BannerList />}
              {adminSubTab === 'new-banner' && <BannerForm />}
              {adminSubTab === 'orders' && <AdminOrders />}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {isSingleOrderView ? <OrderView /> : <Orders />}
          </div>
        )}

        {activeTab === 'addresses' && (
          <AddressManager />
        )}

        {activeTab === 'wishlist' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <Wishlist />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <Settings />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-zinc-955 border border-gray-200 dark:border-neutral-900 rounded-3xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CreditCard size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Payment Methods</h3>
              <p className="text-xs text-gray-455 dark:text-neutral-500">Manage your linked credit/debit cards or wallets.</p>
            </div>
            <p className="text-xs font-semibold text-gray-550">No saved payment methods. All payments are securely processed via Stripe at checkout.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
