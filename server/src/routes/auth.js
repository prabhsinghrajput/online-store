import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authenticateUser, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
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
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(100)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(100),
});

const profileSchema = z.object({
  displayName: z.string().max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  address: z.string().max(500).trim().optional(),
  photoURL: z.string().url('Invalid URL').max(2048).optional(),
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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      user: { id: user._id, email: user.email, created_at: user.created_at },
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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
      user: { id: user._id, email: user.email, created_at: user.created_at, last_sign_in_at: user.last_sign_in_at },
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
 * PUT /api/auth/profile
 * Update profile details for the authenticated user
 */
router.put('/profile', authenticateUser, validate(profileSchema), async (req, res) => {
  try {
    const { displayName, phone, address, photoURL } = req.body;
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $set: {
          'user_metadata.displayName': displayName,
          'user_metadata.phone': phone,
          'user_metadata.address': address,
          'user_metadata.avatar_url': photoURL,
        }
      },
      { new: true }
    ).select('-password_hash').lean();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidate all tokens issued to the current user
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $inc: { token_version: 1 } });
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

export default router;
