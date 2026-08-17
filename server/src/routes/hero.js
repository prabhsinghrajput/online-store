import { Router } from 'express';
import { HeroContent } from '../models/HeroContent.js';
import { leanWithId } from '../models/base.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, heroContentSchema } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = Router();

// GET /api/hero
router.get('/', cacheMiddleware(180, 'hero'), async (req, res) => {
  try {
    let content = await HeroContent.findOne().lean();
    if (!content) {
      // Create default
      const defaultDoc = await HeroContent.create({});
      content = defaultDoc.toObject();
    }
    res.json(leanWithId(content));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero content' });
  }
});

// PUT /api/hero
router.put('/', authenticateUser, requireAdmin, validate(heroContentSchema.partial()), async (req, res) => {
  try {
    let content = await HeroContent.findOne();
    if (!content) {
      content = new HeroContent({});
    }
    
    // Update fields
    Object.assign(content, req.body);
    await content.save();
    
    invalidateCache('hero');
    res.json(leanWithId(content.toObject()));
  } catch (error) {
    console.error('Update hero content error:', error);
    res.status(500).json({ error: 'Failed to update hero content' });
  }
});

export default router;
