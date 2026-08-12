import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authenticateUser, signToken } from '../middleware/auth.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Stricter rate limiting for auth endpoints (increased in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 1000, // 5 requests per 15 minutes for auth in production, 1000 in dev
  message: { error: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(100),
});

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'user',
      user_metadata: {},
    });

    const token = signToken(user);
    res.status(201).json({
      user: { id: user._id, email: user.email, created_at: user.created_at },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Sign in with email + password
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await User.updateOne({ _id: user._id }, { last_sign_in_at: new Date() });

    const token = signToken(user);
    res.json({
      user: { id: user._id, email: user.email, created_at: user.created_at, last_sign_in_at: user.last_sign_in_at },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

/**
 * GET /api/auth/user
 * Get the currently authenticated user
 */
router.get('/user', authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

/**
 * POST /api/auth/logout
 * Invalidate all tokens issued to the current user
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $inc: { token_version: 1 } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

export default router;
