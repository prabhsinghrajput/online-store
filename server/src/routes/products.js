import { Router } from 'express';
import { Product } from '../models/Product.js';
import { leanWithId } from '../models/base.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, productSchema } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware(60, 'products'), async (req, res) => {
  try {
    const data = await Product.find().sort({ created_at: -1 }).lean();
    res.json(leanWithId(data) || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', validate(productSchema.partial().pick({ id: true }), 'params'), cacheMiddleware(60, 'products'), async (req, res) => {
  try {
    const data = await Product.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(leanWithId(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(productSchema), async (req, res) => {
  try {
    const data = await Product.create(req.body);
    invalidateCache('products');
    invalidateCache('analytics');
    res.status(201).json(data.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(productSchema.partial().pick({ id: true }), 'params'), validate(productSchema.partial()), async (req, res) => {
  try {
    const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ error: 'Product not found' });
    invalidateCache('products');
    invalidateCache('analytics');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(productSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    invalidateCache('products');
    invalidateCache('analytics');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
