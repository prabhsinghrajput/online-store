import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, User, Mail, Phone, MapPin, Edit3, Save, X,
  Shield, Package, ShoppingBag, ChevronRight, Sparkles
} from "lucide-react";

const ADMIN_EMAILS = ['lprabh096@gmail.com'];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    photoURL: ''
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const storedProfile = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
        setFormData({
          displayName: storedProfile.displayName || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: storedProfile.phone || '',
          address: storedProfile.address || '',
          photoURL: user.user_metadata?.avatar_url || ''
        });
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(formData));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isAdmin = user && user.email ? ADMIN_EMAILS.includes(user.email) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/80 p-6 shadow-sm"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full translate-y-24 -translate-x-24" />

          <div className="relative flex items-center gap-5">
            <div className="relative">
              <img
                src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.displayName}&background=6366f1&color=fff&size=128`}
                alt="Profile"
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-primary/10 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{formData.displayName || 'User'}</h1>
              <p className="text-gray-500 text-sm truncate mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Active
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
                    <Shield size={10} />
                    Admin
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Mobile logout */}
          <button
            onClick={handleLogout}
            className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl text-sm transition-all duration-300"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>

        {/* Success Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-green-600" />
              </div>
              <p className="text-green-700 text-sm font-medium">Profile updated successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Panel Card */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Admin Dashboard</h3>
                <p className="text-xs text-gray-500">Manage products & orders</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-3 p-3 bg-white hover:bg-amber-50 border border-amber-200/50 rounded-xl transition-all duration-300 hover:shadow-md group"
              >
                <Package size={18} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Products</span>
                <ChevronRight size={14} className="ml-auto text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-3 p-3 bg-white hover:bg-amber-50 border border-amber-200/50 rounded-xl transition-all duration-300 hover:shadow-md group"
              >
                <ShoppingBag size={18} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Orders</span>
                <ChevronRight size={14} className="ml-auto text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Profile Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: isAdmin ? 0.2 : 0.1 }}
          className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage your account details</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:bg-gray-50/80 disabled:text-gray-500 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/80 text-gray-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-200 rounded text-[10px] font-medium text-gray-500 uppercase">
                    Verified
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:bg-gray-50/80 disabled:text-gray-500 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:bg-gray-50/80 disabled:text-gray-500 transition-all resize-none"
                  rows="3"
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>

            {/* Save Button */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-end pt-2"
                >
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-gray-400/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: isAdmin ? 0.3 : 0.2 }}
          className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden"
        >
          <div className="p-5 pb-2">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="px-3 pb-3">
            {[
              { icon: ShoppingBag, label: 'My Orders', desc: 'View order history', path: '/orders', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: MapPin, label: 'Saved Addresses', desc: 'Manage delivery addresses', path: '/profile', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
