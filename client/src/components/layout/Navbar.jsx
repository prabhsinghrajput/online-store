import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import api from "../../lib/api";
import { signOut } from "../../lib/auth";
import PromoBar from "./navbar/PromoBar";
import DesktopNavLinks from "./navbar/DesktopNavLinks";
import Logo from "./navbar/Logo";
import NavActions from "./navbar/NavActions";
import SearchOverlay from "./navbar/SearchOverlay";
import MobileMenuDrawer from "./navbar/MobileMenuDrawer";
import MobileProfileDrawer from "./navbar/MobileProfileDrawer";
import MobileBottomNav from "./navbar/MobileBottomNav";

const Navbar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname.startsWith('/profile') ||
                        location.pathname.startsWith('/orders') ||
                        location.pathname.startsWith('/wishlist') ||
                        location.pathname.startsWith('/settings') ||
                        location.pathname.startsWith('/admin');

  const [categories, setCategories] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const updateProfileImage = () => {
      if (user) {
        setProfileImage(user.user_metadata?.avatar_url || null);
      } else {
        setProfileImage(null);
      }
    };

    updateProfileImage();
    window.addEventListener('auth:changed', updateProfileImage);

    return () => {
      window.removeEventListener('auth:changed', updateProfileImage);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleMobileMenuClick = () => {
    if (isProfilePage && user) {
      setIsProfileMenuOpen(true);
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-neutral-900/60 transition-colors duration-300">
        <PromoBar />

        {/* Main Navbar */}
        <nav className="relative">
          <div className="w-full px-6 md:px-12">
            <div className="flex items-center justify-between h-16 md:h-20 relative">
              {/* Mobile Menu Icon (Left side on mobile) */}
              <div className="flex lg:hidden items-center">
                <button
                  onClick={handleMobileMenuClick}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  aria-label="Open Menu"
                >
                  <Menu size={20} />
                </button>
              </div>

              {/* Navigation Links on Left (Desktop only) */}
              <DesktopNavLinks categories={categories} />

              {/* Logo in Center */}
              <Logo />

              {/* Actions / Right Side Icons */}
              <NavActions
                user={user}
                profileImage={profileImage}
                onLogout={handleLogout}
                onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
              />
            </div>

            {/* Search Toggle Overlay / Dropdown (Slide out) + Results */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </div>
        </nav>
      </header>

      {/* Mobile Menu Sliding Drawer */}
      <MobileMenuDrawer
        categories={categories}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Profile Sliding Drawer */}
      <MobileProfileDrawer
        user={user}
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        profileImage={profileImage}
        onSearchOpen={() => setIsSearchOpen(true)}
        onProfileMenuOpen={() => setIsProfileMenuOpen(true)}
      />
    </>
  );
};

export default Navbar;
