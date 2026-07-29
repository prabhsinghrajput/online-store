import { supabaseAdmin } from '../db/supabase.js';

/**
 * Role-based access control middleware
 * Uses database instead of environment variables
 */

const ROLE_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user role from database (with caching)
 */
export const getUserRole = async (user) => {
  if (!user) return null;

  const cacheKey = user.id;
  const cached = ROLE_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('role, expires_at, is_active')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // Fallback to environment variable for backward compatibility
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
      const isAdmin = adminEmails.includes(user.email);

      const fallbackRole = isAdmin ? 'admin' : 'user';
      ROLE_CACHE.set(cacheKey, { role: fallbackRole, timestamp: Date.now() });
      return fallbackRole;
    }

    // Check if role is active and not expired
    if (!data.is_active) return 'user';
    if (data.expires_at && new Date(data.expires_at) < new Date()) return 'user';

    ROLE_CACHE.set(cacheKey, { role: data.role, timestamp: Date.now() });
    return data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

/**
 * Clear role cache (call after role changes)
 */
export const clearRoleCache = (userId) => {
  if (userId) {
    ROLE_CACHE.delete(userId);
  } else {
    ROLE_CACHE.clear();
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (user, role) => async () => {
  const userRole = await getUserRole(user);
  return userRole === role;
};

/**
 * Require specific role middleware
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = await getUserRole(req.user);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role required: ${allowedRoles.join(' or ')}`
      });
    }

    req.userRole = userRole;
    next();
  };
};

/**
 * Require admin middleware (convenience function)
 */
export const requireAdmin = requireRole('admin');

/**
 * Optional role check (adds role to request but doesn't block)
 */
export const attachRole = async (req, res, next) => {
  if (req.user) {
    req.userRole = await getUserRole(req.user);
    // Add to user metadata for client-side checks
    if (req.user.user_metadata) {
      req.user.user_metadata.role = req.userRole;
      req.user.user_metadata.isAdmin = req.userRole === 'admin';
    }
  }
  next();
};

/**
 * Check if user is admin (sync version for quick checks)
 * Uses cached data if available
 */
export const isAdminUser = async (user) => {
  const role = await getUserRole(user);
  return role === 'admin';
};
