import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Products from './components/Product';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import OrderConfirmation from './components/OrderConfirmation';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Categories from './components/Categories';
import CategoryProducts from './components/CategoryProducts';
import Login from './components/Login'; // Import Login Component
import Profile from './components/Profile';
import Orders from './components/Orders';
import Settings from './components/Settings';
import Wishlist from './components/Wishlist';

import AdminLayout from './components/Admin/AdminLayout';
import ProductList from './components/Admin/ProductList';
import ProductForm from './components/Admin/ProductForm';
import AdminOrders from './components/Admin/AdminOrders';
import CategoryList from './components/Admin/CategoryList';
import CategoryForm from './components/Admin/CategoryForm';
import BannerList from './components/Admin/BannerList';
import BannerForm from './components/Admin/BannerForm';

const AdminGuard = ({ children, user }) => {
  const ADMIN_EMAILS = ['lprabh096@gmail.com'];
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
          <Navbar user={user} />
          <Cart user={user} />
          <main className="flex-grow">
            <Routes>
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
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminGuard user={user}><AdminLayout /></AdminGuard>}>
                <Route index element={<Navigate to="/admin/products" replace />} />
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
          <Footer />
        </div>
      </Router>
    </CartProvider>
  </WishlistProvider>
  );
};

export default App;
