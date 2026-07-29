import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/layout/Navbar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import Products from './pages/Product';
import ProductDetails from './pages/ProductDetails';
import Cart from './components/layout/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Login from './pages/Login'; // Import Login Component
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderView from './pages/OrderView';
import Settings from './pages/Settings';
import Wishlist from './pages/Wishlist';
import AuthCallback from './pages/AuthCallback';

import AdminLayout from './components/Admin/AdminLayout';
import ProductList from './components/Admin/ProductList';
import ProductForm from './components/Admin/ProductForm';
import AdminOrders from './components/Admin/AdminOrders';
import CategoryList from './components/Admin/CategoryList';
import CategoryForm from './components/Admin/CategoryForm';
import BannerList from './components/Admin/BannerList';
import BannerForm from './components/Admin/BannerForm';
import AnalyticsDashboard from './components/Admin/AnalyticsDashboard';

const AdminGuard = ({ children, user }) => {
  // Check admin status from user metadata (set by server during auth)
  // This is a client-side check; server-side enforcement via RLS is critical
  const isAdmin = user?.user_metadata?.role === 'admin' ||
                  user?.user_metadata?.isAdmin === true;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const Layout = ({ children, user }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return children;

  return (
    <>
      <Navbar user={user} />
      <Breadcrumbs />
      <Cart user={user} />
      {children}
      <Footer />
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Auth initialization error:', error.message);
          // If there's an error with the session, clear it
          await supabase.auth.signOut();
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'TOKEN_REFRESHED') {
        // Token was successfully refreshed
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
      } else if (event === 'INITIAL_SESSION') {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col">
          <Layout user={user}>
            <main className="flex-grow">
              <Routes>
                {/* Auth Callback Route (must be public) */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Public Routes */}
                <Route path="/" element={<Categories />} />
                <Route path="/category/:id" element={<CategoryProducts />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

                {/* Private Routes */}
                <Route path="/order-confirmation" element={user ? <OrderConfirmation /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
                <Route path="/orders/:id" element={user ? <OrderView /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminGuard user={user}><AdminLayout /></AdminGuard>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AnalyticsDashboard />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  
                  <Route path="categories" element={<CategoryList />} />
                  <Route path="categories/new" element={<CategoryForm />} />
                  <Route path="categories/:id/edit" element={<CategoryForm />} />
                  
                  <Route path="banners" element={<BannerList />} />
                  <Route path="banners/new" element={<BannerForm />} />
                  <Route path="banners/:id/edit" element={<BannerForm />} />

                  <Route path="orders" element={<AdminOrders />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </Layout>
        </div>
      </Router>
    </CartProvider>
  </WishlistProvider>
  );
};

export default App;
