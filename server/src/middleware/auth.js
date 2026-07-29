import { supabaseAdmin } from '../db/supabase.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

/**
 * Check if a user email is in the admin list
 */
export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email);
};

/**
 * Authenticate user from Bearer token
 */
export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add admin role to user object for client-side checks
    user.isAdmin = isAdminEmail(user.email);
    if (user.isAdmin && !user.user_metadata) {
      user.user_metadata = {};
    }
    if (user.isAdmin) {
      user.user_metadata.role = 'admin';
      user.user_metadata.isAdmin = true;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      user.isAdmin = isAdminEmail(user.email);
      if (user.isAdmin) {
        user.user_metadata = user.user_metadata || {};
        user.user_metadata.role = 'admin';
        user.user_metadata.isAdmin = true;
      }
    }
    req.user = error ? null : user;
  } catch {
    req.user = null;
  }
  next();
};

/**
 * Require admin role middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
};

/**
 * Check if user owns a resource or is admin
 */
export const requireOwnershipOrAdmin = (getResourceOwner) => {
  return async (req, res, next) => {
    const resourceOwnerId = await getResourceOwner(req);

    if (isAdminEmail(req.user?.email)) {
      return next(); // Admin can access everything
    }

    if (req.user?.id !== resourceOwnerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
