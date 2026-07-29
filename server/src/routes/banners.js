import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, bannerSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(bannerSchema), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(bannerSchema.partial().pick({ id: true }), 'params'), validate(bannerSchema.partial()), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(bannerSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

export default router;
