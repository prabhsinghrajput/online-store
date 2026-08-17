import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { leanWithId } from '../models/base.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'Guest';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

router.get('/', authenticateUser, requireAdmin, cacheMiddleware(30, 'analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    } else {
      // Default to last 1 year of data to limit payload size
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filter.created_at = { $gte: oneYearAgo };
    }

    const [orders, products, categories] = await Promise.all([
      Order.find(filter)
        .select('_id created_at total_amount status items user_email')
        .sort({ created_at: -1 })
        .lean(),
      Product.find().lean(),
      Category.find().lean(),
    ]);

    const leanOrders = (leanWithId(orders) || []).map(order => ({
      ...order,
      user_email: maskEmail(order.user_email),
    }));
    const leanProducts = leanWithId(products) || [];
    const leanCategories = leanWithId(categories) || [];

    const categoriesById = new Map(leanCategories.map(c => [c._id, c]));

    const populatedProducts = leanProducts.map(p => {
      const copy = { ...p };
      if (p.category_id && categoriesById.has(p.category_id)) {
        copy.category = categoriesById.get(p.category_id);
      }
      return copy;
    });

    res.json({ orders: leanOrders, products: populatedProducts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
