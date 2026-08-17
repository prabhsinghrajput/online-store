import { Router } from 'express';
import { Review } from '../models/Review.js';
import { leanWithId } from '../models/base.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, reviewSchema } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = Router();

router.get('/:productId', cacheMiddleware(30, 'reviews'), async (req, res) => {
  try {
    const data = await Review.find({ product_id: req.params.productId }).sort({ created_at: -1 }).lean();
    res.json(leanWithId(data) || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', authenticateUser, validate(reviewSchema), async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    const existing = await Review.findOne({ product_id, user_id: req.user.id }).lean();

    let result;
    if (existing) {
      result = await Review.findByIdAndUpdate(
        existing._id,
        { rating, comment },
        { new: true, runValidators: true }
      );
    } else {
      result = await Review.create({
        product_id,
        user_id: req.user.id,
        user_email: req.user.email,
        rating,
        comment,
      });
      result = result.toObject();
    }

    invalidateCache('reviews');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Review.findByIdAndDelete(req.params.id);
    invalidateCache('reviews');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
