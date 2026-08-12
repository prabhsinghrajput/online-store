import { Router } from 'express';
import { Order } from '../models/Order.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, orderSchema } from '../middleware/validation.js';

const router = Router();

const isAdminEmail = (email) => {
  return (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).includes(email);
};

router.get('/', authenticateUser, async (req, res) => {
  try {
    const isAdmin = isAdminEmail(req.user.email) || req.user.isAdmin;

    const filter = isAdmin ? {} : { user_email: req.user.email };
    const data = await Order.find(filter).sort({ created_at: -1 });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const data = await Order.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Order not found' });

    const isAdmin = isAdminEmail(req.user.email) || req.user.isAdmin;
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

    const orderItems = items.map(item => ({
      product_id: item.product_id || null,
      product_name: item.name,
      product_image: item.image || '',
      quantity: item.quantity,
      price: item.discounted_price || item.price,
      weight: item.weight || '',
    }));

    const order = await Order.create({
      user_email: req.user.email,
      customer_name,
      customer_phone,
      shipping_address,
      total_amount,
      status: 'pending',
      items: orderItems,
    });

    res.status(201).json(order.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id/status', authenticateUser, async (req, res) => {
  try {
    const isAdmin = isAdminEmail(req.user.email) || req.user.isAdmin;
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const data = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
