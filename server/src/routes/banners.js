import { Router } from 'express';
import { Banner } from '../models/Banner.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, bannerSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await Banner.find().sort({ created_at: -1 });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

router.post('/', authenticateUser, requireAdmin, validate(bannerSchema), async (req, res) => {
  try {
    const data = await Banner.create(req.body);
    res.status(201).json(data.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/:id', authenticateUser, requireAdmin, validate(bannerSchema.partial().pick({ id: true }), 'params'), validate(bannerSchema.partial()), async (req, res) => {
  try {
    const data = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ error: 'Banner not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, validate(bannerSchema.partial().pick({ id: true }), 'params'), async (req, res) => {
  try {
    const result = await Banner.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

export default router;
