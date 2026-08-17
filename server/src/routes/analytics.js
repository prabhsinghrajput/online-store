import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { leanWithId } from '../models/base.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

router.get('/', authenticateUser, requireAdmin, cacheMiddleware(30, 'analytics'), async (req, res) => {
  try {
    const [orders, products, categories] = await Promise.all([
      Order.find().sort({ created_at: -1 }).lean(),
      Product.find().lean(),
      Category.find().lean(),
    ]);

    const leanOrders = leanWithId(orders) || [];
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
    res.status(500).json({ error: error.message });
  }
});

export default router;
