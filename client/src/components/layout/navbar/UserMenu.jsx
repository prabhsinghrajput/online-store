import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";

const UserMenu = ({ user, profileImage, onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hidden lg:block relative user-menu">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl p-1 pr-2 transition-colors"
      >
        <img
          src={profileImage || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
          alt="Profile"
          className="w-8 h-8 rounded-xl object-cover border border-gray-200 dark:border-slate-700"
        />
        <ChevronDown size={12} className={`text-gray-400 hidden md:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-1 border border-gray-100 z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div className="px-4 py-3">
            <p className="text-sm font-bold text-gray-800 truncate">{user.user_metadata?.full_name || 'User'}</p>
            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="py-1 border-t border-gray-100">
            <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-3 transition-colors"
            >
              <User size={16} /> Profile
            </button>
          </div>
          <div className="border-t border-gray-100 py-1">
            <button onClick={() => { onLogout(); setIsDropdownOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
