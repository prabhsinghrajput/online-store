import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, reviewSchema } from '../middleware/validation.js';

const router = Router();

router.get('/:productId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', authenticateUser, validate(reviewSchema), async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', product_id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ rating, comment })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .insert([{
          product_id,
          user_id: req.user.id,
          user_email: req.user.email,
          rating,
          comment,
        }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
