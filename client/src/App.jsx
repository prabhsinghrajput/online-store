import React, { useEffect, useState, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './lib/auth';
import Navbar from './components/layout/Navbar';
import ProductDetails from './components/product/ProductDetails';
import CartPage from './pages/CartPage';
import OrderConfirmation from './components/order/OrderConfirmation';
import Footer from './components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Hero from './pages/Hero';
import CategoryProducts from './pages/CategoryProducts';
import Login from './pages/Login'; // Import Login Component
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-6 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminGuard = ({ children, user }) => {
  // SECURITY NOTE: This client-side guard is strictly for UX/UI presentation purposes.
  // Client-side state can be manipulated. ALL sensitive admin data and operations 
  // MUST independently enforce authentication and role checks on the server-side 
  // (using the `requireAdmin` middleware).
  const isAdmin = user?.user_metadata?.role === 'admin' ||
                  user?.user_metadata?.isAdmin === true;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const Layout = ({ children, user }) => {
  return (
    <>
      <Navbar user={user} />
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

    const loadSession = () => {
      getSession()
        .then(({ data: { session } }) => {
          if (isMounted) {
            setUser(session?.user || null);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Auth initialization failed:', err);
          if (isMounted) {
            setLoading(false);
          }
        });
    };

    // Restore the session on mount. This is the single source of truth
    // for the initial user state.
    loadSession();

    // Re-read the session whenever auth state changes (login/logout)
    const handleAuthChange = () => loadSession();
    window.addEventListener('auth:changed', handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:changed', handleAuthChange);
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
            <main className="flex-grow pb-16 md:pb-0">
              <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/cart" element={<CartPage user={user} />} />
                <Route path="/" element={<Hero />} />
                <Route path="/products" element={<CategoryProducts />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

                {/* Private Routes */}
                <Route path="/order-confirmation" element={user ? <OrderConfirmation /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/profile/addresses" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/profile/payments" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/orders" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/orders/:id" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />

                {/* Admin Routes unified under Profile frame */}
                <Route path="/admin" element={<AdminGuard user={user}><Profile user={user} /></AdminGuard>} />
                <Route path="/admin/*" element={<AdminGuard user={user}><Profile user={user} /></AdminGuard>} />

                {/* Root level category route */}
                <Route path="/:id" element={<CategoryProducts />} />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </ErrorBoundary>
            </main>
          </Layout>
        </div>
      </Router>
    </CartProvider>
  </WishlistProvider>
  );
};

export default App;
