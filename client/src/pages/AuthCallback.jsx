import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Auth Callback Page
 * Handles the OAuth redirect from Supabase
 * This page should be added to your Supabase redirect URLs
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash/params from the OAuth redirect
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          // Show error and redirect to login
          navigate('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          console.log('Successfully authenticated');
          // Redirect to home or a stored redirect path
          const redirectPath = sessionStorage.getItem('redirectPath') || '/';
          sessionStorage.removeItem('redirectPath');
          navigate(redirectPath);
        } else {
          // No session, might be an error in the URL
          navigate('/login');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        navigate('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
