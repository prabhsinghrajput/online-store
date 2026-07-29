import { supabase } from './supabase';

/**
 * Auth helper utilities for session management and debugging
 */

/**
 * Clear all auth data and reset session
 */
export const clearAuthData = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear localStorage items (except non-auth items)
    const authKeys = ['token', 'user', 'appSettings'];
    authKeys.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('Auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Get current session with detailed error info
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return { session: null, error: error.message };
    }

    if (!session) {
      console.log('No active session found');
      return { session: null, error: null };
    }

    // Check if token is expired
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt && expiresAt < now) {
      console.warn('Session token has expired');
      return { session: null, error: 'Token expired' };
    }

    console.log('Valid session found for:', session.user?.email);
    return { session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error: error.message };
  }
};

/**
 * Refresh session if possible
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Session refresh failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Session refreshed successfully');
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Debug auth state - useful for troubleshooting
 */
export const debugAuthState = async () => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  // Check session
  const { session, error: sessionError } = await getCurrentSession();
  debugInfo.session = {
    exists: !!session,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    error: sessionError,
  };

  // Check localStorage
  debugInfo.localStorage = {
    hasToken: !!localStorage.getItem('token'),
    hasUser: !!localStorage.getItem('user'),
    keys: Object.keys(localStorage).filter(k =>
      k.includes('user') || k.includes('token') || k.includes('supabase')
    ),
  };

  // Check sessionStorage
  debugInfo.sessionStorage = {
    keys: Object.keys(sessionStorage),
  };

  console.table(debugInfo);
  return debugInfo;
};

/**
 * Handle auth errors gracefully
 */
export const handleAuthError = async (error) => {
  console.error('Auth error:', error);

  // If it's a 403 or 401, try to refresh the session
  if (error?.message?.includes('403') || error?.message?.includes('401')) {
    const { success } = await refreshSession();

    if (!success) {
      // Session refresh failed, need to re-authenticate
      await clearAuthData();
      window.location.href = '/login';
      return false;
    }

    return true;
  }

  return false;
};
