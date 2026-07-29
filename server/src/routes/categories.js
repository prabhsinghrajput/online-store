import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, categorySchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', validate(categorySchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(categorySchema), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(categorySchema.partial().pick({ id: true }), 'params'), validate(categorySchema.partial()), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(categorySchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
