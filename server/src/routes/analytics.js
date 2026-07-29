import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*, category:categories(*)');

    if (productsError) throw productsError;

    res.json({ orders: orders || [], products: products || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
