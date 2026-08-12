import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET. Check your .env file.');
}

/**
 * Sign an access token for a user.
 */
export const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, tokenVersion: user.token_version ?? 0 },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Build the user object exposed to the rest of the app.
 * Keeps the same shape as the old Supabase user so the client
 * (`user.id`, `user.email`, `user.user_metadata.role`, `user.isAdmin`)
 * keeps working without changes.
 */
const buildUser = (doc) => {
  const user = {
    id: doc._id,
    email: doc.email,
    created_at: doc.created_at,
    last_sign_in_at: doc.last_sign_in_at,
    user_metadata: doc.user_metadata || {},
  };
  user.isAdmin = ADMIN_EMAILS.includes(user.email) || doc.role === 'admin';
  if (user.isAdmin) {
    user.user_metadata.role = 'admin';
    user.user_metadata.isAdmin = true;
  } else if (doc.role && doc.role !== 'user') {
    user.user_metadata.role = doc.role;
  }
  return user;
};

/**
 * Load user from token.
 * Returns { user } or { error }.
 */
const loadUserFromToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return { error: 'Invalid token' };
  }

  const doc = await User.findById(payload.id).lean();
  if (!doc) {
    return { error: 'Invalid token' };
  }

  // Tokens signed before this field existed carry no tokenVersion; only enforce
  // the check once logout has bumped the version, so legacy sessions stay valid.
  const docVersion = doc.token_version ?? 0;
  if (payload.tokenVersion !== undefined && payload.tokenVersion !== docVersion) {
    return { error: 'Invalid token' };
  }

  return { user: buildUser(doc) };
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
    const { user, error } = await loadUserFromToken(token);
    if (error || !user) {
      return res.status(401).json({ error });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Require admin role middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
};
