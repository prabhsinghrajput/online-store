import React from 'react';
import { Camera } from 'lucide-react';

const ProfileHeader = ({ formData, user, uploading, handleImageUpload }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 shadow-sm dark:shadow-none flex flex-col sm:flex-row items-center gap-6">
      <div className="relative group select-none">
        <img
          src={formData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'User')}&background=000&color=fff&size=128`}
          alt="Profile"
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-gray-50 dark:ring-neutral-900 shadow-md"
        />
        <label className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Camera size={18} className="text-white" />
              <span className="text-[9px] text-white font-semibold mt-1">Edit</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
          {formData.displayName || 'User'}
        </h1>
        <p className="text-gray-500 dark:text-neutral-500 text-sm truncate">
          {user?.email}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
