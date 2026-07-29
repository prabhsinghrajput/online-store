import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { validate, orderSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
  try {
    const isAdmin = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).includes(req.user.email);

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_email', req.user.email);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    const isAdmin = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).includes(req.user.email);
    if (!isAdmin && data.user_email !== req.user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', authenticateUser, validate(orderSchema), async (req, res) => {
  try {
    const { items, shipping_address, customer_name, customer_phone, total_amount } = req.body;

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_email: req.user.email,
        customer_name,
        customer_phone,
        shipping_address,
        total_amount,
        status: 'pending',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_name: item.name,
      product_image: item.image || '',
      quantity: item.quantity,
      price: item.discounted_price || item.price,
      weight: item.weight || '',
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json(orderData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id/status', authenticateUser, async (req, res) => {
  try {
    const isAdmin = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).includes(req.user.email);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
