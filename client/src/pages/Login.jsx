import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Properly validate session with Supabase instead of checking localStorage
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Store current path for redirect after auth
      sessionStorage.setItem('redirectPath', window.location.hash.replace('#', '') || '/');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      // Note: Redirect is handled by Supabase, so we don't need to navigate explicitly here
      // unless we want to handle failures before redirect.
    } catch (error) {
      console.error("Supabase Sign-In Error:", error);
      setError(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary/5 px-4">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center">
              <img src="/logo.png" alt="Fuel Supplements" className="w-14 h-14 object-contain" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-400">Sign in to continue with Fuel Supplements</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-2">{error}</span>
            </motion.div>
          )}

          {/* Google Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 text-sm font-semibold hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            ) : (
              <FcGoogle size={22} />
            )}
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </motion.button>

          {/* Features */}
          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> Secure</span>
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-amber-500" /> Fast</span>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
