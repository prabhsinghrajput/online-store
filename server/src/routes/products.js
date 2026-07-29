import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validate, productSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', validate(productSchema.partial(), 'params'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(productSchema), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(productSchema.partial(), 'params'), validate(productSchema.partial()), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(productSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
