import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, register, getSession } from '../lib/auth';
import { Sparkles, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Properly validate session before showing the login form
    const checkSession = async () => {
      const { data: { session } } = await getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Show any error passed back from a redirect
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      const sanitized = errorParam.replace(/[<>"'&]/g, '').slice(0, 200);
      setError(sanitized);
      params.delete('error');
      const newSearch = params.toString();
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      if (mode === 'signup') {
        await register(email, password);
        navigate("/");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setError("");
    setMessage("");
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-neutral-950 dark:via-black dark:to-neutral-900 px-4 transition-colors duration-300">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-sm animate-[fadeUp_0.5s_ease-out]">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none p-8 border border-gray-100 dark:border-neutral-900">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-[scaleIn_0.4s_ease-out_0.1s_backwards]">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl flex items-center justify-center">
              <img 
                src={theme === 'dark' 
                  ? 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786183228/ChatGPT_Image_Aug_8_2026_03_30_05_PM_a98rks.png' 
                  : 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786181989/cross_logo_xlumhw.webp'} 
                alt="Cross" 
                className="w-14 h-14 object-contain" 
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {mode === 'signin' ? 'Sign in to continue with Cross' : 'Sign up to start shopping with Cross'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-3 rounded-xl animate-[fadeIn_0.2s_ease-out]">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-2">{error}</span>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="mb-5 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 px-4 py-3 rounded-xl animate-[fadeIn_0.2s_ease-out]">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-3">{message}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 dark:focus:ring-white/20 dark:focus:border-white/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 12 characters' : 'Your password'}
                  required
                  minLength={mode === 'signup' ? 12 : 1}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-2xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 dark:focus:ring-white/20 dark:focus:border-white/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-neutral-100 rounded-2xl text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 shadow-lg shadow-black/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {isLoading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Mode toggle */}
          <button
            onClick={toggleMode}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {mode === 'signin'
              ? <>Don't have an account? <span className="text-primary font-semibold">Sign Up</span></>
              : <>Already have an account? <span className="text-primary font-semibold">Sign In</span></>}
          </button>


          {/* Terms */}
          <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
