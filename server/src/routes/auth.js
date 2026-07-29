import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/user', authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
