import { Router } from 'express';
import { Product } from '../models/Product.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, productSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await Product.find().sort({ created_at: -1 });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', validate(productSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const data = await Product.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(productSchema), async (req, res) => {
  try {
    const data = await Product.create(req.body);
    res.status(201).json(data.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(productSchema.partial().pick({ id: true }), 'params'), validate(productSchema.partial()), async (req, res) => {
  try {
    const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(productSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
