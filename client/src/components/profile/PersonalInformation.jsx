import React from 'react';
import { Edit3, X, User, Mail, Phone, MapPin, Save } from 'lucide-react';

const PersonalInformation = ({ formData, setFormData, isEditing, setIsEditing, handleSubmit }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-900">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Personal Information</h2>
          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">Manage your account details</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <Edit3 size={12} />
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={12} />
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={16} />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                disabled={!isEditing}
                className="w-full pl-11 pr-4 py-3 bg-transparent border border-gray-200 dark:border-neutral-800 rounded-xl text-xs font-semibold focus:ring-0 focus:border-black dark:focus:border-white focus:outline-none disabled:bg-gray-50/50 dark:disabled:bg-zinc-900/20 disabled:text-gray-500 dark:disabled:text-neutral-500 transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={16} />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-11 pr-20 py-3 border border-gray-200 dark:border-neutral-800 rounded-xl text-xs font-semibold bg-gray-50/50 dark:bg-zinc-900/20 text-gray-500 dark:text-neutral-500 cursor-not-allowed"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-[9px] font-black tracking-wider text-gray-500 dark:text-neutral-400 uppercase">
                Verified
              </span>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={16} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                className="w-full pl-11 pr-4 py-3 bg-transparent border border-gray-200 dark:border-neutral-800 rounded-xl text-xs font-semibold focus:ring-0 focus:border-black dark:focus:border-white focus:outline-none disabled:bg-gray-50/50 dark:disabled:bg-zinc-900/20 disabled:text-gray-500 dark:disabled:text-neutral-500 transition-all"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 text-gray-400 dark:text-neutral-500" size={16} />
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-11 pr-4 py-3 bg-transparent border border-gray-200 dark:border-neutral-800 rounded-xl text-xs font-semibold focus:ring-0 focus:border-black dark:focus:border-white focus:outline-none disabled:bg-gray-50/50 dark:disabled:bg-zinc-900/20 disabled:text-gray-500 dark:disabled:text-neutral-500 transition-all resize-none"
              rows="3"
              placeholder="Enter your delivery address"
            />
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pt-2 animate-[fadeIn_0.2s_ease-out]">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInformation;
