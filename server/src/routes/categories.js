import { Router } from 'express';
import { Category } from '../models/Category.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, categorySchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await Category.find().sort({ name: 1 });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', validate(categorySchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const data = await Category.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(categorySchema), async (req, res) => {
  try {
    const data = await Category.create(req.body);
    res.status(201).json(data.toObject());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(categorySchema.partial().pick({ id: true }), 'params'), validate(categorySchema.partial()), async (req, res) => {
  try {
    const data = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(categorySchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
